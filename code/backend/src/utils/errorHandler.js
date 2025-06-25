/**
 * errorHandler.js
 * Middleware Express pour la gestion centralisée des erreurs
 */

const { ValidationError, NotFoundError } = require('./errors');

function handleError(err, req, res, next) {
  // Erreur de validation personnalisée
  if (err instanceof ValidationError) {
    return res.status(err.status || 400).json({
      success: false,
      message: err.message,
      errors: err.errors || []
    });
  }

  // Erreur "not found" personnalisée
  if (err instanceof NotFoundError) {
    return res.status(err.status || 404).json({
      success: false,
      message: err.message
    });
  }

  // Erreur générée par express-validator
  if (err.errors && Array.isArray(err.errors)) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }

  // Erreur générique
  return res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
}

module.exports = { handleError };
