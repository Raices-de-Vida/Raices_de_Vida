/**
 * Configuración centralizada para comunicación segura, encriptación y monitoreo
 */

module.exports = {
  //config de HTTPS/TLS
  ssl: {
    enabled: process.env.NODE_ENV === 'production',
    keyPath: process.env.SSL_KEY_PATH || './certs/private.key',
    certPath: process.env.SSL_CERT_PATH || './certs/certificate.crt',
    caPath: process.env.SSL_CA_PATH || './certs/ca_bundle.crt',
    minimumTlsVersion: 'TLSv1.2',
    ciphers: [
      'TLS_AES_256_GCM_SHA384',
      'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_AES_128_GCM_SHA256',
      'ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-RSA-AES128-GCM-SHA256'
    ].join(':'),
    honorCipherOrder: true,
    secureProtocol: 'TLSv1_2_method'
  },

  // Config de Encriptación
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32, // 256 bits
    ivLength: 12,  // 96 bits para GCM
    tagLength: 16, // 128 bits
    saltLength: 16,
    iterations: 100000, // PBKDF2 iterations
    
    //campos que deben ser encriptados
    sensitiveFields: [
      'dpi',
      'telefono',
      'phone',
      'direccion',
      'address',
      'coordenadas_gps',
      'numero_cuenta',
      'tarjeta_credito'
    ],

    //congif de claves
    keys: {
      master: process.env.ENCRYPTION_MASTER_KEY || 'default-key-change-in-production',
      rotation: process.env.KEY_ROTATION_INTERVAL || '7d', // Rotar cada 7 días
      backup: process.env.ENCRYPTION_BACKUP_KEY || 'backup-key-change-in-production'
    }
  },

  // Rate Limiting Avanzado
  rateLimiting: {
    // Límites por endpoint
    endpoints: {
      '/api/auth/login': {
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 5, // 5 intentos por IP
        skipSuccessfulRequests: true,
        standardHeaders: true,
        legacyHeaders: false
      },
      '/api/auth/register': {
        windowMs: 60 * 60 * 1000, // 1 hora
        max: 3, // 3 registros por IP por hora
        skipSuccessfulRequests: true
      },
      '/api/alertas': {
        windowMs: 10 * 60 * 1000, // 10 minutos
        max: 50, // 50 alertas por IP por 10 min
        skipSuccessfulRequests: false
      },
      '/api/casos': {
        windowMs: 5 * 60 * 1000, // 5 minutos
        max: 20, // 20 casos por IP por 5 min
        skipSuccessfulRequests: false
      }
    },

    // Rate limiting global
    global: {
      windowMs: 60 * 1000, // 1 minuto
      max: 100, // 100 requests por IP por minuto
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          error: 'Demasiadas solicitudes',
          message: 'Has excedido el límite de solicitudes. Intenta más tarde.',
          retryAfter: Math.round(req.rateLimit.resetTime / 1000)
        });
      }
    }
  },

  // Config de Monitoreo y Logs
  monitoring: {
    // Config de logs de seguridad
    securityLogs: {
      level: process.env.LOG_LEVEL || 'info',
      file: process.env.SECURITY_LOG_FILE || './logs/security.log',
      maxFiles: 10,
      maxSize: '10MB',
      format: 'json',
      timestamp: true
    },

    criticalEvents: [
      'multiple_failed_logins',
      'sql_injection_attempt',
      'xss_attempt',
      'brute_force_attack',
      'unauthorized_access',
      'data_encryption_failure',
      'ssl_handshake_failure',
      'rate_limit_exceeded'
    ],

    //Config de alertas
    alerts: {
      email: {
        enabled: process.env.ALERT_EMAIL_ENABLED === 'true',
        recipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || ['admin@raicesdevida.org'],
        smtp: {
          host: process.env.SMTP_HOST || 'localhost',
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        }
      },
      
      webhook: {
        enabled: process.env.ALERT_WEBHOOK_ENABLED === 'true',
        url: process.env.ALERT_WEBHOOK_URL,
        timeout: 5000
      }
    },

    thresholds: {
      failedLoginsPerMinute: 10,
      maliciousRequestsPerHour: 50,
      dataEncryptionFailuresPerHour: 5,
      sslErrorsPerHour: 20
    }
  },

  audit: {
    enabled: true,
    logFile: process.env.AUDIT_LOG_FILE || './logs/audit.log',
    includeRequestBody: false,
    includeResponseBody: false,
    
    trackedFields: [
      'user_id',
      'action',
      'resource',
      'timestamp',
      'ip_address',
      'user_agent',
      'success',
      'error_code'
    ],

    mandatoryAuditActions: [
      'user_login',
      'user_logout',
      'password_change',
      'data_access',
      'data_modification',
      'admin_action',
      'security_event'
    ]
  },

  securityHeaders: {
    csp: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },

    headers: {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    }
  },

  // Config de Backup y Recuperación
  backup: {
    encryption: {
      enabled: true,
      algorithm: 'aes-256-cbc',
      keyRotation: '30d'
    },
    
    schedule: {
      full: '0 2 * * 0',
      incremental: '0 2 * * 1-6'
    },

    retention: {
      daily: 7,
      weekly: 4,
      monthly: 12
    }
  }
};
