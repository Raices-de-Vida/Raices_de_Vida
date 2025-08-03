/**
 * pruebas automáticas de detección de amenazas y monitoreo
 */

const request = require('supertest');
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const MonitoringUtils = require('./monitoring.utils');
const monitoringConfig = require('./monitoring.config');

describe('detección de amenazas y monitoreo', () => {
  let app;
  let sequelize;
  let SecurityEvent, SecurityAlert, BlockedIP;
  let securityEvents = [];
  let alerts = [];
  let blockedIPs = new Set();

  beforeAll(async () => {
    // configuración de base de datos en memoria
    sequelize = new Sequelize('sqlite::memory:', { 
      logging: false,
      dialect: 'sqlite'
    });

    // modelos para testing
    SecurityEvent = sequelize.define('SecurityEvent', {
      id: { type: DataTypes.STRING, primaryKey: true },
      type: { type: DataTypes.STRING },
      severity: { type: DataTypes.STRING },
      source_ip: { type: DataTypes.STRING },
      target_endpoint: { type: DataTypes.STRING },
      risk_score: { type: DataTypes.INTEGER },
      resolved: { type: DataTypes.BOOLEAN, defaultValue: false },
      details: { type: DataTypes.TEXT }
    });

    SecurityAlert = sequelize.define('SecurityAlert', {
      id: { type: DataTypes.STRING, primaryKey: true },
      event_id: { type: DataTypes.STRING },
      type: { type: DataTypes.STRING },
      severity: { type: DataTypes.STRING },
      status: { type: DataTypes.STRING, defaultValue: 'active' },
      title: { type: DataTypes.STRING },
      description: { type: DataTypes.TEXT },
      resolved_at: { type: DataTypes.DATE }
    });

    BlockedIP = sequelize.define('BlockedIP', {
      ip: { type: DataTypes.STRING, primaryKey: true },
      reason: { type: DataTypes.STRING },
      blocked_until: { type: DataTypes.DATE },
      block_count: { type: DataTypes.INTEGER, defaultValue: 1 }
    });

    await sequelize.sync();

    // configuración de express con middleware de monitoreo
    app = express();
    app.use(express.json());

    // middleware para detectar amenazas
    const threatDetectionMiddleware = (req, res, next) => {
      const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';
      
      // excluir endpoints de administración
      if (req.url.startsWith('/api/security/')) {
        return next();
      }
      
      // verificar IP bloqueada
      if (blockedIPs.has(clientIp)) {
        return res.status(403).json({ error: 'IP bloqueada por razones de seguridad' });
      }

      // detectar patrones maliciosos en URL y body
      const payload = JSON.stringify(req.body || {}) + req.url;
      
      for (const [patternName, config] of Object.entries(monitoringConfig.threatDetection.patterns)) {
        if (config.regex && config.regex.test(payload)) {
          // crear evento de seguridad
          const event = MonitoringUtils.generateSecurityEvent(
            patternName.replace(/([A-Z])/g, '_$1').toLowerCase(),
            config.severity,
            {
              source: { ip: clientIp, userAgent: req.headers['user-agent'] },
              target: { endpoint: req.url, method: req.method },
              details: { payload: payload.substring(0, 500) }
            }
          );

          securityEvents.push(event);

          // generar alerta si es necesario
          if (config.severity === 'high' || config.severity === 'critical') {
            const alert = MonitoringUtils.generateSecurityAlert(event.id, 'attack_detected', {
              severity: config.severity,
              title: `${patternName} detectado`,
              description: `patrón malicioso detectado desde ${clientIp}`
            });
            alerts.push(alert);
          }

          // auto-bloquear si está configurado
          if (config.autoBlock) {
            blockedIPs.add(clientIp);
            return res.status(403).json({ 
              error: 'acceso bloqueado por actividad maliciosa',
              eventId: event.id 
            });
          }
        }
      }

      next();
    };

    app.use(threatDetectionMiddleware);

    // endpoints de prueba
    app.get('/api/data', (req, res) => {
      res.json({ message: 'datos obtenidos', timestamp: new Date() });
    });

    app.post('/api/search', (req, res) => {
      const { query } = req.body;
      res.json({ 
        results: [`resultado para: ${query}`],
        count: 1 
      });
    });

    app.post('/api/login', (req, res) => {
      const { email, password } = req.body;
      
      // simular verificación
      if (email === 'test@example.com' && password === 'password123') {
        res.json({ token: 'valid-token' });
      } else {
        // registrar intento fallido
        const event = MonitoringUtils.generateSecurityEvent('login_attempt', 'low', {
          source: { ip: req.headers['x-forwarded-for'] || '127.0.0.1' },
          target: { endpoint: req.url },
          details: { success: false, email }
        });
        securityEvents.push(event);

        res.status(401).json({ error: 'credenciales inválidas' });
      }
    });

    // endpoints del sistema de monitoreo
    app.get('/api/security/events', (req, res) => {
      const { limit = 50, severity, type } = req.query;
      
      let filteredEvents = [...securityEvents];
      
      if (severity) {
        filteredEvents = filteredEvents.filter(e => e.severity === severity);
      }
      
      if (type) {
        filteredEvents = filteredEvents.filter(e => e.type === type);
      }

      res.json({
        events: filteredEvents.slice(0, parseInt(limit)),
        total: filteredEvents.length,
        timestamp: new Date()
      });
    });

    app.get('/api/security/alerts', (req, res) => {
      const { status = 'active' } = req.query;
      
      const filteredAlerts = alerts.filter(a => a.status === status);
      
      res.json({
        alerts: filteredAlerts,
        count: filteredAlerts.length,
        timestamp: new Date()
      });
    });

    app.post('/api/security/alerts/:id/resolve', (req, res) => {
      const { id } = req.params;
      const alert = alerts.find(a => a.id === id);
      
      if (!alert) {
        return res.status(404).json({ error: 'alerta no encontrada' });
      }

      alert.status = 'resolved';
      alert.resolvedAt = new Date();
      alert.resolvedBy = 'test-user';

      res.json({ message: 'alerta resuelta', alert });
    });

    app.get('/api/security/blocked-ips', (req, res) => {
      res.json({
        blockedIPs: Array.from(blockedIPs),
        count: blockedIPs.size,
        timestamp: new Date()
      });
    });

    app.delete('/api/security/blocked-ips/:ip', (req, res) => {
      const { ip } = req.params;
      
      if (blockedIPs.has(ip)) {
        blockedIPs.delete(ip);
        res.json({ message: `IP ${ip} desbloqueada` });
      } else {
        res.status(404).json({ error: 'IP no encontrada en lista de bloqueos' });
      }
    });

    app.get('/api/security/dashboard', (req, res) => {
      const metrics = MonitoringUtils.generateMonitoringMetrics();
      
      res.json({
        events: {
          total: securityEvents.length,
          last24h: securityEvents.filter(e => 
            Date.now() - new Date(e.timestamp).getTime() < 24 * 60 * 60 * 1000
          ).length
        },
        alerts: {
          active: alerts.filter(a => a.status === 'active').length,
          resolved: alerts.filter(a => a.status === 'resolved').length
        },
        blocked: {
          ips: blockedIPs.size
        },
        metrics,
        timestamp: new Date()
      });
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(() => {
    // limpiar eventos y alertas entre tests
    securityEvents.length = 0;
    alerts.length = 0;
    blockedIPs.clear();
  });

  describe('detección de patrones maliciosos', () => {
    test('debería detectar intentos de inyección SQL', async () => {
      const maliciousQuery = "'; DROP TABLE users; --";

      const response = await request(app)
        .post('/api/search')
        .send({ query: maliciousQuery })
        .expect(403);

      expect(response.body.error).toBe('acceso bloqueado por actividad maliciosa');
      expect(response.body.eventId).toBeDefined();
      expect(securityEvents.length).toBeGreaterThan(0);
      
      const event = securityEvents[0];
      expect(event.type).toBe('sql_injection');
      expect(event.severity).toBe('high');
    });

    test('debería detectar intentos de XSS', async () => {
      const xssPayload = '<script>alert("xss")</script>';

      await request(app)
        .post('/api/search')
        .send({ query: xssPayload })
        .expect(403);

      expect(securityEvents.length).toBeGreaterThan(0);
      
      const event = securityEvents[0];
      expect(event.type).toBe('xss_attempts');
      expect(event.severity).toBe('high');
    });

    test('debería detectar path traversal', async () => {
      await request(app)
        .get('/api/data?file=../../../etc/passwd')
        .expect(403);

      expect(securityEvents.length).toBeGreaterThan(0);
      
      const event = securityEvents[0];
      expect(event.type).toBe('path_traversal');
      expect(event.severity).toBe('medium');
    });

    test('debería permitir requests legítimos', async () => {
      await request(app)
        .post('/api/search')
        .send({ query: 'búsqueda normal' })
        .expect(200);

      expect(securityEvents.length).toBe(0);
    });
  });

  describe('bloqueo automático de IPs', () => {
    test('debería bloquear IP después de detectar amenaza', async () => {
      const maliciousIp = '192.168.1.100';

      // primer ataque
      await request(app)
        .post('/api/search')
        .set('x-forwarded-for', maliciousIp)
        .send({ query: "' OR 1=1 --" })
        .expect(403);

      // verificar que la IP está bloqueada
      const response = await request(app)
        .get('/api/security/blocked-ips')
        .expect(200);

      expect(response.body.blockedIPs).toContain(maliciousIp);
    });

    test('debería rechazar requests de IP bloqueada', async () => {
      const blockedIp = '192.168.1.200';
      blockedIPs.add(blockedIp);

      const response = await request(app)
        .get('/api/data')
        .set('x-forwarded-for', blockedIp)
        .expect(403);

      expect(response.body.error).toBe('IP bloqueada por razones de seguridad');
    });

    test('debería desbloquear IP mediante API', async () => {
      const testIp = '192.168.1.150';
      blockedIPs.add(testIp);

      // verificar que está bloqueada
      expect(blockedIPs.has(testIp)).toBe(true);

      // desbloquear
      await request(app)
        .delete(`/api/security/blocked-ips/${testIp}`)
        .expect(200);

      // verificar que fue desbloqueada
      expect(blockedIPs.has(testIp)).toBe(false);
    });
  });

  describe('generación de alertas', () => {
    test('debería generar alerta para amenazas de alta severidad', async () => {
      await request(app)
        .post('/api/search')
        .send({ query: 'UNION SELECT * FROM users' })
        .expect(403);

      expect(alerts.length).toBeGreaterThan(0);
      
      const alert = alerts[0];
      expect(alert.severity).toBe('high');
      expect(alert.type).toBe('attack_detected');
      expect(alert.status).toBe('active');
    });

    test('debería consultar alertas activas', async () => {
      // generar algunas alertas
      alerts.push(MonitoringUtils.generateSecurityAlert('event-1', 'attack_detected', { severity: 'high' }));
      alerts.push(MonitoringUtils.generateSecurityAlert('event-2', 'threshold_exceeded', { 
        severity: 'medium',
        status: 'resolved' 
      }));

      const response = await request(app)
        .get('/api/security/alerts?status=active')
        .expect(200);

      expect(response.body.alerts.length).toBe(1);
      expect(response.body.alerts[0].status).toBe('active');
    });

    test('debería resolver alertas', async () => {
      const alert = MonitoringUtils.generateSecurityAlert('event-test', 'attack_detected');
      alerts.push(alert);

      const response = await request(app)
        .post(`/api/security/alerts/${alert.id}/resolve`)
        .expect(200);

      expect(response.body.alert.status).toBe('resolved');
      expect(response.body.alert.resolvedAt).toBeDefined();
    });
  });

  describe('monitoreo de eventos', () => {
    test('debería registrar intentos de login fallidos', async () => {
      await request(app)
        .post('/api/login')
        .send({ email: 'wrong@example.com', password: 'wrongpass' })
        .expect(401);

      expect(securityEvents.length).toBeGreaterThan(0);
      
      const event = securityEvents[0];
      expect(event.type).toBe('login_attempt');
      expect(event.details.success).toBe(false);
    });

    test('debería consultar eventos por severidad', async () => {
      // generar eventos de diferentes severidades
      securityEvents.push(MonitoringUtils.generateSecurityEvent('login_attempt', 'low'));
      securityEvents.push(MonitoringUtils.generateSecurityEvent('sql_injection', 'high'));
      securityEvents.push(MonitoringUtils.generateSecurityEvent('xss_attempt', 'high'));

      const response = await request(app)
        .get('/api/security/events?severity=high')
        .expect(200);

      expect(response.body.events.length).toBe(2);
      response.body.events.forEach(event => {
        expect(event.severity).toBe('high');
      });
    });

    test('debería consultar eventos por tipo', async () => {
      securityEvents.push(MonitoringUtils.generateSecurityEvent('login_attempt', 'low'));
      securityEvents.push(MonitoringUtils.generateSecurityEvent('login_attempt', 'medium'));
      securityEvents.push(MonitoringUtils.generateSecurityEvent('sql_injection', 'high'));

      const response = await request(app)
        .get('/api/security/events?type=login_attempt')
        .expect(200);

      expect(response.body.events.length).toBe(2);
      response.body.events.forEach(event => {
        expect(event.type).toBe('login_attempt');
      });
    });
  });

  describe('dashboard de seguridad', () => {
    test('debería mostrar métricas del dashboard', async () => {
      // generar algunos datos
      securityEvents.push(MonitoringUtils.generateSecurityEvent('login_attempt', 'low'));
      alerts.push(MonitoringUtils.generateSecurityAlert('event-1', 'threshold_exceeded'));
      blockedIPs.add('192.168.1.100');

      const response = await request(app)
        .get('/api/security/dashboard')
        .expect(200);

      expect(response.body.events.total).toBe(1);
      expect(response.body.alerts.active).toBe(1);
      expect(response.body.blocked.ips).toBe(1);
      expect(response.body.metrics).toBeDefined();
      expect(response.body.metrics.systemHealth).toBeDefined();
    });
  });

  describe('detección de patrones de ataque', () => {
    test('debería detectar patrón de fuerza bruta', async () => {
      const attackEvents = MonitoringUtils.generateAttackPattern('brute_force');
      securityEvents.push(...attackEvents);

      const pattern = MonitoringUtils.detectMaliciousPattern(attackEvents);
      
      expect(pattern).toBeDefined();
      expect(pattern.type).toBe('brute_force');
      expect(pattern.severity).toBe('high');
      expect(pattern.recommendation).toBe('block_ip');
    });

    test('no debería detectar patrón con pocos eventos', async () => {
      const normalEvents = [
        MonitoringUtils.generateSecurityEvent('login_attempt', 'low'),
        MonitoringUtils.generateSecurityEvent('data_access', 'low')
      ];

      const pattern = MonitoringUtils.detectMaliciousPattern(normalEvents);
      expect(pattern).toBeNull();
    });
  });

  describe('validación de configuración', () => {
    test('configuración de monitoreo debería ser válida', () => {
      const validation = MonitoringUtils.validateMonitoringConfig();
      expect(validation.isValid).toBe(true);
      expect(validation.issues).toEqual([]);
    });

    test('debería tener umbrales configurados correctamente', () => {
      const thresholds = monitoringConfig.monitoring.alertThresholds;
      
      expect(thresholds.failedLogins).toBeGreaterThan(0);
      expect(thresholds.bruteForce).toBeGreaterThan(0);
      expect(thresholds.suspiciousRequests).toBeGreaterThan(0);
    });

    test('debería tener patrones de detección configurados', () => {
      const patterns = monitoringConfig.threatDetection.patterns;
      
      expect(patterns.sqlInjection).toBeDefined();
      expect(patterns.xssAttempts).toBeDefined();
      expect(patterns.pathTraversal).toBeDefined();
      
      // verificar que tienen regex válidos
      expect(patterns.sqlInjection.regex).toBeInstanceOf(RegExp);
      expect(patterns.xssAttempts.regex).toBeInstanceOf(RegExp);
    });
  });
});
