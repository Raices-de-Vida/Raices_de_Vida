/**
 * pruebas automáticas de autorización y control de acceso
 */

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
const UserManagementUtils = require('./usermanagement.utils');
const userManagementConfig = require('./usermanagement.config');

describe('Autorización y Control de Acceso', () => {
  let app;
  let sequelize;
  let User;
  let testUsers;

  beforeAll(async () => {
    //config de base de datos en memoria
    sequelize = new Sequelize('sqlite::memory:', { 
      logging: false,
      dialect: 'sqlite'
    });

    // modelo User simplificado para testing
    User = sequelize.define('User', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: DataTypes.STRING, unique: true, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false },
      nombre: { type: DataTypes.STRING, allowNull: false },
      rol: { type: DataTypes.STRING, allowNull: false },
      activo: { type: DataTypes.BOOLEAN, defaultValue: true },
      intentos_login: { type: DataTypes.INTEGER, defaultValue: 0 },
      bloqueado_hasta: { type: DataTypes.DATE, allowNull: true },
      sesiones_activas: { type: DataTypes.INTEGER, defaultValue: 0 }
    });

    await sequelize.sync();

    // config de express con middleware de autorización
    app = express();
    app.use(express.json());

    // middleware de autenticación
    const authMiddleware = (req, res, next) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'token requerido' });
      }

      try {
        const decoded = jwt.verify(token, 'test-secret');
        req.user = decoded;
        next();
      } catch (error) {
        return res.status(401).json({ error: 'token inválido' });
      }
    };

    // middleware de autorización por rol
    const requireRole = (requiredRoles) => {
      return (req, res, next) => {
        if (!req.user) {
          return res.status(401).json({ error: 'no autenticado' });
        }

        const userRole = req.user.rol;
        const hasAccess = Array.isArray(requiredRoles) 
          ? requiredRoles.includes(userRole)
          : userRole === requiredRoles;

        if (!hasAccess) {
          return res.status(403).json({ error: 'acceso denegado' });
        }

        next();
      };
    };

    // middleware de autorización por permisos
    const requirePermission = (permission) => {
      return (req, res, next) => {
        if (!req.user) {
          return res.status(401).json({ error: 'no autenticado' });
        }

        const hasPermission = UserManagementUtils.hasPermission(req.user.rol, permission);
        if (!hasPermission) {
          return res.status(403).json({ error: 'permiso insuficiente' });
        }

        next();
      };
    };

    // endpoints de prueba
    app.get('/api/public', (req, res) => {
      res.json({ message: 'endpoint público' });
    });

    app.get('/api/protected', authMiddleware, (req, res) => {
      res.json({ message: 'endpoint protegido', user: req.user.email });
    });

    app.get('/api/admin-only', authMiddleware, requireRole('admin'), (req, res) => {
      res.json({ message: 'solo administradores' });
    });

    app.get('/api/ong-volunteer', authMiddleware, requireRole(['ong', 'voluntario']), (req, res) => {
      res.json({ message: 'ong o voluntarios' });
    });

    app.get('/api/read-users', authMiddleware, requirePermission('users:read'), (req, res) => {
      res.json({ message: 'datos de usuarios', permission: 'users:read' });
    });

    app.post('/api/write-users', authMiddleware, requirePermission('users:write'), (req, res) => {
      res.json({ message: 'usuario modificado', permission: 'users:write' });
    });

    app.delete('/api/delete-users/:id', authMiddleware, requirePermission('users:delete'), (req, res) => {
      res.json({ message: `usuario ${req.params.id} eliminado`, permission: 'users:delete' });
    });

    app.get('/api/reports', authMiddleware, requirePermission('reports:read'), (req, res) => {
      res.json({ message: 'reportes disponibles' });
    });

    // endpoint para verificar jerarquía
    app.get('/api/hierarchy/:targetRole', authMiddleware, (req, res) => {
      const canAccess = UserManagementUtils.canAccessRole(req.user.rol, req.params.targetRole);
      if (!canAccess) {
        return res.status(403).json({ error: 'nivel insuficiente' });
      }
      res.json({ message: `acceso a rol ${req.params.targetRole} permitido` });
    });

    // generar usuarios de prueba
    testUsers = UserManagementUtils.generateTestUsers(4);
    for (const user of testUsers) {
      await User.create(user);
    }
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // limpiar intentos de login
    await User.update(
      { intentos_login: 0, bloqueado_hasta: null },
      { where: {} }
    );
  });

  describe('acceso a endpoints públicos', () => {
    test('debería permitir acceso sin autenticación', async () => {
      const response = await request(app)
        .get('/api/public')
        .expect(200);

      expect(response.body.message).toBe('endpoint público');
    });
  });

  describe('protección de endpoints privados', () => {
    test('debería rechazar acceso sin token', async () => {
      const response = await request(app)
        .get('/api/protected')
        .expect(401);

      expect(response.body.error).toBe('token requerido');
    });

    test('debería rechazar token inválido', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer token-invalido')
        .expect(401);

      expect(response.body.error).toBe('token inválido');
    });

    test('debería permitir acceso con token válido', async () => {
      const user = testUsers.find(u => u.rol === 'ong');
      const token = UserManagementUtils.generateTestJWT(user);

      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('endpoint protegido');
      expect(response.body.user).toBe(user.email);
    });
  });

  describe('autorización por roles', () => {
    test('admin debería acceder a endpoint admin-only', async () => {
      const adminUser = testUsers.find(u => u.rol === 'admin');
      const token = UserManagementUtils.generateTestJWT(adminUser);

      const response = await request(app)
        .get('/api/admin-only')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('solo administradores');
    });

    test('voluntario no debería acceder a endpoint admin-only', async () => {
      const volunteerUser = testUsers.find(u => u.rol === 'voluntario');
      const token = UserManagementUtils.generateTestJWT(volunteerUser);

      const response = await request(app)
        .get('/api/admin-only')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.error).toBe('acceso denegado');
    });

    test('ong debería acceder a endpoint ong-volunteer', async () => {
      const ongUser = testUsers.find(u => u.rol === 'ong');
      const token = UserManagementUtils.generateTestJWT(ongUser);

      const response = await request(app)
        .get('/api/ong-volunteer')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('ong o voluntarios');
    });

    test('voluntario debería acceder a endpoint ong-volunteer', async () => {
      const volunteerUser = testUsers.find(u => u.rol === 'voluntario');
      const token = UserManagementUtils.generateTestJWT(volunteerUser);

      const response = await request(app)
        .get('/api/ong-volunteer')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toBe('ong o voluntarios');
    });
  });

  describe('autorización por permisos específicos', () => {
    test('admin debería leer usuarios', async () => {
      const adminUser = testUsers.find(u => u.rol === 'admin');
      const token = UserManagementUtils.generateTestJWT(adminUser);

      const response = await request(app)
        .get('/api/read-users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.permission).toBe('users:read');
    });

    test('voluntario no debería leer usuarios', async () => {
      const volunteerUser = testUsers.find(u => u.rol === 'voluntario');
      const token = UserManagementUtils.generateTestJWT(volunteerUser);

      const response = await request(app)
        .get('/api/read-users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.error).toBe('permiso insuficiente');
    });

    test('admin debería escribir usuarios', async () => {
      const adminUser = testUsers.find(u => u.rol === 'admin');
      const token = UserManagementUtils.generateTestJWT(adminUser);

      const response = await request(app)
        .post('/api/write-users')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'nuevo usuario' })
        .expect(200);

      expect(response.body.permission).toBe('users:write');
    });

    test('ong no debería escribir usuarios', async () => {
      const ongUser = testUsers.find(u => u.rol === 'ong');
      const token = UserManagementUtils.generateTestJWT(ongUser);

      const response = await request(app)
        .post('/api/write-users')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'nuevo usuario' })
        .expect(403);

      expect(response.body.error).toBe('permiso insuficiente');
    });

    test('solo admin debería eliminar usuarios', async () => {
      const adminUser = testUsers.find(u => u.rol === 'admin');
      const token = UserManagementUtils.generateTestJWT(adminUser);

      const response = await request(app)
        .delete('/api/delete-users/123')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.permission).toBe('users:delete');
    });
  });

  describe('jerarquía de roles', () => {
    test('admin debería acceder a roles inferiores', async () => {
      const adminUser = testUsers.find(u => u.rol === 'admin');
      const token = UserManagementUtils.generateTestJWT(adminUser);

      const response = await request(app)
        .get('/api/hierarchy/ong')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.message).toContain('acceso a rol ong permitido');
    });

    test('voluntario no debería acceder a roles superiores', async () => {
      const volunteerUser = testUsers.find(u => u.rol === 'voluntario');
      const token = UserManagementUtils.generateTestJWT(volunteerUser);

      const response = await request(app)
        .get('/api/hierarchy/admin')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.error).toBe('nivel insuficiente');
    });
  });

  describe('acceso a reportes', () => {
    test('admin debería acceder a reportes', async () => {
      const adminUser = testUsers.find(u => u.rol === 'admin');
      const token = UserManagementUtils.generateTestJWT(adminUser);

      await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    test('ong debería acceder a reportes', async () => {
      const ongUser = testUsers.find(u => u.rol === 'ong');
      const token = UserManagementUtils.generateTestJWT(ongUser);

      await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    test('voluntario debería acceder a reportes', async () => {
      const volunteerUser = testUsers.find(u => u.rol === 'voluntario');
      const token = UserManagementUtils.generateTestJWT(volunteerUser);

      await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    test('guest no debería acceder a reportes', async () => {
      const guestUser = UserManagementUtils.generateTestUser('guest');
      const token = UserManagementUtils.generateTestJWT(guestUser);

      const response = await request(app)
        .get('/api/reports')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.error).toBe('permiso insuficiente');
    });
  });

  describe('validación de configuración', () => {
    test('configuración de roles debería ser válida', () => {
      const validation = UserManagementUtils.validateUserSecurityConfig();
      expect(validation.isValid).toBe(true);
      expect(validation.issues).toEqual([]);
    });

    test('todos los roles deberían tener permisos definidos', () => {
      const roles = Object.keys(userManagementConfig.roles);
      
      for (const role of roles) {
        const roleConfig = userManagementConfig.roles[role];
        expect(roleConfig.permissions).toBeDefined();
        expect(Array.isArray(roleConfig.permissions)).toBe(true);
        expect(roleConfig.permissions.length).toBeGreaterThan(0);
      }
    });

    test('niveles de roles deberían ser consistentes', () => {
      const levels = Object.values(userManagementConfig.roles).map(r => r.level);
      const sortedLevels = [...levels].sort((a, b) => a - b);
      
      // verificar que admin tiene el nivel más alto
      const adminLevel = userManagementConfig.roles.admin.level;
      expect(adminLevel).toBe(Math.max(...levels));
      
      // verificar que guest tiene el nivel más bajo
      const guestLevel = userManagementConfig.roles.guest.level;
      expect(guestLevel).toBe(Math.min(...levels));
    });
  });
});
