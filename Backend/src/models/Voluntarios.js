const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Voluntario = sequelize.define('Voluntarios', {
  id_voluntario: {
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
  dpi: {
    type: DataTypes.STRING(13),
    unique: true,
    validate: {
      len: [13, 13]
    }
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    validate: {
      isDate: true,
      isBefore: new Date().toISOString()
    }
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
  direccion: DataTypes.STRING(255),
  experiencia: DataTypes.TEXT,
  disponibilidad: {
    type: DataTypes.ENUM('Baja', 'Media', 'Alta')
  },
  tipo_voluntario: DataTypes.STRING(255),
  institucion: DataTypes.STRING(255),
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  habilidades: DataTypes.TEXT,
  comentarios: DataTypes.TEXT
}, {
  tableName: 'Voluntarios',
  timestamps: false,
  hooks: {
    beforeCreate: (voluntario) => {
      if (!voluntario.fecha_registro) {
        voluntario.fecha_registro = new Date();
      }
    }
  }
});

module.exports = Voluntario;