const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

// Crear una instancia SQLite en memoria para testeo
const sequelize = new Sequelize('sqlite::memory:', { 
  logging: false,
  dialect: 'sqlite'
});

// Definir el modelo User para testing
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
    allowNull: true,
    validate: {
      isIn: [['ONG', 'Voluntario', 'Lider Comunitario']]
    }
  },
  tipo_referencia: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['ONG', 'Voluntario', 'Comunidad']]
    }
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
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

// Método para validar contraseñas
User.prototype.validPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

describe('Modelo User', () => {
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

  it('debería crear un usuario con contraseña encriptada', async () => {
    const userData = {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@example.com',
      password: 'password123',
      rol: 'Voluntario'
    };

    const user = await User.create(userData);

    expect(user.id_usuario).toBeDefined();
    expect(user.nombre).toBe('Juan');
    expect(user.apellido).toBe('Pérez');
    expect(user.email).toBe('juan@example.com');
    expect(user.rol).toBe('Voluntario');
    expect(user.estado).toBe(true);
    
    // La contraseña debe estar encriptada
    expect(user.password).not.toBe('password123');
    expect(user.password.length).toBeGreaterThan(20); // bcrypt hash es largo
  });

  it('debería validar contraseña correctamente', async () => {
    const user = await User.create({
      nombre: 'Ana',
      apellido: 'García',
      email: 'ana@example.com',
      password: 'mypassword',
      rol: 'ONG'
    });

    const isValidCorrect = await user.validPassword('mypassword');
    const isValidIncorrect = await user.validPassword('wrongpassword');

    expect(isValidCorrect).toBe(true);
    expect(isValidIncorrect).toBe(false);
  });

  it('debería validar formato de email', async () => {
    await expect(
      User.create({
        nombre: 'Test',
        apellido: 'User',
        email: 'email-inválido',
        password: 'password123'
      })
    ).rejects.toThrow();
  });

  it('debería requerir campos obligatorios', async () => {
    await expect(
      User.create({
        // Falta nombre
        apellido: 'Pérez',
        email: 'test@example.com',
        password: 'password123'
      })
    ).rejects.toThrow();

    await expect(
      User.create({
        nombre: 'Juan',
        // Falta apellido
        email: 'test@example.com',
        password: 'password123'
      })
    ).rejects.toThrow();
  });

  it('debería mantener email único', async () => {
    await User.create({
      nombre: 'Usuario1',
      apellido: 'Apellido1',
      email: 'duplicado@example.com',
      password: 'password123'
    });

    await expect(
      User.create({
        nombre: 'Usuario2',
        apellido: 'Apellido2',
        email: 'duplicado@example.com', // Email duplicado
        password: 'password456'
      })
    ).rejects.toThrow();
  });

  it('debería validar roles permitidos', async () => {
    await expect(
      User.create({
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        password: 'password123',
        rol: 'RolInválido'
      })
    ).rejects.toThrow();

    // Roles válidos deben funcionar
    const user = await User.create({
      nombre: 'Test',
      apellido: 'User',
      email: 'test@example.com',
      password: 'password123',
      rol: 'Lider Comunitario'
    });

    expect(user.rol).toBe('Lider Comunitario');
  });

  it('debería encriptar contraseña al actualizar', async () => {
    const user = await User.create({
      nombre: 'Test',
      apellido: 'User',
      email: 'test@example.com',
      password: 'originalpassword'
    });

    const originalHash = user.password;

    // Cambiar contraseña
    user.password = 'newpassword';
    await user.save();

    // La contraseña debe estar re-encriptada
    expect(user.password).not.toBe('newpassword');
    expect(user.password).not.toBe(originalHash);
    
    // Debe validar la nueva contraseña
    const isValid = await user.validPassword('newpassword');
    expect(isValid).toBe(true);
  });
});