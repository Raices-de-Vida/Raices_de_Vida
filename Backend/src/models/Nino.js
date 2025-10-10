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
  // ✅ NUEVO: Campo IMC calculado virtualmente
  // Se calcula automáticamente a partir de peso y talla
  // Fórmula: peso / (talla^2)
  imc: {
    type: DataTypes.VIRTUAL,
    get() {
      const peso = this.getDataValue('peso');
      const talla = this.getDataValue('talla');
      if (peso && talla && talla > 0) {
        return parseFloat((peso / (talla * talla)).toFixed(2));
      }
      return null;
    },
    set(value) {
      throw new Error('No se puede establecer el IMC manualmente, se calcula automáticamente');
    }
  },
  estado_nutricional: {
    type: DataTypes.ENUM('Normal', 'Desnutrición Leve', 'Desnutrición Moderada', 'Desnutrición Severa')
  },
  // ✅ NUEVO: Fecha de evaluación
  // Registra cuándo se realizó la última evaluación nutricional
  fecha_evaluacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
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
      // Asegurar que fecha_evaluacion tenga un valor al crear
      if (!nino.fecha_evaluacion) {
        nino.fecha_evaluacion = new Date();
      }
    }
  }
});

module.exports = Nino;