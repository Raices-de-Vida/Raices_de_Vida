/**
 * Configuración centralizada para pruebas de seguridad
 */

const securityConfig = {
  limits: {
    maxRequestSize: '1mb',
    maxFieldLength: 255,
    maxPasswordLength: 128,
    maxEmailLength: 255,
    maxLoginAttempts: 5,
    rateLimitWindow: 15 * 60 * 1000,
    maxConnections: 100,
    sessionTimeout: 24 * 60 * 60 * 1000,
  },

  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: false,
    requireLowercase: true,
    requireNumbers: false,
    requireSpecialChars: false,
    maxAttempts: 5,
    lockoutDuration: 30 * 60 * 1000,
  },

  jwt: {
    expirationTime: '24h',
    algorithm: 'HS256',
    issuer: 'raices-de-vida',
    audience: 'raices-app',
    minSecretLength: 32,
  },

  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },

  validation: {
    enableStrictMode: true,
    sanitizeInput: true,
    validateContentType: true,
    maxArrayLength: 100,
    maxObjectDepth: 5,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },

  logging: {
    logFailedAttempts: true,
    logSuspiciousActivity: true,
    logSensitiveOperations: true,
    maskSensitiveData: true,
    maxLogFileSize: '10MB',
    logRetentionDays: 90,
  },

  autoTests: [
    'auth.security.test.js',
    'input.validation.test.js',
    'basic.security.test.js'
  ],

  manualTests: [
    'penetration.manual.test.js',
    'infrastructure.manual.test.js'
  ],

  alerts: {
    enabled: true,
    criticalThreshold: 5,
    emailNotifications: false,
    webhookUrl: null,
  }
};

module.exports = securityConfig;
