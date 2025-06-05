/**
 * User controller for managing users in the system
 * 
 * This controller handles CRUD operations for users and related entities
 * such as roles and permissions.
 */

const User = require('../models/User');
const Role = require('../models/Role');
const UserRole = require('../models/UserRole');
const UserPreference = require('../models/UserPreference');
const AuditLog = require('../models/AuditLog');
const { validationResult } = require('express-validator');

class UserController {
  /**
   * Get all users with pagination, filtering and sorting
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUsers(req, res) {
    try {
      const { 
        page = 1, 
        limit = 25, 
        sortBy = 'created_at', 
        sortOrder = 'desc',
        status,
        search,
        role
      } = req.query;
      
      // Base query
      let query = User.query()
        .withGraphFetched('roles')
        .orderBy(sortBy, sortOrder)
        .page(page - 1, limit);
      
      // Apply tenant filter for multi-tenant
      if (req.tenantId) {
        query = query.where('tenant_id', req.tenantId);
      }
      
      // Apply filters
      if (status) {
        query = query.where('status', status);
      }
      
      if (search) {
        query = query.where(builder => {
          builder.whereRaw('LOWER(first_name) LIKE ?', [`%${search.toLowerCase()}%`])
            .orWhereRaw('LOWER(last_name) LIKE ?', [`%${search.toLowerCase()}%`])
            .orWhereRaw('LOWER(email) LIKE ?', [`%${search.toLowerCase()}%`]);
        });
      }
      
      // Filter by role if provided
      if (role) {
        query = query.whereExists(
          UserRole.query()
            .whereRaw('user_roles.user_id = users.id')
            .join('roles', 'user_roles.role_id', 'roles.id')
            .where('roles.name', role)
        );
      }
      
      const result = await query;
      
      res.json({
        data: result.results,
        pagination: {
          total: result.total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  /**
   * Get a single user by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      
      const user = await User.query()
        .findById(id)
        .withGraphFetched('roles')
        .withGraphFetched('preferences');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check tenant access for multi-tenant
      if (req.tenantId && user.tenant_id !== req.tenantId) {
        return res.status(403).json({ message: 'Access denied to this user' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  /**
   * Create a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const {
        email,
        password,
        firstName,
        lastName,
        phone,
        jobTitle,
        status = 'active',
        roleIds = [],
        preferences = {}
      } = req.body;
      
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
          phone,
          job_title: jobTitle,
          status,
          tenant_id: req.tenantId || req.body.tenantId,
          created_by: req.user ? req.user.id : null
        });
        
        // Assign roles
        if (roleIds.length > 0) {
          const userRoles = roleIds.map(roleId => ({
            user_id: newUser.id,
            role_id: roleId,
            assigned_by: req.user ? req.user.id : null,
            tenant_id: req.tenantId || req.body.tenantId
          }));
          
          await UserRole.query(trx).insert(userRoles);
        }
        
        // Create preferences
        await UserPreference.query(trx).insert({
          user_id: newUser.id,
          ...preferences
        });
        
        return newUser;
      });
      
      // Log the action
      if (req.user) {
        await AuditLog.query().insert({
          user_id: req.user.id,
          tenant_id: req.tenantId,
          action: 'CREATE',
          entity_type: 'User',
          entity_id: user.id,
          description: `User ${user.email} created`,
          ip_address: req.ip,
          user_agent: req.headers['user-agent'],
          action_timestamp: new Date().toISOString()
        });
      }
      
      // Return the created user with roles
      const userWithRoles = await User.query()
        .findById(user.id)
        .withGraphFetched('roles')
        .withGraphFetched('preferences');
      
      res.status(201).json(userWithRoles);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  /**
   * Update an existing user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { id } = req.params;
      const {
        firstName,
        lastName,
        phone,
        jobTitle,
        status,
        roleIds,
        preferences
      } = req.body;
      
      // Check if user exists
      const existingUser = await User.query().findById(id);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check tenant access for multi-tenant
      if (req.tenantId && existingUser.tenant_id !== req.tenantId) {
        return res.status(403).json({ message: 'Access denied to this user' });
      }
      
      // Update user in transaction
      const user = await User.transaction(async trx => {
        // Update user
        const updatedUser = await User.query(trx)
          .findById(id)
          .patch({
            first_name: firstName,
            last_name: lastName,
            phone,
            job_title: jobTitle,
            status,
            updated_by: req.user ? req.user.id : null
          })
          .returning('*');
        
        // Update roles if provided
        if (roleIds) {
          // Delete existing roles
          await UserRole.query(trx)
            .where('user_id', id)
            .delete();
          
          // Assign new roles
          if (roleIds.length > 0) {
            const userRoles = roleIds.map(roleId => ({
              user_id: id,
              role_id: roleId,
              assigned_by: req.user ? req.user.id : null,
              tenant_id: req.tenantId || existingUser.tenant_id
            }));
            
            await UserRole.query(trx).insert(userRoles);
          }
        }
        
        // Update preferences if provided
        if (preferences) {
          await UserPreference.query(trx)
            .where('user_id', id)
            .patch(preferences);
        }
        
        return updatedUser;
      });
      
      // Log the action
      if (req.user) {
        await AuditLog.query().insert({
          user_id: req.user.id,
          tenant_id: req.tenantId,
          action: 'UPDATE',
          entity_type: 'User',
          entity_id: id,
          description: `User ${existingUser.email} updated`,
          ip_address: req.ip,
          user_agent: req.headers['user-agent'],
          action_timestamp: new Date().toISOString()
        });
      }
      
      // Return the updated user with roles
      const userWithRoles = await User.query()
        .findById(id)
        .withGraphFetched('roles')
        .withGraphFetched('preferences');
      
      res.json(userWithRoles);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  /**
   * Delete (deactivate) a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      // Check if user exists
      const existingUser = await User.query().findById(id);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check tenant access for multi-tenant
      if (req.tenantId && existingUser.tenant_id !== req.tenantId) {
        return res.status(403).json({ message: 'Access denied to this user' });
      }
      
      // Don't allow deleting yourself
      if (req.user && req.user.id === parseInt(id)) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }
      
      // Soft delete by setting status to inactive
      await User.query()
        .findById(id)
        .patch({
          status: 'inactive',
          updated_by: req.user ? req.user.id : null
        });
      
      // Log the action
      if (req.user) {
        await AuditLog.query().insert({
          user_id: req.user.id,
          tenant_id: req.tenantId,
          action: 'DELETE',
          entity_type: 'User',
          entity_id: id,
          description: `User ${existingUser.email} deactivated`,
          ip_address: req.ip,
          user_agent: req.headers['user-agent'],
          action_timestamp: new Date().toISOString()
        });
      }
      
      res.json({ message: 'User deactivated successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  /**
   * Get user roles
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserRoles(req, res) {
    try {
      const { id } = req.params;
      
      // Check if user exists
      const existingUser = await User.query().findById(id);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check tenant access for multi-tenant
      if (req.tenantId && existingUser.tenant_id !== req.tenantId) {
        return res.status(403).json({ message: 'Access denied to this user' });
      }
      
      const roles = await Role.query()
        .select('roles.*')
        .join('user_roles', 'roles.id', 'user_roles.role_id')
        .where('user_roles.user_id', id);
      
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  /**
   * Update user roles
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateUserRoles(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { id } = req.params;
      const { roleIds } = req.body;
      
      // Check if user exists
      const existingUser = await User.query().findById(id);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check tenant access for multi-tenant
      if (req.tenantId && existingUser.tenant_id !== req.tenantId) {
        return res.status(403).json({ message: 'Access denied to this user' });
      }
      
      // Update roles in transaction
      await User.transaction(async trx => {
        // Delete existing roles
        await UserRole.query(trx)
          .where('user_id', id)
          .delete();
        
        // Assign new roles
        if (roleIds && roleIds.length > 0) {
          const userRoles = roleIds.map(roleId => ({
            user_id: id,
            role_id: roleId,
            assigned_by: req.user ? req.user.id : null,
            tenant_id: req.tenantId || existingUser.tenant_id
          }));
          
          await UserRole.query(trx).insert(userRoles);
        }
      });
      
      // Log the action
      if (req.user) {
        await AuditLog.query().insert({
          user_id: req.user.id,
          tenant_id: req.tenantId,
          action: 'UPDATE',
          entity_type: 'UserRoles',
          entity_id: id,
          description: `Roles updated for user ${existingUser.email}`,
          ip_address: req.ip,
          user_agent: req.headers['user-agent'],
          action_timestamp: new Date().toISOString()
        });
      }
      
      // Return the updated roles
      const roles = await Role.query()
        .select('roles.*')
        .join('user_roles', 'roles.id', 'user_roles.role_id')
        .where('user_roles.user_id', id);
      
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  /**
   * Get user audit logs
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getUserAuditLogs(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 25 } = req.query;
      
      // Check if user exists
      const existingUser = await User.query().findById(id);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check tenant access for multi-tenant
      if (req.tenantId && existingUser.tenant_id !== req.tenantId) {
        return res.status(403).json({ message: 'Access denied to this user' });
      }
      
      const result = await AuditLog.query()
        .where('user_id', id)
        .orderBy('action_timestamp', 'desc')
        .page(page - 1, limit);
      
      res.json({
        data: result.results,
        pagination: {
          total: result.total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new UserController();
