/**
 * Role controller for managing roles and permissions
 * 
 * This controller handles CRUD operations for roles and their associated permissions.
 */

const Role = require('../models/Role');
const Permission = require('../models/Permission');
const RolePermission = require('../models/RolePermission');
const AuditLog = require('../models/AuditLog');
const { validationResult } = require('express-validator');

class RoleController {
  /**
   * Get all roles with pagination, filtering and sorting
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRoles(req, res) {
    try {
      const { 
        page = 1, 
        limit = 25, 
        sortBy = 'name', 
        sortOrder = 'asc',
        search
      } = req.query;
      
      // Base query
      let query = Role.query()
        .withGraphFetched('permissions')
        .orderBy(sortBy, sortOrder)
        .page(page - 1, limit);
      
      // Apply tenant filter for multi-tenant
      if (req.tenantId) {
        query = query.where(builder => {
          builder.where('tenant_id', req.tenantId)
            .orWhere('is_system_role', true);
        });
      }
      
      // Apply search filter
      if (search) {
        query = query.where(builder => {
          builder.whereRaw('LOWER(name) LIKE ?', [`%${search.toLowerCase()}%`])
            .orWhereRaw('LOWER(description) LIKE ?', [`%${search.toLowerCase()}%`]);
        });
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
   * Get a single role by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRoleById(req, res) {
    try {
      const { id } = req.params;
      
      const role = await Role.query()
        .findById(id)
        .withGraphFetched('permissions');
      
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      // Check tenant access for multi-tenant
      if (req.tenantId && role.tenant_id !== req.tenantId && !role.is_system_role) {
        return res.status(403).json({ message: 'Access denied to this role' });
      }
      
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  /**
   * Create a new role
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createRole(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const {
        name,
        description,
        permissionIds = []
      } = req.body;
      
      // Check if role name already exists for this tenant
      const existingRole = await Role.query()
        .where('name', name)
        .where(builder => {
          if (req.tenantId) {
            builder.where('tenant_id', req.tenantId);
          }
        })
        .first();
        
      if (existingRole) {
        return res.status(400).json({ message: 'Role name already exists' });
      }
      
      // Create role in transaction
      const role = await Role.transaction(async trx => {
        // Create role
        const newRole = await Role.query(trx).insert({
          name,
          description,
          tenant_id: req.tenantId,
          is_system_role: false,
          created_by: req.user ? req.user.id : null
        });
        
        // Assign permissions
        if (permissionIds.length > 0) {
          const rolePermissions = permissionIds.map(permissionId => ({
            role_id: newRole.id,
            permission_id: permissionId,
            granted_by: req.user ? req.user.id : null
          }));
          
          await RolePermission.query(trx).insert(rolePermissions);
        }
        
        return newRole;
      });
      
      // Log the action
      if (req.user) {
        await AuditLog.query().insert({
          user_id: req.user.id,
          tenant_id: req.tenantId,
          action: 'CREATE',
          entity_type: 'Role',
          entity_id: role.id,
          description: `Role ${role.name} created`,
          ip_address: req.ip,
          user_agent: req.headers['user-agent'],
          action_timestamp: new Date().toISOString()
        });
      }
      
      // Return the created role with permissions
      const roleWithPermissions = await Role.query()
        .findById(role.id)
        .withGraphFetched('permissions');
      
      res.status(201).json(roleWithPermissions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  /**
   * Update an existing role
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateRole(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { id } = req.params;
      const {
        name,
        description,
        permissionIds
      } = req.body;
      
      // Check if role exists
      const existingRole = await Role.query().findById(id);
      if (!existingRole) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      // Check tenant access for multi-tenant
      if (req.tenantId && existingRole.tenant_id !== req.tenantId) {
        return res.status(403).json({ message: 'Access denied to this role' });
      }
      
      // Don't allow updating system roles
      if (existingRole.is_system_role) {
        return res.status(403).json({ message: 'Cannot modify system roles' });
      }
      
      // Check if new name already exists for another role
      if (name && name !== existingRole.name) {
        const duplicateRole = await Role.query()
          .where('name', name)
          .where('id', '!=', id)
          .where(builder => {
            if (req.tenantId) {
              builder.where('tenant_id', req.tenantId);
            }
          })
          .first();
          
        if (duplicateRole) {
          return res.status(400).json({ message: 'Role name already exists' });
        }
      }
      
      // Update role in transaction
      const role = await Role.transaction(async trx => {
        // Update role
        const updatedRole = await Role.query(trx)
          .findById(id)
          .patch({
            name,
            description,
            updated_by: req.user ? req.user.id : null
          })
          .returning('*');
        
        // Update permissions if provided
        if (permissionIds) {
          // Delete existing permissions
          await RolePermission.query(trx)
            .where('role_id', id)
            .delete();
          
          // Assign new permissions
          if (permissionIds.length > 0) {
            const rolePermissions = permissionIds.map(permissionId => ({
              role_id: id,
              permission_id: permissionId,
              granted_by: req.user ? req.user.id : null
            }));
            
            await RolePermission.query(trx).insert(rolePermissions);
          }
        }
        
        return updatedRole;
      });
      
      // Log the action
      if (req.user) {
        await AuditLog.query().insert({
          user_id: req.user.id,
          tenant_id: req.tenantId,
          action: 'UPDATE',
          entity_type: 'Role',
          entity_id: id,
          description: `Role ${existingRole.name} updated`,
          ip_address: req.ip,
          user_agent: req.headers['user-agent'],
          action_timestamp: new Date().toISOString()
        });
      }
      
      // Return the updated role with permissions
      const roleWithPermissions = await Role.query()
        .findById(id)
        .withGraphFetched('permissions');
      
      res.json(roleWithPermissions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  /**
   * Delete a role
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteRole(req, res) {
    try {
      const { id } = req.params;
      
      // Check if role exists
      const existingRole = await Role.query().findById(id);
      if (!existingRole) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      // Check tenant access for multi-tenant
      if (req.tenantId && existingRole.tenant_id !== req.tenantId) {
        return res.status(403).json({ message: 'Access denied to this role' });
      }
      
      // Don't allow deleting system roles
      if (existingRole.is_system_role) {
        return res.status(403).json({ message: 'Cannot delete system roles' });
      }
      
      // Check if role is assigned to any users
      const userCount = await existingRole.$relatedQuery('users').resultSize();
      if (userCount > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete role that is assigned to users',
          userCount
        });
      }
      
      // Delete role in transaction
      await Role.transaction(async trx => {
        // Delete role permissions
        await RolePermission.query(trx)
          .where('role_id', id)
          .delete();
        
        // Delete role
        await Role.query(trx)
          .deleteById(id);
      });
      
      // Log the action
      if (req.user) {
        await AuditLog.query().insert({
          user_id: req.user.id,
          tenant_id: req.tenantId,
          action: 'DELETE',
          entity_type: 'Role',
          entity_id: id,
          description: `Role ${existingRole.name} deleted`,
          ip_address: req.ip,
          user_agent: req.headers['user-agent'],
          action_timestamp: new Date().toISOString()
        });
      }
      
      res.json({ message: 'Role deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  /**
   * Get role permissions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRolePermissions(req, res) {
    try {
      const { id } = req.params;
      
      // Check if role exists
      const existingRole = await Role.query().findById(id);
      if (!existingRole) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      // Check tenant access for multi-tenant
      if (req.tenantId && existingRole.tenant_id !== req.tenantId && !existingRole.is_system_role) {
        return res.status(403).json({ message: 'Access denied to this role' });
      }
      
      const permissions = await Permission.query()
        .select('permissions.*')
        .join('role_permissions', 'permissions.id', 'role_permissions.permission_id')
        .where('role_permissions.role_id', id);
      
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  /**
   * Update role permissions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateRolePermissions(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { id } = req.params;
      const { permissionIds } = req.body;
      
      // Check if role exists
      const existingRole = await Role.query().findById(id);
      if (!existingRole) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      // Check tenant access for multi-tenant
      if (req.tenantId && existingRole.tenant_id !== req.tenantId) {
        return res.status(403).json({ message: 'Access denied to this role' });
      }
      
      // Don't allow updating system roles
      if (existingRole.is_system_role) {
        return res.status(403).json({ message: 'Cannot modify system roles' });
      }
      
      // Update permissions in transaction
      await Role.transaction(async trx => {
        // Delete existing permissions
        await RolePermission.query(trx)
          .where('role_id', id)
          .delete();
        
        // Assign new permissions
        if (permissionIds && permissionIds.length > 0) {
          const rolePermissions = permissionIds.map(permissionId => ({
            role_id: id,
            permission_id: permissionId,
            granted_by: req.user ? req.user.id : null
          }));
          
          await RolePermission.query(trx).insert(rolePermissions);
        }
      });
      
      // Log the action
      if (req.user) {
        await AuditLog.query().insert({
          user_id: req.user.id,
          tenant_id: req.tenantId,
          action: 'UPDATE',
          entity_type: 'RolePermissions',
          entity_id: id,
          description: `Permissions updated for role ${existingRole.name}`,
          ip_address: req.ip,
          user_agent: req.headers['user-agent'],
          action_timestamp: new Date().toISOString()
        });
      }
      
      // Return the updated permissions
      const permissions = await Permission.query()
        .select('permissions.*')
        .join('role_permissions', 'permissions.id', 'role_permissions.permission_id')
        .where('role_permissions.role_id', id);
      
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  /**
   * Get all permissions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllPermissions(req, res) {
    try {
      const permissions = await Permission.query()
        .orderBy('module')
        .orderBy('name');
      
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  /**
   * Get permissions grouped by module
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPermissionsByModule(req, res) {
    try {
      const permissions = await Permission.query()
        .orderBy('module')
        .orderBy('name');
      
      // Group permissions by module
      const groupedPermissions = permissions.reduce((acc, permission) => {
        if (!acc[permission.module]) {
          acc[permission.module] = [];
        }
        acc[permission.module].push(permission);
        return acc;
      }, {});
      
      res.json(groupedPermissions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new RoleController();
