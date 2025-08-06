/**
 * Configuración para pruebas de gestión de usuarios y autorización
 */

const userManagementConfig = {
  // roles y permisos del sistema
  roles: {
    admin: {
      permissions: [
        'users:read', 'users:write', 'users:delete',
        'alerts:read', 'alerts:write', 'alerts:delete',
        'reports:read', 'reports:write',
        'settings:read', 'settings:write'
      ],
      level: 100
    },
    ong: {
      permissions: [
        'alerts:read', 'alerts:write',
        'reports:read',
        'profile:read', 'profile:write'
      ],
      level: 50
    },
    voluntario: {
      permissions: [
        'alerts:read',
        'reports:read',
        'profile:read', 'profile:write'
      ],
      level: 25
    },
    guest: {
      permissions: ['alerts:read'],
      level: 10
    }
  },

  // configuración de sesiones
  session: {
    maxDuration: 24 * 60 * 60 * 1000, // 24 horas
    maxConcurrentSessions: 5,
    inactivityTimeout: 2 * 60 * 60 * 1000, // 2 horas
    renewalThreshold: 30 * 60 * 1000 // renovar si quedan menos de 30 min
  },

  // configuración de políticas de acceso
  access: {
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutos
    passwordExpiry: 90 * 24 * 60 * 60 * 1000, // 90 días
    requireTwoFactor: false,
    allowedIpRanges: [], // vacío = permitir todo
    restrictedUserAgents: [
      'malicious-bot',
      'suspicious-crawler',
      'automated-scanner'
    ]
  },

  // configuración de auditoría
  audit: {
    logSensitiveActions: true,
    retentionPeriod: 365 * 24 * 60 * 60 * 1000, // 1 año
    sensitiveActions: [
      'login', 'logout', 'password_change',
      'role_change', 'permission_grant',
      'user_delete', 'data_export'
    ],
    logLevel: 'info'
  },

  // límites de seguridad
  limits: {
    maxUsersPerOrg: 100,
    maxRolesPerUser: 3,
    maxPermissionsPerRole: 50,
    sessionCleanupInterval: 60 * 60 * 1000 // 1 hora
  }
};

module.exports = userManagementConfig;
