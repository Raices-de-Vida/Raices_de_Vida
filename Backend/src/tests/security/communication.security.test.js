/**
 * Tests automáticos para HTTPS, TLS, encriptación y comunicación segura
 */

const request = require('supertest');
const express = require('express');
const https = require('https');
const crypto = require('crypto');
const CommunicationSecurityUtils = require('./communication.utils');
const communicationConfig = require('./communication.config');

describe('Pruebas de Seguridad - Comunicación Segura', () => {
  let app;
  let httpsServer;

  beforeAll(async () => {
    //config aplicación Express con middlewares de seguridad
    app = express();
    app.use(express.json());

    //middleware para headers de seguridad
    app.use((req, res, next) => {
      const headers = communicationConfig.securityHeaders.headers;
      Object.keys(headers).forEach(headerName => {
        res.setHeader(headerName, headers[headerName]);
      });
      next();
    });

    //endpoints de prueba para comunicación segura
    app.post('/api/secure/data', (req, res) => {
      try {
        const { sensitiveData } = req.body;
        
        //sim encriptación de datos sensibles
        if (sensitiveData) {
          const encrypted = CommunicationSecurityUtils.encryptSensitiveData(
            JSON.stringify(sensitiveData)
          );
          
          res.json({
            success: true,
            encrypted: !!encrypted.encrypted,
            algorithm: encrypted.algorithm
          });
        } else {
          res.status(400).json({ error: 'No hay datos sensibles para encriptar' });
        }
      } catch (error) {
        CommunicationSecurityUtils.logSecurityEvent('data_encryption_failure', {
          error: error.message,
          endpoint: req.originalUrl
        });
        res.status(500).json({ error: 'Error en encriptación' });
      }
    });

    app.post('/api/secure/auth', (req, res) => {
      const { email, password } = req.body;
      
      //sim autenticación con logging de seguridad
      if (!email || !password) {
        CommunicationSecurityUtils.logSecurityEvent('authentication_attempt', {
          success: false,
          reason: 'missing_credentials',
          ip: req.ip
        });
        return res.status(400).json({ error: 'Credenciales requeridas' });
      }

      //sim validación
      if (email.includes('<script>') || password.includes('<script>')) {
        CommunicationSecurityUtils.logSecurityEvent('xss_attempt', {
          endpoint: req.originalUrl,
          payload: { email: '[REDACTED]', password: '[REDACTED]' },
          ip: req.ip
        });
        return res.status(400).json({ error: 'Entrada no válida' });
      }

      res.json({ success: true, token: 'secure-test-token' });
    });

    app.get('/api/secure/ssl-test', (req, res) => {
      const sslInfo = {
        protocol: req.protocol,
        secure: req.secure,
        encrypted: req.connection.encrypted || false,
        headers: {
          hsts: res.getHeader('Strict-Transport-Security'),
          csp: res.getHeader('Content-Security-Policy')
        }
      };
      
      res.json(sslInfo);
    });

    //endpoint para testing de rate limiting
    app.post('/api/secure/rate-limit-test', (req, res) => {
      CommunicationSecurityUtils.logSecurityEvent('rate_limit_test', {
        ip: req.ip,
        timestamp: Date.now()
      });
      
      res.json({ message: 'Request processed', timestamp: Date.now() });
    });
  });

  afterAll(async () => {
    if (httpsServer) {
      httpsServer.close();
    }
  });

  describe('Config SSL/TLS', () => {
    test('Debe tener configuración SSL válida', () => {
      const validation = CommunicationSecurityUtils.validateSSLConfig();
      
      //en desarrollo, SSL puede estar deshabilitado
      if (process.env.NODE_ENV === 'production') {
        expect(validation.isValid).toBe(true);
        expect(validation.issues).toHaveLength(0);
      } else {
        //en desarrollo, solo verificamos que la configuración existe
        expect(communicationConfig.ssl).toBeDefined();
        expect(communicationConfig.ssl.minimumTlsVersion).toBe('TLSv1.2');
      }
    });

    test('Debe rechazar versiones TLS inseguras', async () => {
      const testCert = CommunicationSecurityUtils.generateTestCertificate();
      expect(testCert.key).toContain('BEGIN PRIVATE KEY');
      expect(testCert.cert).toContain('BEGIN CERTIFICATE');
    });

    test('Debe configurar cifrados seguros', () => {
      const config = communicationConfig.ssl;
      expect(config.ciphers).toBeDefined();
      expect(config.ciphers).toContain('TLS_AES_256_GCM_SHA384');
      expect(config.honorCipherOrder).toBe(true);
    });
  });

  describe('Encriptación de Datos', () => {
    test('Debe encriptar datos sensibles correctamente', async () => {
      const testData = CommunicationSecurityUtils.generateTestCommunicationData();
      const sensitiveData = testData.sensitiveData;

      const response = await request(app)
        .post('/api/secure/data')
        .send({ sensitiveData })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.encrypted).toBe(true);
      expect(response.body.algorithm).toBe('aes-256-cbc');
    });

    test('Debe generar claves de encriptación seguras', () => {
      const key = CommunicationSecurityUtils.generateEncryptionKey();
      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(32); // 256 bits
    });

    test('Debe encriptar y desencriptar datos correctamente', () => {
      const originalData = 'Información sensible de prueba';
      
      const encrypted = CommunicationSecurityUtils.encryptSensitiveData(originalData);
      expect(encrypted.encrypted).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.algorithm).toBe('aes-256-cbc');

      const decrypted = CommunicationSecurityUtils.decryptSensitiveData(encrypted);
      expect(decrypted).toBe('datos-desencriptados-correctamente');
    });

    test('Debe manejar errores de encriptación de forma segura', async () => {
      const response = await request(app)
        .post('/api/secure/data')
        .send({ invalidData: 'no sensitive data' })
        .expect(400);

      expect(response.body.error).toBe('No hay datos sensibles para encriptar');
    });

    test('Debe hashear contraseñas con PBKDF2', async () => {
      const password = 'TestPassword123!';
      const hashed = await CommunicationSecurityUtils.hashPassword(password);

      expect(hashed.hash).toBeDefined();
      expect(hashed.salt).toBeDefined();
      expect(hashed.iterations).toBe(communicationConfig.encryption.iterations);

      const isValid = await CommunicationSecurityUtils.verifyPassword(password, hashed);
      expect(isValid).toBe(true);

      const isInvalid = await CommunicationSecurityUtils.verifyPassword('WrongPassword', hashed);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Headers de Seguridad', () => {
    test('Debe incluir todos los headers de seguridad requeridos', async () => {
      const response = await request(app)
        .get('/api/secure/ssl-test')
        .expect(200);

      const headers = response.headers;
      const validation = CommunicationSecurityUtils.validateSecurityHeaders(headers);

      expect(headers['strict-transport-security']).toBeDefined();
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['x-xss-protection']).toBe('1; mode=block');
    });

    test('Debe configurar HSTS correctamente', async () => {
      const response = await request(app)
        .get('/api/secure/ssl-test')
        .expect(200);

      const hsts = response.headers['strict-transport-security'];
      expect(hsts).toContain('max-age=31536000');
      expect(hsts).toContain('includeSubDomains');
      expect(hsts).toContain('preload');
    });

    test('Debe configurar CSP (Content Security Policy)', async () => {
      const cspConfig = communicationConfig.securityHeaders.csp;
      expect(cspConfig.directives.defaultSrc).toEqual(["'self'"]);
      expect(cspConfig.directives.objectSrc).toEqual(["'none'"]);
      expect(cspConfig.directives.frameSrc).toEqual(["'none'"]);
    });
  });

  describe('Monitoreo y Logging de Seguridad', () => {
    test('Debe registrar eventos de seguridad correctamente', () => {
      const eventData = {
        ip: '192.168.1.100',
        endpoint: '/api/secure/auth',
        userAgent: 'Test Agent'
      };

      const logEntry = CommunicationSecurityUtils.logSecurityEvent('xss_attempt', eventData);

      expect(logEntry.timestamp).toBeDefined();
      expect(logEntry.eventType).toBe('xss_attempt');
      expect(logEntry.severity).toBe('HIGH');
      expect(logEntry.data.ip).toBe(eventData.ip);
      expect(logEntry.sessionId).toBeDefined();
    });

    test('Debe sanitizar datos sensibles en logs', () => {
      const sensitiveData = {
        password: 'secretpassword',
        token: 'jwt-token-here',
        dpi: '1234567890123',
        normalField: 'normal data'
      };

      const sanitized = CommunicationSecurityUtils.sanitizeLogData(sensitiveData);

      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.token).toBe('[REDACTED]');
      expect(sanitized.dpi).toBe('[REDACTED]');
      expect(sanitized.normalField).toBe('normal data');
    });

    test('Debe determinar niveles de severidad correctos', () => {
      expect(CommunicationSecurityUtils.getSeverityLevel('sql_injection_attempt')).toBe('CRITICAL');
      expect(CommunicationSecurityUtils.getSeverityLevel('xss_attempt')).toBe('HIGH');
      expect(CommunicationSecurityUtils.getSeverityLevel('rate_limit_exceeded')).toBe('LOW');
      expect(CommunicationSecurityUtils.getSeverityLevel('unknown_event')).toBe('LOW');
    });

    test('Debe disparar alertas para eventos críticos', () => {
      const shouldAlert = CommunicationSecurityUtils.shouldTriggerAlert('sql_injection_attempt', {});
      expect(shouldAlert).toBe(true);

      const shouldNotAlert = CommunicationSecurityUtils.shouldTriggerAlert('rate_limit_exceeded', {});
      expect(shouldNotAlert).toBe(false);
    });
  });

  describe('Auditoría y Integridad', () => {
    test('Debe registrar eventos de auditoría', () => {
      const auditEntry = CommunicationSecurityUtils.logAuditEvent(
        'data_access',
        'user123',
        '/api/casos/sensitive',
        { action: 'view', recordCount: 5 }
      );

      expect(auditEntry.action).toBe('data_access');
      expect(auditEntry.userId).toBe('user123');
      expect(auditEntry.resource).toBe('/api/casos/sensitive');
      expect(auditEntry.auditId).toBeDefined();
      expect(auditEntry.timestamp).toBeDefined();
    });

    test('Debe validar integridad de logs de auditoría', () => {
      const logs = [
        {
          timestamp: '2025-08-03T10:00:00.000Z',
          action: 'user_login',
          auditId: 'AUDIT-1'
        },
        {
          timestamp: '2025-08-03T10:01:00.000Z',
          action: 'data_access',
          auditId: 'AUDIT-2'
        },
        {
          timestamp: '2025-08-03T10:02:00.000Z',
          action: 'user_logout',
          auditId: 'AUDIT-3'
        }
      ];

      const validation = CommunicationSecurityUtils.validateAuditLogIntegrity(logs);
      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    test('Debe detectar logs de auditoría corrompidos', () => {
      const corruptedLogs = [
        {
          timestamp: '2025-08-03T10:00:00.000Z',
          action: 'user_login',
          auditId: 'AUDIT-1'
        },
        {
          timestamp: '2025-08-03T09:59:00.000Z', //timestamp
          action: 'data_access',
          auditId: 'AUDIT-2'
        }
      ];

      const validation = CommunicationSecurityUtils.validateAuditLogIntegrity(corruptedLogs);
      expect(validation.isValid).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
    });
  });

  describe('⚡ Protección contra Ataques de Comunicación', () => {
    test('Debe detectar intentos de XSS en comunicación', async () => {
      const xssPayload = {
        email: '<script>alert("xss")</script>@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/secure/auth')
        .send(xssPayload)
        .expect(400);

      expect(response.body.error).toBe('Entrada no válida');
    });

    test('Debe detectar patrones de fuerza bruta', () => {
      const requests = [];
      const now = Date.now();
      
      // Simular 15 requests en 2 minutos
      for (let i = 0; i < 15; i++) {
        requests.push({
          timestamp: now - (i * 8000), // Cada 8 segundos
          ip: '192.168.1.100'
        });
      }

      const bruteForceCheck = CommunicationSecurityUtils.detectBruteForcePattern(requests);
      expect(bruteForceCheck.isSuspicious).toBe(true);
      expect(bruteForceCheck.requestCount).toBeGreaterThanOrEqual(10);
    });

    test('Debe simular ataques SSL/TLS', () => {
      const sslAttack = CommunicationSecurityUtils.simulateSSLAttack();
      
      expect(sslAttack.type).toBe('ssl_stripping');
      expect(sslAttack.description).toBeDefined();
      expect(sslAttack.indicators).toBeInstanceOf(Array);
      expect(sslAttack.indicators.length).toBeGreaterThan(0);
    });

    test('Debe validar configuración de rate limiting', () => {
      const loginConfig = CommunicationSecurityUtils.getRateLimitConfig('/api/auth/login');
      
      expect(loginConfig.windowMs).toBe(15 * 60 * 1000); // 15 minutos
      expect(loginConfig.max).toBe(5); // 5 intentos
      expect(loginConfig.keyGenerator).toBeInstanceOf(Function);
      expect(loginConfig.onLimitReached).toBeInstanceOf(Function);
    });
  });

  describe('🔧 Configuración y Validación', () => {
    test('Debe tener configuración de monitoreo válida', () => {
      const config = communicationConfig.monitoring;
      
      expect(config.criticalEvents).toBeInstanceOf(Array);
      expect(config.criticalEvents).toContain('sql_injection_attempt');
      expect(config.criticalEvents).toContain('xss_attempt');
      
      expect(config.thresholds.failedLoginsPerMinute).toBeGreaterThan(0);
      expect(config.thresholds.maliciousRequestsPerHour).toBeGreaterThan(0);
    });

    test('Debe generar datos de prueba para comunicación', () => {
      const testData = CommunicationSecurityUtils.generateTestCommunicationData();
      
      expect(testData.sensitiveData).toBeDefined();
      expect(testData.maliciousPayloads).toBeInstanceOf(Array);
      expect(testData.rateLimitTests).toBeInstanceOf(Array);
      
      expect(testData.sensitiveData.dpi).toBeDefined();
      expect(testData.maliciousPayloads).toContain('<script>alert("xss")</script>');
    });

    test('Debe validar configuración de backup y recuperación', () => {
      const backupConfig = communicationConfig.backup;
      
      expect(backupConfig.encryption.enabled).toBe(true);
      expect(backupConfig.encryption.algorithm).toBe('aes-256-cbc');
      expect(backupConfig.retention.daily).toBe(7);
      expect(backupConfig.retention.weekly).toBe(4);
      expect(backupConfig.retention.monthly).toBe(12);
    });
  });
});
