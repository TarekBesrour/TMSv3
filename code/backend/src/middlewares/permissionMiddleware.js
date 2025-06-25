// src/middlewares/permissionMiddleware.js

// Middleware de vérification de permission (squelette minimal)
function checkPermission(permission) {
  return (req, res, next) => {
    // À compléter avec la logique réelle de vérification des permissions
    next();
  };
}

module.exports = { checkPermission };