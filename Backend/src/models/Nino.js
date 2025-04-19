const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Nino = sequelize.define('Ninos', {
  id_nino: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_familia: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      isBefore: new Date().toISOString()
    }
  },
  genero: {
    type: DataTypes.ENUM('M', 'F')
  },
  peso: {
    type: DataTypes.DOUBLE,
    validate: {
      min: 0
    }
  },
  talla: {
    type: DataTypes.DOUBLE,
    validate: {
      min: 0
    }
  },
  estado_nutricional: {
    type: DataTypes.ENUM('Normal', 'Desnutrición Leve', 'Desnutrición Moderada', 'Desnutrición Severa')
  },
  alergias: DataTypes.TEXT,
  observaciones: DataTypes.TEXT,
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'Ninos',
  timestamps: false,
  hooks: {
    beforeCreate: (nino) => {
      if (!nino.fecha_evaluacion) {
        nino.fecha_evaluacion = new Date();
      }
    }
  }
});

module.exports = Nino;