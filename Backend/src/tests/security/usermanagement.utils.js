/**
 * utilidades para pruebas de gestión de usuarios y autorización
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const userManagementConfig = require('./usermanagement.config');

class UserManagementUtils {

  /**
   * genera usuario de prueba con rol específico
   */
  static generateTestUser(role = 'voluntario', overrides = {}) {
    const baseUser = {
      id: Math.floor(Math.random() * 10000),
      email: `test.${role}@example.com`,
      password: 'TestPassword123!',
      nombre: `Test ${role}`,
      telefono: '+502 1234-5678',
      dpi: '1234567890123',
      rol: role,
      tipo_referencia: role === 'ong' ? 'ONG' : 'Voluntario',
      id_referencia: Math.floor(Math.random() * 1000),
      activo: true,
      ultimo_acceso: new Date(),
      intentos_login: 0,
      bloqueado_hasta: null,
      password_expira: new Date(Date.now() + userManagementConfig.access.passwordExpiry),
      sesiones_activas: 0,
      created_at: new Date(),
      updated_at: new Date()
    };

    return { ...baseUser, ...overrides };
  }

  /**
   * genera múltiples usuarios para testing
   */
  static generateTestUsers(count = 5) {
    const roles = Object.keys(userManagementConfig.roles);
    const users = [];

    for (let i = 0; i < count; i++) {
      const role = roles[i % roles.length];
      users.push(this.generateTestUser(role, { 
        id: i + 1,
        email: `user${i + 1}@example.com`
      }));
    }

    return users;
  }

  /**
   * genera token JWT con permisos específicos
   */
  static generateTestJWT(user, options = {}) {
    const sessionId = options.sessionId || crypto.randomUUID();
    
    const payload = {
      id: user.id,
      email: user.email,
      rol: user.rol,
      permissions: userManagementConfig.roles[user.rol]?.permissions || [],
      session_id: sessionId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + (options.expiresIn || 3600000)) / 1000)
    };

    return jwt.sign(payload, options.secret || 'test-secret');
  }

  /**
   * verifica si usuario tiene permiso específico
   */
  static hasPermission(userRole, permission) {
    const roleConfig = userManagementConfig.roles[userRole];
    return roleConfig?.permissions.includes(permission) || false;
  }

  /**
   * verifica jerarquía de roles
   */
  static canAccessRole(currentRole, targetRole) {
    const currentLevel = userManagementConfig.roles[currentRole]?.level || 0;
    const targetLevel = userManagementConfig.roles[targetRole]?.level || 0;
    return currentLevel >= targetLevel;
  }

  /**
   * genera datos de sesión de prueba
   */
  static generateSessionData(userId, options = {}) {
    return {
      session_id: crypto.randomUUID(),
      user_id: userId,
      ip_address: options.ip || '127.0.0.1',
      user_agent: options.userAgent || 'Mozilla/5.0 Test Browser',
      created_at: new Date(),
      last_activity: new Date(),
      expires_at: new Date(Date.now() + userManagementConfig.session.maxDuration),
      is_active: true,
      location: options.location || 'Test Location'
    };
  }

  /**
   * simula acciones auditables
   */
  static generateAuditLog(action, userId, details = {}) {
    return {
      id: crypto.randomUUID(),
      action: action,
      user_id: userId,
      timestamp: new Date(),
      ip_address: details.ip || '127.0.0.1',
      user_agent: details.userAgent || 'Test Browser',
      success: details.success !== false,
      details: JSON.stringify(details),
      risk_level: this.calculateRiskLevel(action, details)
    };
  }

  /**
   * calcula nivel de riesgo de una acción
   */
  static calculateRiskLevel(action, details) {
    const highRiskActions = ['user_delete', 'role_change', 'permission_grant'];
    const mediumRiskActions = ['password_change', 'data_export'];
    
    if (highRiskActions.includes(action)) return 'high';
    if (mediumRiskActions.includes(action)) return 'medium';
    if (details.failed_attempts > 3) return 'high';
    return 'low';
  }

  /**
   * genera patrones de acceso maliciosos para testing
   */
  static getMaliciousAccessPatterns() {
    return {
      bruteForce: {
        attempts: 20,
        timeframe: 60000, // 1 minuto
        pattern: 'rapid_successive'
      },
      privilegeEscalation: {
        originalRole: 'voluntario',
        attemptedRole: 'admin',
        methods: ['header_manipulation', 'token_tampering']
      },
      sessionHijacking: {
        originalIp: '127.0.0.1',
        suspiciousIp: '192.168.1.100',
        userAgentMismatch: true
      },
      unauthorizedAccess: {
        endpoints: ['/admin/users', '/api/sensitive-data', '/reports/confidential'],
        expectedStatus: 403
      }
    };
  }

  /**
   * valida configuración de seguridad de usuarios
   */
  static validateUserSecurityConfig() {
    const issues = [];
    
    // verificar configuración de roles
    const roles = Object.keys(userManagementConfig.roles);
    if (roles.length < 2) {
      issues.push('Se requieren al menos 2 roles');
    }

    // verificar permisos
    for (const [role, config] of Object.entries(userManagementConfig.roles)) {
      if (!config.permissions || config.permissions.length === 0) {
        issues.push(`Rol ${role} no tiene permisos definidos`);
      }
      if (typeof config.level !== 'number') {
        issues.push(`Rol ${role} no tiene nivel numérico`);
      }
    }

    // verificar configuración de sesión
    if (userManagementConfig.session.maxDuration < 300000) { // 5 minutos
      issues.push('Duración máxima de sesión muy corta');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * genera escenarios de testing complejos
   */
  static generateTestScenarios() {
    return {
      normalAccess: {
        description: 'acceso normal de usuario autorizado',
        user: this.generateTestUser('ong'),
        expectedResult: 'success'
      },
      unauthorizedAccess: {
        description: 'intento de acceso no autorizado',
        user: this.generateTestUser('voluntario'),
        action: 'admin_action',
        expectedResult: 'forbidden'
      },
      expiredSession: {
        description: 'sesión expirada',
        user: this.generateTestUser('admin'),
        sessionExpired: true,
        expectedResult: 'unauthorized'
      },
      blockedUser: {
        description: 'usuario bloqueado por intentos fallidos',
        user: this.generateTestUser('ong', { 
          bloqueado_hasta: new Date(Date.now() + 600000) // 10 min
        }),
        expectedResult: 'locked'
      }
    };
  }
}

module.exports = UserManagementUtils;
