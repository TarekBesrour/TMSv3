/**
 * Authentication controller for handling auth-related requests
 * 
 * This controller handles login, registration, password reset, and other
 * authentication-related endpoints.
 */

const AuthService = require('../services/AuthService');
const User = require('../models/User');
const UserPreference = require('../models/UserPreference');
const { validationResult } = require('express-validator');

class AuthController {
  /**
   * Login a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await AuthService.authenticate(email, password, ipAddress, userAgent);

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        user: result.user,
        accessToken: result.accessToken
      });
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, firstName, lastName, tenantId } = req.body;

      // Check if email already exists
      const existingUser = await User.query().where('email', email).first();
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      // Hash password
      const passwordHash = await User.hashPassword(password);

      // Create user in transaction
      const user = await User.transaction(async trx => {
        // Create user
        const newUser = await User.query(trx).insert({
          email,
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName,
          tenant_id: tenantId,
          status: 'pending' // Require email verification
        });

        // Create default preferences
        await UserPreference.query(trx).insert({
          user_id: newUser.id
        });

        return newUser;
      });

      // TODO: Send verification email

      res.status(201).json({
        message: 'User registered successfully',
        userId: user.id
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Refresh access token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }

      const result = await AuthService.refreshAccessToken(refreshToken);

      res.json({
        user: result.user,
        accessToken: result.accessToken
      });
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  /**
   * Logout a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logout(req, res) {
    try {
      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      // Log the logout event if user is authenticated
      if (req.user) {
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];

        await AuthService.logAuditEvent(
          req.user.id,
          req.user.tenant_id,
          'LOGOUT',
          'User',
          req.user.id,
          'User logged out',
          ipAddress,
          userAgent
        );
      }

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Request password reset
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async forgotPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;
      const result = await AuthService.requestPasswordReset(email);

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Reset password with token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async resetPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token, password } = req.body;
      const result = await AuthService.resetPassword(token, password);

      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Change password (authenticated)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const result = await AuthService.changePassword(userId, currentPassword, newPassword);

      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Get current user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async me(req, res) {
    try {
      // User is already attached to req by auth middleware
      const user = await User.query()
        .findById(req.user.id)
        .withGraphFetched('roles.permissions')
        .withGraphFetched('preferences');

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new AuthController();
