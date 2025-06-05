/**
 * Configuration file for authentication settings
 * 
 * This file contains all configuration parameters related to authentication,
 * JWT tokens, and security settings.
 */

module.exports = {
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'tms-jwt-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'tms-refresh-token-secret-key-change-in-production',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  
  // Password security
  saltRounds: 12,
  maxFailedLoginAttempts: 5,
  
  // Token settings
  accessTokenCookieName: 'accessToken',
  refreshTokenCookieName: 'refreshToken',
  
  // CORS settings
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // Security headers
  securityHeaders: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    xssProtection: '1; mode=block',
    noSniff: true,
    frameOptions: 'DENY',
    permissionsPolicy: {
      features: {
        geolocation: ["'self'"],
        camera: ["'none'"],
        microphone: ["'none'"],
        speaker: ["'none'"],
        fullscreen: ["'self'"],
      },
    },
  },
  
  // Cookie settings
  cookieSettings: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
};
