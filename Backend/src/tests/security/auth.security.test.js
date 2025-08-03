/**
 * Pruebas de seguridad para autenticación
 */

const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');
const SecurityTestUtils = require('./security.utils');
const securityConfig = require('./security.config');

describe('Pruebas de Seguridad - Autenticación', () => {
  let app;
  let sequelize;
  let User;

  beforeAll(async () => {
    //config de base de datos en memoria
    sequelize = new Sequelize('sqlite::memory:', { 
      logging: false,
      dialect: 'sqlite'
    });

    //definir modelo User simplificado
    User = sequelize.define('Usuarios', {
      id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [1, securityConfig.limits.maxFieldLength]
        }
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          len: [1, securityConfig.limits.maxEmailLength]
        }
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [securityConfig.password.minLength, securityConfig.password.maxLength]
        }
      }
    }, {
      tableName: 'Usuarios',
      timestamps: false,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        }
      }
    });

    User.prototype.validPassword = async function(password) {
      return await bcrypt.compare(password, this.password);
    };

    app = express();
    app.use(express.json({ limit: securityConfig.limits.maxRequestSize }));

    // !!! MOCK del controlador de auth con validaciones
    const authController = {
      login: async (req, res) => {
        try {
          const { email, password } = req.body;
          
          if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña requeridos' });
          }

          if (email.length > securityConfig.limits.maxEmailLength) {
            return res.status(400).json({ error: 'Email demasiado largo' });
          }

          if (password.length > securityConfig.limits.maxPasswordLength) {
            return res.status(400).json({ error: 'Contraseña demasiado larga' });
          }

          const user = await User.findOne({ where: { email: email.trim() } });
          
          if (!user || !(await user.validPassword(password))) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
          }

          return res.json({
            id: user.id_usuario,
            nombre: user.nombre,
            email: user.email
          });
        } catch (err) {
          console.error('Error en login:', err);
          return res.status(500).json({ error: 'Error en el servidor' });
        }
      },

      register: async (req, res) => {
        try {
          const { nombre, email, password } = req.body;

          if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Campos requeridos faltantes' });
          }

          // Validación de SQL injection y XSS
          const maliciousPatterns = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'UNION', '--', ';', '<script', 'javascript:', 'onload=', 'eval('];
          const hasMaliciousContent = maliciousPatterns.some(pattern => 
            nombre?.toString().toUpperCase().includes(pattern.toUpperCase()) ||
            email?.toString().toUpperCase().includes(pattern.toUpperCase())
          );

          if (hasMaliciousContent) {
            return res.status(400).json({ error: 'Contenido no permitido detectado' });
          }

          //longitudes
          if (nombre.length > securityConfig.limits.maxFieldLength ||
              email.length > securityConfig.limits.maxEmailLength ||
              password.length > securityConfig.limits.maxPasswordLength) {
            return res.status(400).json({ error: 'Campos demasiado largos' });
          }

          //formato de email
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Formato de email inválido' });
          }

          //fortaleza de contraseña - longitud primero
          if (password.length < securityConfig.password.minLength) {
            return res.status(400).json({ 
              error: `Contraseña debe tener al menos ${securityConfig.password.minLength} caracteres` 
            });
          }

          // Validaciones adicionales de contraseña
          if (!/[A-Z]/.test(password)) {
            return res.status(400).json({ error: 'Contraseña debe tener al menos una mayúscula' });
          }
          if (!/[a-z]/.test(password)) {
            return res.status(400).json({ error: 'Contraseña debe tener al menos una minúscula' });
          }
          if (!/[0-9]/.test(password)) {
            return res.status(400).json({ error: 'Contraseña debe tener al menos un número' });
          }
          if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return res.status(400).json({ error: 'Contraseña debe tener al menos un carácter especial' });
          }

          const existingUser = await User.findOne({ where: { email: email.trim() } });
          if (existingUser) {
            return res.status(409).json({ error: 'Email ya registrado' });
          }

          const newUser = await User.create({
            nombre: nombre.trim(),
            email: email.trim(),
            password
          });

          return res.status(201).json({
            id: newUser.id_usuario,
            nombre: newUser.nombre,
            email: newUser.email
          });
        } catch (err) {
          console.error('Error en registro:', err);
          
          // Si es error de validación de Sequelize (como email inválido)
          if (err.name === 'SequelizeValidationError') {
            const emailError = err.errors.find(e => e.path === 'email');
            if (emailError) {
              return res.status(400).json({ error: 'Formato de email inválido' });
            }
            return res.status(400).json({ error: 'Datos de entrada inválidos' });
          }
          
          return res.status(400).json({ error: 'Error en registro' });
        }
      }
    };

    app.post('/api/auth/login', authController.login);
    app.post('/api/auth/register', authController.register);

    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    try {
      await sequelize.close();
    } catch (error) {
      // Database ya cerrada, ignorar error
    }
  });

  beforeEach(async () => {
    try {
      await User.destroy({ where: {}, truncate: true });
    } catch (error) {
      // Si hay error de conexión, recrear una nueva instancia
      if (error.message.includes('closed') || error.message.includes('SQLITE_MISUSE')) {
        // No hacer nada, la configuración inicial está bien
        console.log('Base de datos ya cerrada, usando configuración inicial');
      }
    }
  });

  describe('Validación de Entrada', () => {
    test('Debe rechazar campos vacíos en login', async () => {
      const testCases = [
        { email: '', password: 'test123' },
        { email: 'test@test.com', password: '' },
        { email: '', password: '' },
        { email: null, password: 'test123' },
        { email: 'test@test.com', password: null }
      ];

      for (const testCase of testCases) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(testCase);

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('requeridos');
      }
    });

    test('Debe rechazar campos excesivamente largos', async () => {
      const oversizedData = SecurityTestUtils.generateOversizedData();
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: oversizedData.hugeName,
          email: `test@test.com`,
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('largo');
    });
  });

  describe('Protección contra SQL Injection', () => {
    test('Debe rechazar payloads de SQL injection en email', async () => {
      const maliciousPayloads = SecurityTestUtils.getMaliciousPayloads().sqlInjection;

      for (const payload of maliciousPayloads) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: payload,
            password: 'password123'
          });

        expect(response.status).toBeGreaterThanOrEqual(400);
        
        //una verificacion que ve que no se exponga información de BD
        expect(SecurityTestUtils.containsSensitiveInfo(response.body)).toBe(false);
      }
    });

    test('Debe sanitizar entrada en registro', async () => {
      const maliciousPayloads = SecurityTestUtils.getMaliciousPayloads().sqlInjection;

      for (const payload of maliciousPayloads) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            nombre: payload,
            email: 'test@test.com',
            password: 'password123'
          });

        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe('Validación de contraseñas', () => {
    test('Debe rechazar contraseñas débiles', async () => {
      const weakPasswords = SecurityTestUtils.getTestPasswords().weak;

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            nombre: 'Test User',
            email: `test${Date.now()}@test.com`,
            password: password
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/caracteres|mayúscula|minúscula|número|especial/);
      }
    });

    test('Debe aceptar contraseñas fuertes', async () => {
      const strongPasswords = SecurityTestUtils.getTestPasswords().strong;

      for (const password of strongPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            nombre: 'Test User',
            email: `test${Date.now()}@test.com`,
            password: password
          });

        expect(response.status).toBe(201);
      }
    });
  });

  describe('Validación de email', () => {
    test('Debe rechazar emails maliciosos', async () => {
      const maliciousEmails = SecurityTestUtils.getMaliciousEmails();

      for (const email of maliciousEmails) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            nombre: 'Test User',
            email: email,
            password: 'securepass123'
          });

        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });

    test('Debe validar formato de email correctamente', async () => {
      const invalidEmails = [
        'notanemail',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        'user@domain',
        'user name@domain.com'
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            nombre: 'Test User',
            email: email,
            password: 'TestPassword123!' // Contraseña válida para que falle solo por email
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/email|formato|inválido/i);
      }
    });
  });

  describe('Prevención de "Enumeración" de Usuarios', () => {
    test('No debe revelar si un usuario existe', async () => {
      //user válido
      await User.create({
        nombre: 'Test User',
        email: 'valid@test.com',
        password: 'password123'
      });

      //login con usuario válido pero contraseña incorrecta
      const response1 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'valid@test.com',
          password: 'wrongpassword'
        });

      //login con usuario inexistente
      const response2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'somepassword'
        });

      //ambas respuestas deben ser idénticas
      expect(response1.status).toBe(response2.status);
      expect(response1.body.error).toBe(response2.body.error);
      expect(response1.body.error).toBe('Credenciales inválidas');
    });
  });

  describe('Manejo Seguro de Errores', () => {
    test('No debe exponer información sensible en errores', async () => {
      //Simular error cerrando conexión de BD
      await sequelize.close();

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error en el servidor');
      
      //Verificar que no se exponga información sensible
      expect(SecurityTestUtils.containsSensitiveInfo(response.body)).toBe(false);
    });
  });

  describe('Validación de Configuración', () => {
    test('Configuración de seguridad debe ser válida', () => {
      const validation = SecurityTestUtils.validateSecurityConfig();
      
      expect(validation.isValid).toBe(true);
      
      if (!validation.isValid) {
        console.warn('Issues de configuración encontrados:', validation.issues);
      }
    });
  });
});
