const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ong = sequelize.define('ONGs', {
  id_ong: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_ong: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING(15),
    validate: {
      len: [8, 15]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    unique: true,
    validate: {
      isEmail: true
    }
  },
  representante: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  tipo_ong: {
    type: DataTypes.ENUM('Salud', 'Educación', 'Nutrición', 'Niñez', 'Otro')
  },
  fecha_fundacion: {
    type: DataTypes.DATEONLY,
    validate: {
      isDate: true,
      isBefore: new Date().toISOString()
    }
  },
  mision: DataTypes.TEXT,
  vision: DataTypes.TEXT,
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // ✅ NUEVO: Fecha de registro
  fecha_registro: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: true,
      isBefore: new Date().toISOString()
    }
  },
  sitio_web: {
    type: DataTypes.STRING(255),
    defaultValue: '100'
  },
  comentarios: DataTypes.TEXT,
  // ✅ NUEVO: Personal encargado
  personal_encargado: {
    type: DataTypes.STRING(255),
    defaultValue: '100'
  },
  id_comunidad: DataTypes.INTEGER
}, {
  tableName: 'ONGs',
  timestamps: false,
  hooks: {
    beforeCreate: (ong) => {
      // Asegurar fecha de registro
      if (!ong.fecha_registro) {
        ong.fecha_registro = new Date();
      }
    }
  }
});

module.exports = Ong;