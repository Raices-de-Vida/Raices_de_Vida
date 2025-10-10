const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

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
    type: DataTypes.ENUM('ONG', 'Voluntario', 'Lider Comunitario'),
    allowNull: true
  },
  // ✅ NUEVO: Fecha de registro
  fecha_registro: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  // ✅ NUEVO: Último acceso
  ultimo_acceso: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tipo_referencia: {
    type: DataTypes.ENUM('ONG', 'Voluntario', 'Comunidad'),
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
      // Encriptar contraseña
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
      // Asegurar fecha de registro
      if (!user.fecha_registro) {
        user.fecha_registro = new Date();
      }
    },
    beforeUpdate: async (user) => {
      // Encriptar contraseña solo si cambió
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

// ✅ NUEVO: Método para actualizar último acceso
User.prototype.updateLastAccess = async function() {
  this.ultimo_acceso = new Date();
  await this.save();
};

module.exports = User;