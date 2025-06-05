/**
 * Authentication service for user authentication and token management
 * 
 * This service handles user authentication, JWT generation and validation,
 * and related security functions.
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/User');
const UserRole = require('../models/UserRole');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const AuditLog = require('../models/AuditLog');
const config = require('../config/auth.config');

class AuthService {
  /**
   * Authenticate a user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} ipAddress - IP address of the request
   * @param {string} userAgent - User agent of the request
   * @returns {Object} Authentication result with user and tokens
   */
  async authenticate(email, password, ipAddress, userAgent) {
    // Find user by email
    const user = await User.query()
      .where('email', email)
      .first();
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      throw new Error(`Account is ${user.status}. Please contact an administrator.`);
    }
    
    // Verify password
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      await User.query()
        .findById(user.id)
        .patch({
          failed_login_attempts: user.failed_login_attempts + 1,
          updated_at: new Date().toISOString()
        });
      
      // Lock account after too many failed attempts
      if (user.failed_login_attempts + 1 >= config.maxFailedLoginAttempts) {
        await User.query()
          .findById(user.id)
          .patch({
            status: 'locked',
            updated_at: new Date().toISOString()
          });
        
        // Log account lock
        await this.logAuditEvent(user.id, user.tenant_id, 'ACCOUNT_LOCKED', 'User', user.id, 
          'Account locked due to too many failed login attempts', ipAddress, userAgent);
        
        throw new Error('Account locked due to too many failed login attempts. Please contact an administrator.');
      }
      
      throw new Error('Invalid email or password');
    }
    
    // Reset failed login attempts on successful login
    await User.query()
      .findById(user.id)
      .patch({
        failed_login_attempts: 0,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    // Get user roles and permissions
    const userWithRoles = await User.query()
      .findById(user.id)
      .withGraphFetched('roles.permissions')
      .withGraphFetched('preferences');
    
    // Generate tokens
    const accessToken = this.generateAccessToken(userWithRoles);
    const refreshToken = this.generateRefreshToken(userWithRoles);
    
    // Log successful login
    await this.logAuditEvent(user.id, user.tenant_id, 'LOGIN', 'User', user.id, 
      'User logged in successfully', ipAddress, userAgent);
    
    return {
      user: userWithRoles,
      accessToken,
      refreshToken
    };
  }
  
  /**
   * Generate a JWT access token for a user
   * @param {Object} user - User object
   * @returns {string} JWT access token
   */
  generateAccessToken(user) {
    // Extract permissions from roles
    const permissions = new Set();
    if (user.roles) {
      user.roles.forEach(role => {
        if (role.permissions) {
          role.permissions.forEach(permission => {
            permissions.add(permission.code);
          });
        }
      });
    }
    
    // Create payload
    const payload = {
      sub: user.id,
      email: user.email,
      tenant_id: user.tenant_id,
      roles: user.roles ? user.roles.map(role => role.name) : [],
      permissions: Array.from(permissions),
      type: 'access'
    };
    
    // Generate token
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });
  }
  
  /**
   * Generate a JWT refresh token for a user
   * @param {Object} user - User object
   * @returns {string} JWT refresh token
   */
  generateRefreshToken(user) {
    // Create payload
    const payload = {
      sub: user.id,
      type: 'refresh'
    };
    
    // Generate token
    return jwt.sign(payload, config.refreshTokenSecret, {
      expiresIn: config.refreshTokenExpiresIn
    });
  }
  
  /**
   * Verify and decode a JWT token
   * @param {string} token - JWT token
   * @param {string} type - Token type ('access' or 'refresh')
   * @returns {Object} Decoded token payload
   */
  verifyToken(token, type = 'access') {
    try {
      const secret = type === 'access' ? config.jwtSecret : config.refreshTokenSecret;
      const decoded = jwt.verify(token, secret);
      
      // Verify token type
      if (decoded.type !== type) {
        throw new Error('Invalid token type');
      }
      
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }
  
  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - JWT refresh token
   * @returns {Object} New access token and user info
   */
  async refreshAccessToken(refreshToken) {
    // Verify refresh token
    const decoded = this.verifyToken(refreshToken, 'refresh');
    
    // Get user
    const user = await User.query()
      .findById(decoded.sub)
      .withGraphFetched('roles.permissions')
      .withGraphFetched('preferences');
    
    if (!user || user.status !== 'active') {
      throw new Error('Invalid refresh token');
    }
    
    // Generate new access token
    const accessToken = this.generateAccessToken(user);
    
    return {
      user,
      accessToken
    };
  }
  
  /**
   * Request password reset for a user
   * @param {string} email - User email
   * @returns {Object} Result with reset token
   */
  async requestPasswordReset(email) {
    // Find user by email
    const user = await User.query()
      .where('email', email)
      .first();
    
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return { message: 'If your email is registered, you will receive a password reset link.' };
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token valid for 1 hour
    
    // Save reset token to user
    await User.query()
      .findById(user.id)
      .patch({
        password_reset_token: resetToken,
        password_reset_expires_at: resetTokenExpiry.toISOString(),
        updated_at: new Date().toISOString()
      });
    
    return {
      message: 'If your email is registered, you will receive a password reset link.',
      // In a real implementation, we would send an email with the reset link
      // For development purposes, we return the token
      resetToken,
      userId: user.id
    };
  }
  
  /**
   * Reset user password with reset token
   * @param {string} token - Password reset token
   * @param {string} newPassword - New password
   * @returns {Object} Result of password reset
   */
  async resetPassword(token, newPassword) {
    // Find user by reset token
    const user = await User.query()
      .where('password_reset_token', token)
      .where('password_reset_expires_at', '>', new Date().toISOString())
      .first();
    
    if (!user) {
      throw new Error('Invalid or expired password reset token');
    }
    
    // Hash new password
    const passwordHash = await User.hashPassword(newPassword);
    
    // Update user password and clear reset token
    await User.query()
      .findById(user.id)
      .patch({
        password_hash: passwordHash,
        password_reset_token: null,
        password_reset_expires_at: null,
        updated_at: new Date().toISOString()
      });
    
    return { message: 'Password has been reset successfully' };
  }
  
  /**
   * Change user password
   * @param {number} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} Result of password change
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Find user
    const user = await User.query().findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify current password
    const isPasswordValid = await user.verifyPassword(currentPassword);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Hash new password
    const passwordHash = await User.hashPassword(newPassword);
    
    // Update user password
    await User.query()
      .findById(userId)
      .patch({
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      });
    
    return { message: 'Password changed successfully' };
  }
  
  /**
   * Log an audit event
   * @param {number} userId - User ID
   * @param {number} tenantId - Tenant ID
   * @param {string} action - Action performed
   * @param {string} entityType - Type of entity
   * @param {string|number} entityId - ID of entity
   * @param {string} description - Description of the event
   * @param {string} ipAddress - IP address
   * @param {string} userAgent - User agent
   * @returns {Object} Created audit log
   */
  async logAuditEvent(userId, tenantId, action, entityType, entityId, description, ipAddress, userAgent) {
    return AuditLog.query().insert({
      user_id: userId,
      tenant_id: tenantId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      description,
      ip_address: ipAddress,
      user_agent: userAgent,
      action_timestamp: new Date().toISOString()
    });
  }
}

module.exports = new AuthService();
