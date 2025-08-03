/**
 * configuración para monitoreo y respuesta a incidentes de seguridad
 */

const monitoringConfig = {
  // configuración de monitoreo en tiempo real
  monitoring: {
    enableRealTimeAlerts: true,
    alertThresholds: {
      failedLogins: 5,           // alertar después de 5 intentos fallidos
      suspiciousRequests: 10,    // alertar con 10 requests sospechosos
      dataLeakage: 1,            // alertar inmediatamente
      privilegeEscalation: 1,    // alertar inmediatamente
      bruteForce: 3,             // alertar después de 3 ataques de fuerza bruta
      anomalousAccess: 5         // alertar con 5 accesos anómalos
    },
    monitoringInterval: 60000,   // revisar cada 60 segundos
    retentionPeriod: 30 * 24 * 60 * 60 * 1000 // 30 días
  },

  // configuración de alertas
  alerts: {
    severityLevels: {
      low: {
        color: '#FFC107',
        requiresImmediate: false,
        autoResolve: true,
        escalationTime: 24 * 60 * 60 * 1000 // 24 horas
      },
      medium: {
        color: '#FF9800',
        requiresImmediate: false,
        autoResolve: false,
        escalationTime: 4 * 60 * 60 * 1000 // 4 horas
      },
      high: {
        color: '#F44336',
        requiresImmediate: true,
        autoResolve: false,
        escalationTime: 30 * 60 * 1000 // 30 minutos
      },
      critical: {
        color: '#9C27B0',
        requiresImmediate: true,
        autoResolve: false,
        escalationTime: 5 * 60 * 1000 // 5 minutos
      }
    },
    channels: {
      email: { enabled: true, endpoint: 'alerts@raicesdevida.org' },
      sms: { enabled: false, endpoint: null },
      webhook: { enabled: true, endpoint: '/api/security/webhook' },
      dashboard: { enabled: true, realTime: true }
    }
  },

  // configuración de detección de amenazas
  threatDetection: {
    patterns: {
      xssAttempts: {
        regex: /<script|javascript:|onload=|onerror=|eval\(|alert\(/i,
        severity: 'high',
        autoBlock: true
      },
      sqlInjection: {
        regex: /(\b(union|select|insert|delete|update|drop|create|alter|exec|execute)\b)|([\'\"]\s*(or|and)\s*[\'\"]*\s*[=\>\\<])|([\'\"]\s*;\s*--)|(\'\s*or\s+\d+\s*=\s*\d+)/i,
        severity: 'high',
        autoBlock: true
      },
      pathTraversal: {
        regex: /(\.\.[\/\\])|(%2e%2e[\/\\])|(\.\.[%2f%5c])/i,
        severity: 'medium',
        autoBlock: true
      },
      bruteForce: {
        maxAttempts: 5,
        timeWindow: 15 * 60 * 1000, // 15 minutos
        severity: 'high',
        autoBlock: true
      },
      anomalousUserAgent: {
        blacklist: ['bot', 'crawler', 'scanner', 'hack', 'exploit'],
        severity: 'medium',
        autoBlock: false
      }
    },
    geolocation: {
      enableBlocking: false,
      suspiciousCountries: [],
      whitelistedCountries: ['GT', 'US', 'CA', 'MX'] // guatemala, usa, canada, mexico
    }
  },

  // configuración de respuesta automática
  autoResponse: {
    enabled: true,
    actions: {
      blockIp: {
        enabled: true,
        duration: 60 * 60 * 1000, // 1 hora
        whitelist: ['127.0.0.1', '::1']
      },
      lockAccount: {
        enabled: true,
        duration: 30 * 60 * 1000, // 30 minutos
        maxLockouts: 3
      },
      rateLimit: {
        enabled: true,
        strictMode: true,
        duration: 15 * 60 * 1000 // 15 minutos
      },
      notifyAdmins: {
        enabled: true,
        methods: ['email', 'webhook'],
        immediateThreats: ['critical', 'high']
      }
    }
  },

  // configuración de forensics y análisis
  forensics: {
    enableDeepLogging: true,
    capturePayloads: true,
    captureHeaders: true,
    captureUserAgent: true,
    captureGeolocation: false,
    dataRetention: 90 * 24 * 60 * 60 * 1000, // 90 días
    compressionEnabled: true
  },

  // configuración de reportes
  reporting: {
    dailyReports: true,
    weeklyReports: true,
    monthlyReports: true,
    realtimeDashboard: true,
    exportFormats: ['json', 'csv', 'pdf'],
    scheduleReports: {
      daily: { time: '08:00', timezone: 'America/Guatemala' },
      weekly: { day: 'monday', time: '09:00' },
      monthly: { day: 1, time: '10:00' }
    }
  },

  // configuración de compliance y auditoría
  compliance: {
    gdprCompliant: true,
    hipaaCompliant: false,
    iso27001: true,
    dataAnonymization: true,
    rightToErasure: true,
    auditTrail: {
      enabled: true,
      immutable: true,
      digitalSignature: false
    }
  }
};

module.exports = monitoringConfig;
