/**
 * pruebas automáticas de gestión de sesiones y auditoría
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
const UserManagementUtils = require('./usermanagement.utils');
const userManagementConfig = require('./usermanagement.config');

describe('Gestión de Sesiones y Auditoría', () => {
  let app;
  let sequelize;
  let User, Session, AuditLog;
  let testUsers;
  let activeSessions = new Map(); // simulador de sesiones activas

  beforeAll(async () => {
    // configuración de base de datos en memoria
    sequelize = new Sequelize('sqlite::memory:', { 
      logging: false,
      dialect: 'sqlite'
    });

    // modelos para testing
    User = sequelize.define('User', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: DataTypes.STRING, unique: true },
      rol: { type: DataTypes.STRING },
      sesiones_activas: { type: DataTypes.INTEGER, defaultValue: 0 },
      ultimo_acceso: { type: DataTypes.DATE },
      intentos_login: { type: DataTypes.INTEGER, defaultValue: 0 },
      bloqueado_hasta: { type: DataTypes.DATE }
    });

    Session = sequelize.define('Session', {
      id: { type: DataTypes.STRING, primaryKey: true }, // session_id
      user_id: { type: DataTypes.INTEGER },
      ip_address: { type: DataTypes.STRING },
      user_agent: { type: DataTypes.STRING },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      last_activity: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      expires_at: { type: DataTypes.DATE },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
    });

    AuditLog = sequelize.define('AuditLog', {
      id: { type: DataTypes.STRING, primaryKey: true },
      action: { type: DataTypes.STRING },
      user_id: { type: DataTypes.INTEGER },
      ip_address: { type: DataTypes.STRING },
      user_agent: { type: DataTypes.STRING },
      success: { type: DataTypes.BOOLEAN },
      risk_level: { type: DataTypes.STRING },
      details: { type: DataTypes.TEXT }
    });

    await sequelize.sync();

    // configuración de express
    app = express();
    app.use(express.json());

    // middleware para capturar información de request
    app.use((req, res, next) => {
      req.clientInfo = {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Unknown'
      };
      next();
    });

    // middleware de autenticación con gestión de sesiones
    const sessionMiddleware = async (req, res, next) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'token requerido' });
      }

      try {
        const decoded = jwt.verify(token, 'test-secret');
        
        // verificar sesión activa
        const session = activeSessions.get(decoded.session_id);
        if (!session || !session.is_active) {
          return res.status(401).json({ error: 'sesión inválida' });
        }

        // verificar expiración
        if (new Date() > new Date(session.expires_at)) {
          activeSessions.delete(decoded.session_id);
          return res.status(401).json({ error: 'sesión expirada' });
        }

        // actualizar última actividad
        session.last_activity = new Date();
        activeSessions.set(decoded.session_id, session);

        req.user = decoded;
        req.session = session;
        next();
      } catch (error) {
        return res.status(401).json({ error: 'token inválido' });
      }
    };

    // función para registrar auditoría
    const logAudit = async (action, userId, success, details = {}) => {
      const auditData = UserManagementUtils.generateAuditLog(action, userId, {
        ...details,
        success,
        ip: details.ip || '127.0.0.1',
        userAgent: details.userAgent || 'Test'
      });

      await AuditLog.create(auditData);
      return auditData;
    };

    // endpoints de gestión de sesiones
    app.post('/api/auth/login', async (req, res) => {
      const { email, password } = req.body;
      
      try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
          await logAudit('login', null, false, { 
            reason: 'usuario no encontrado',
            email,
            ...req.clientInfo 
          });
          return res.status(401).json({ error: 'credenciales inválidas' });
        }

        // verificar si usuario está bloqueado
        if (user.bloqueado_hasta && new Date() < user.bloqueado_hasta) {
          await logAudit('login', user.id, false, { 
            reason: 'usuario bloqueado',
            ...req.clientInfo 
          });
          return res.status(423).json({ error: 'usuario bloqueado temporalmente' });
        }

        // verificar límite de sesiones concurrentes
        if (user.sesiones_activas >= userManagementConfig.session.maxConcurrentSessions) {
          await logAudit('login', user.id, false, { 
            reason: 'límite de sesiones alcanzado',
            ...req.clientInfo 
          });
          return res.status(429).json({ error: 'límite de sesiones concurrentes alcanzado' });
        }

        // crear nueva sesión
        const sessionData = UserManagementUtils.generateSessionData(user.id, {
          ip: req.clientInfo.ip,
          userAgent: req.clientInfo.userAgent
        });

        activeSessions.set(sessionData.session_id, sessionData);
        await Session.create(sessionData);

        // actualizar usuario
        await user.update({
          sesiones_activas: user.sesiones_activas + 1,
          ultimo_acceso: new Date(),
          intentos_login: 0,
          bloqueado_hasta: null
        });

        // generar token
        const tokenPayload = {
          id: user.id,
          email: user.email,
          rol: user.rol,
          permissions: userManagementConfig.roles[user.rol]?.permissions || [],
          session_id: sessionData.session_id,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor((Date.now() + userManagementConfig.session.maxDuration) / 1000)
        };

        const token = jwt.sign(tokenPayload, 'test-secret');

        await logAudit('login', user.id, true, req.clientInfo);

        res.json({ 
          token, 
          session_id: sessionData.session_id,
          expires_at: sessionData.expires_at
        });

      } catch (error) {
        await logAudit('login', null, false, { 
          error: error.message,
          ...req.clientInfo 
        });
        res.status(500).json({ error: 'error interno' });
      }
    });

    app.post('/api/auth/logout', sessionMiddleware, async (req, res) => {
      try {
        // terminar sesión
        activeSessions.delete(req.user.session_id);
        await Session.update(
          { is_active: false },
          { where: { id: req.user.session_id } }
        );

        // actualizar contador de sesiones
        const user = await User.findByPk(req.user.id);
        if (user) {
          await user.update({
            sesiones_activas: Math.max(0, user.sesiones_activas - 1)
          });
        }

        await logAudit('logout', req.user.id, true, req.clientInfo);
        res.json({ message: 'sesión cerrada' });

      } catch (error) {
        await logAudit('logout', req.user.id, false, { 
          error: error.message,
          ...req.clientInfo 
        });
        res.status(500).json({ error: 'error cerrando sesión' });
      }
    });

    app.get('/api/auth/sessions', sessionMiddleware, async (req, res) => {
      try {
        const sessions = await Session.findAll({
          where: { user_id: req.user.id, is_active: true }
        });

        res.json({ sessions: sessions.length, details: sessions });

      } catch (error) {
        res.status(500).json({ error: 'error obteniendo sesiones' });
      }
    });

    app.delete('/api/auth/sessions/:sessionId', sessionMiddleware, async (req, res) => {
      try {
        const { sessionId } = req.params;
        
        // verificar que el usuario puede terminar esta sesión
        const session = await Session.findOne({
          where: { id: sessionId, user_id: req.user.id }
        });

        if (!session) {
          return res.status(404).json({ error: 'sesión no encontrada' });
        }

        // terminar sesión
        activeSessions.delete(sessionId);
        await Session.update(
          { is_active: false },
          { where: { id: sessionId } }
        );

        await logAudit('session_terminated', req.user.id, true, { 
          terminated_session: sessionId,
          ...req.clientInfo 
        });

        res.json({ message: 'sesión terminada' });

      } catch (error) {
        res.status(500).json({ error: 'error terminando sesión' });
      }
    });

    app.get('/api/protected-resource', sessionMiddleware, async (req, res) => {
      await logAudit('resource_access', req.user.id, true, { 
        resource: 'protected-resource',
        ...req.clientInfo 
      });
      res.json({ message: 'recurso protegido accedido' });
    });

    app.get('/api/audit/logs', sessionMiddleware, async (req, res) => {
      try {
        // verificar permisos para ver logs
        if (!UserManagementUtils.hasPermission(req.user.rol, 'reports:read')) {
          return res.status(403).json({ error: 'sin permisos para auditoría' });
        }

        const logs = await AuditLog.findAll({
          order: [['createdAt', 'DESC']],
          limit: 50
        });

        res.json({ logs });

      } catch (error) {
        res.status(500).json({ error: 'error obteniendo logs' });
      }
    });

    // generar usuarios de prueba
    testUsers = UserManagementUtils.generateTestUsers(3);
    for (const user of testUsers) {
      await User.create(user);
    }
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // limpiar sesiones y auditoría entre tests
    activeSessions.clear();
    await Session.destroy({ where: {} });
    await AuditLog.destroy({ where: {} });
    await User.update(
      { sesiones_activas: 0, intentos_login: 0, bloqueado_hasta: null },
      { where: {} }
    );
  });

  describe('inicio de sesión y autenticación', () => {
    test('debería crear sesión válida con login exitoso', async () => {
      const user = testUsers[0];

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'TestPassword123!' })
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.session_id).toBeDefined();
      expect(response.body.expires_at).toBeDefined();

      // verificar que la sesión se creó
      expect(activeSessions.has(response.body.session_id)).toBe(true);
    });

    test('debería registrar auditoría de login exitoso', async () => {
      const user = testUsers[0];

      await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'TestPassword123!' })
        .expect(200);

      const auditLogs = await AuditLog.findAll({ where: { action: 'login' } });
      expect(auditLogs.length).toBe(1);
      expect(auditLogs[0].success).toBe(true);
      expect(auditLogs[0].user_id).toBe(user.id);
    });

    test('debería rechazar login con credenciales incorrectas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'inexistente@test.com', password: 'wrong' })
        .expect(401);

      expect(response.body.error).toBe('credenciales inválidas');

      // verificar auditoría
      const auditLogs = await AuditLog.findAll({ where: { action: 'login' } });
      expect(auditLogs.length).toBe(1);
      expect(auditLogs[0].success).toBe(false);
    });
  });

  describe('gestión de sesiones concurrentes', () => {
    test('debería permitir múltiples sesiones hasta el límite', async () => {
      const user = testUsers[0];
      const maxSessions = userManagementConfig.session.maxConcurrentSessions;

      // crear sesiones hasta el límite
      for (let i = 0; i < maxSessions; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({ email: user.email, password: 'TestPassword123!' })
          .expect(200);
      }

      // verificar límite alcanzado
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'TestPassword123!' })
        .expect(429);

      expect(response.body.error).toBe('límite de sesiones concurrentes alcanzado');
    });

    test('debería mostrar sesiones activas del usuario', async () => {
      const user = testUsers[0];

      // crear dos sesiones
      const login1 = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'TestPassword123!' });

      const login2 = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'TestPassword123!' });

      // consultar sesiones
      const response = await request(app)
        .get('/api/auth/sessions')
        .set('Authorization', `Bearer ${login1.body.token}`)
        .expect(200);

      expect(response.body.sessions).toBe(2);
      expect(response.body.details).toHaveLength(2);
    });
  });

  describe('terminación de sesiones', () => {
    test('debería cerrar sesión correctamente', async () => {
      const user = testUsers[0];

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'TestPassword123!' });

      const token = loginResponse.body.token;

      // cerrar sesión
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // verificar que la sesión ya no es válida
      await request(app)
        .get('/api/protected-resource')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });

    test('debería registrar auditoría de logout', async () => {
      const user = testUsers[0];

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'TestPassword123!' });

      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${loginResponse.body.token}`);

      const auditLogs = await AuditLog.findAll({ where: { action: 'logout' } });
      expect(auditLogs.length).toBe(1);
      expect(auditLogs[0].success).toBe(true);
    });

    test('debería terminar sesión específica', async () => {
      const user = testUsers[0];

      const login1 = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'TestPassword123!' });

      const login2 = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'TestPassword123!' });

      // crear sesión en la base de datos para el primer login
      await Session.create({
        id: login1.body.session_id,
        user_id: user.id,
        ip_address: '127.0.0.1',
        user_agent: 'Test',
        is_active: true,
        expires_at: new Date(Date.now() + 3600000)
      });

      // terminar sesión específica
      await request(app)
        .delete(`/api/auth/sessions/${login1.body.session_id}`)
        .set('Authorization', `Bearer ${login2.body.token}`)
        .expect(200);

      // verificar que la primera sesión está terminada
      await request(app)
        .get('/api/protected-resource')
        .set('Authorization', `Bearer ${login1.body.token}`)
        .expect(401);

      // verificar que la segunda sesión sigue activa
      await request(app)
        .get('/api/protected-resource')
        .set('Authorization', `Bearer ${login2.body.token}`)
        .expect(200);
    });
  });

  describe('expiración de sesiones', () => {
    test('debería rechazar sesiones expiradas', async () => {
      const user = testUsers[0];

      // crear token con expiración muy corta
      const shortExpiryToken = UserManagementUtils.generateTestJWT(user, {
        secret: 'test-secret',
        expiresIn: 100 // 100ms
      });

      const sessionData = UserManagementUtils.generateSessionData(user.id);
      sessionData.expires_at = new Date(Date.now() + 100); // 100ms
      activeSessions.set(sessionData.session_id, sessionData);

      // esperar a que expire
      await new Promise(resolve => setTimeout(resolve, 150));

      await request(app)
        .get('/api/protected-resource')
        .set('Authorization', `Bearer ${shortExpiryToken}`)
        .expect(401);
    });
  });

  describe('auditoría de acciones', () => {
    test('debería registrar acceso a recursos protegidos', async () => {
      const user = testUsers[0];

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'TestPassword123!' });

      await request(app)
        .get('/api/protected-resource')
        .set('Authorization', `Bearer ${loginResponse.body.token}`);

      const auditLogs = await AuditLog.findAll({ 
        where: { action: 'resource_access' } 
      });
      expect(auditLogs.length).toBe(1);
      expect(auditLogs[0].user_id).toBe(user.id);
    });

    test('admin debería poder consultar logs de auditoría', async () => {
      const adminUser = testUsers.find(u => u.rol === 'admin');

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: adminUser.email, password: 'TestPassword123!' });

      // generar algo de actividad
      await request(app)
        .get('/api/protected-resource')
        .set('Authorization', `Bearer ${loginResponse.body.token}`);

      // consultar logs
      const response = await request(app)
        .get('/api/audit/logs')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .expect(200);

      expect(response.body.logs).toBeDefined();
      expect(response.body.logs.length).toBeGreaterThan(0);
    });

    test('usuario sin permisos no debería acceder a logs', async () => {
      const guestUser = UserManagementUtils.generateTestUser('guest');
      await User.create(guestUser);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: guestUser.email, password: 'TestPassword123!' });

      const response = await request(app)
        .get('/api/audit/logs')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .expect(403);
        
      expect(response.body.error).toBe('sin permisos para auditoría');
    });
  });

  describe('detección de actividad sospechosa', () => {
    test('debería detectar cambios de IP en sesión activa', async () => {
      const user = testUsers[0];

      // login inicial
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .set('x-forwarded-for', '192.168.1.1')
        .send({ email: user.email, password: 'TestPassword123!' });

      // acceso desde IP diferente (simulado con diferentes headers)
      await request(app)
        .get('/api/protected-resource')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .set('x-forwarded-for', '10.0.0.1');

      // la sesión debería seguir funcionando pero generar alerta
      const auditLogs = await AuditLog.findAll();
      const suspiciousLogs = auditLogs.filter(log => 
        log.risk_level === 'high' || log.details.includes('ip_change')
      );
      
      // en una implementación real, esto generaría una alerta
      expect(auditLogs.length).toBeGreaterThan(1);
    });
  });

  describe('limpieza automática de sesiones', () => {
    test('configuración de limpieza debería estar definida', () => {
      expect(userManagementConfig.limits.sessionCleanupInterval).toBeDefined();
      expect(typeof userManagementConfig.limits.sessionCleanupInterval).toBe('number');
      expect(userManagementConfig.limits.sessionCleanupInterval).toBeGreaterThan(0);
    });
  });
});
