// Backend/src/tests/authController.test.js
const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');

// Crear app de prueba
const app = express();
app.use(express.json());

// Configurar base de datos en memoria para pruebas
const sequelize = new Sequelize('sqlite::memory:', { 
  logging: false,
  dialect: 'sqlite'
});

// Definir modelo User para pruebas (igual al real)
const User = sequelize.define('Usuarios', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  rol: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tipo_referencia: {
    type: DataTypes.STRING,
    allowNull: true
  },
  id_referencia: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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

// Método para validar contraseñas
User.prototype.validPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Controlador de auth simplificado para pruebas
const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Validar que los campos requeridos estén presentes
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      const user = await User.findOne({ where: { email } });
      
      if (!user || !(await user.validPassword(password))) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      return res.json({
        id: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol,
        tipo_ref: user.tipo_referencia,
        id_ref: user.id_referencia
      });
    } catch (err) {
      console.error('Error en inicio de sesión:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
  },

  register: async (req, res) => {
    try {
      const {
        nombre,
        apellido,
        email,
        password,
        rol,
        tipo_referencia,
        id_referencia
      } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }

      const newUser = await User.create({
        nombre,
        apellido,
        email,
        password,
        rol,
        tipo_referencia,
        id_referencia
      });

      return res.status(201).json({
        id: newUser.id_usuario,
        nombre: newUser.nombre,
        apellido: newUser.apellido,
        email: newUser.email,
        rol: newUser.rol,
        tipo_ref: newUser.tipo_referencia,
        id_ref: newUser.id_referencia
      });
    } catch (err) {
      console.error('Error en registro:', err);
      return res.status(400).json({ error: err.message });
    }
  }
};

// Configurar rutas
app.post('/api/auth/login', authController.login);
app.post('/api/auth/register', authController.register);

describe('Backend - Auth Controller Login', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Limpiar la tabla antes de cada test
    await User.destroy({ where: {} });
  });

  describe('POST /api/auth/login', () => {
    test('debería hacer login exitoso con credenciales correctas', async () => {
      // Arrange - Crear usuario de prueba
      const testUser = await User.create({
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@test.com',
        password: 'password123',
        rol: 'ONG',
        tipo_referencia: 'ONG',
        id_referencia: 1
      });

      // Act - Hacer petición de login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'juan@test.com',
          password: 'password123'
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('juan@test.com');
      expect(response.body.nombre).toBe('Juan');
      expect(response.body.apellido).toBe('Pérez');
      expect(response.body.rol).toBe('ONG');
      expect(response.body).not.toHaveProperty('password'); // No debe devolver la contraseña
    });

    test('debería fallar con credenciales incorrectas - email inexistente', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@test.com',
          password: 'password123'
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Credenciales inválidas');
    });

    test('debería fallar con credenciales incorrectas - contraseña incorrecta', async () => {
      // Arrange
      await User.create({
        nombre: 'María',
        apellido: 'García',
        email: 'maria@test.com',
        password: 'password123',
        rol: 'Voluntario'
      });

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'maria@test.com',
          password: 'contraseñaincorrecta'
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Credenciales inválidas');
    });

    test('debería manejar campos faltantes', async () => {
      // Act - Sin email
      const response1 = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        });

      // Act - Sin password
      const response2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com'
        });

      // Act - Sin ningún campo
      const response3 = await request(app)
        .post('/api/auth/login')
        .send({});

      // Act - Campos vacíos
      const response4 = await request(app)
        .post('/api/auth/login')
        .send({
          email: '',
          password: ''
        });

      // Assert
      expect(response1.status).toBe(400);
      expect(response1.body.error).toBe('Email y contraseña son requeridos');
      
      expect(response2.status).toBe(400);
      expect(response2.body.error).toBe('Email y contraseña son requeridos');
      
      expect(response3.status).toBe(400);
      expect(response3.body.error).toBe('Email y contraseña son requeridos');
      
      expect(response4.status).toBe(400);
      expect(response4.body.error).toBe('Email y contraseña son requeridos');
    });

    test('debería hacer login con diferentes tipos de usuario', async () => {
      // Arrange - Crear usuarios de diferentes tipos
      const ongUser = await User.create({
        nombre: 'Admin',
        apellido: 'ONG',
        email: 'admin@ong.com',
        password: 'password123',
        rol: 'ONG',
        tipo_referencia: 'ONG',
        id_referencia: 1
      });

      const volunteerUser = await User.create({
        nombre: 'Carlos',
        apellido: 'Voluntario',
        email: 'carlos@volunteer.com',
        password: 'password123',
        rol: 'Voluntario',
        tipo_referencia: 'Voluntario',
        id_referencia: 2
      });

      const leaderUser = await User.create({
        nombre: 'Ana',
        apellido: 'Líder',
        email: 'ana@comunidad.com',
        password: 'password123',
        rol: 'Lider Comunitario',
        tipo_referencia: 'Comunidad',
        id_referencia: 3
      });

      // Act & Assert - Login ONG
      const responseOng = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@ong.com',
          password: 'password123'
        });

      expect(responseOng.status).toBe(200);
      expect(responseOng.body.rol).toBe('ONG');

      // Act & Assert - Login Voluntario
      const responseVolunteer = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'carlos@volunteer.com',
          password: 'password123'
        });

      expect(responseVolunteer.status).toBe(200);
      expect(responseVolunteer.body.rol).toBe('Voluntario');

      // Act & Assert - Login Líder Comunitario
      const responseLeader = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ana@comunidad.com',
          password: 'password123'
        });

      expect(responseLeader.status).toBe(200);
      expect(responseLeader.body.rol).toBe('Lider Comunitario');
    });

    test('debería verificar que la contraseña esté encriptada en la base de datos', async () => {
      // Arrange
      const plainPassword = 'password123';
      const user = await User.create({
        nombre: 'Test',
        apellido: 'User',
        email: 'test@encryption.com',
        password: plainPassword,
        rol: 'ONG'
      });

      // Assert - La contraseña en DB debe estar encriptada
      expect(user.password).not.toBe(plainPassword);
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$.{53}$/); // Formato bcrypt
      
      // Verificar que la validación funciona
      const isValid = await user.validPassword(plainPassword);
      expect(isValid).toBe(true);
      
      const isInvalid = await user.validPassword('wrongpassword');
      expect(isInvalid).toBe(false);
    });
  });
});