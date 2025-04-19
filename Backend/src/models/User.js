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

// Validar las contraseñas
User.prototype.validPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;