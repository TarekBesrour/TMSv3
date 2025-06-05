/**
 * Authentication routes for the TMS API
 * 
 * This file defines all routes related to authentication and user management.
 */

const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');
const RoleController = require('../controllers/RoleController');
const { authenticate, hasRole, hasPermission } = require('../middlewares/authMiddleware');

const router = express.Router();

// Authentication routes
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isString().notEmpty().withMessage('Password is required')
], AuthController.login);

router.post('/register', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').isString().notEmpty().withMessage('First name is required'),
  body('lastName').isString().notEmpty().withMessage('Last name is required')
], AuthController.register);

router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required')
], AuthController.forgotPassword);

router.post('/reset-password', [
  body('token').isString().notEmpty().withMessage('Token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], AuthController.resetPassword);

router.post('/change-password', authenticate, [
  body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], AuthController.changePassword);

router.get('/me', authenticate, AuthController.me);

// User management routes
router.get('/users', authenticate, hasPermission('user:read'), UserController.getUsers);
router.post('/users', authenticate, hasPermission('user:create'), [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').isString().notEmpty().withMessage('First name is required'),
  body('lastName').isString().notEmpty().withMessage('Last name is required')
], UserController.createUser);

router.get('/users/:id', authenticate, hasPermission('user:read'), UserController.getUserById);
router.put('/users/:id', authenticate, hasPermission('user:update'), [
  body('firstName').optional().isString().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().isString().notEmpty().withMessage('Last name cannot be empty'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'locked']).withMessage('Invalid status')
], UserController.updateUser);

router.delete('/users/:id', authenticate, hasPermission('user:delete'), UserController.deleteUser);
router.get('/users/:id/roles', authenticate, hasPermission('user:read'), UserController.getUserRoles);
router.put('/users/:id/roles', authenticate, hasPermission('user:update'), [
  body('roleIds').isArray().withMessage('Role IDs must be an array')
], UserController.updateUserRoles);

router.get('/users/:id/audit-logs', authenticate, hasPermission('audit:read'), UserController.getUserAuditLogs);

// Role management routes
router.get('/roles', authenticate, hasPermission('role:read'), RoleController.getRoles);
router.post('/roles', authenticate, hasPermission('role:create'), [
  body('name').isString().notEmpty().withMessage('Role name is required'),
  body('description').isString().notEmpty().withMessage('Description is required')
], RoleController.createRole);

router.get('/roles/:id', authenticate, hasPermission('role:read'), RoleController.getRoleById);
router.put('/roles/:id', authenticate, hasPermission('role:update'), [
  body('name').optional().isString().notEmpty().withMessage('Role name cannot be empty'),
  body('description').optional().isString().notEmpty().withMessage('Description cannot be empty')
], RoleController.updateRole);

router.delete('/roles/:id', authenticate, hasPermission('role:delete'), RoleController.deleteRole);
router.get('/roles/:id/permissions', authenticate, hasPermission('role:read'), RoleController.getRolePermissions);
router.put('/roles/:id/permissions', authenticate, hasPermission('role:update'), [
  body('permissionIds').isArray().withMessage('Permission IDs must be an array')
], RoleController.updateRolePermissions);

// Permission routes
router.get('/permissions', authenticate, hasPermission('permission:read'), RoleController.getAllPermissions);
router.get('/permissions/by-module', authenticate, hasPermission('permission:read'), RoleController.getPermissionsByModule);

module.exports = router;
