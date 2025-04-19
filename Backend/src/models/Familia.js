const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Familia = sequelize.define('Familias', {
  id_familia: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_esposo: DataTypes.STRING(255),
  nombre_esposa: DataTypes.STRING(255),
  dpi_esposo: {
    type: DataTypes.STRING(13),
    unique: true,
    validate: {
      len: [13, 13]
    }
  },
  dpi_esposa: {
    type: DataTypes.STRING(13),
    unique: true,
    validate: {
      len: [13, 13]
    }
  },
  fecha_nacimiento_esposo: {
    type: DataTypes.DATEONLY,
    validate: {
      isDate: true,
      isBefore: new Date().toISOString()
    }
  },
  fecha_nacimiento_esposa: {
    type: DataTypes.DATEONLY,
    validate: {
      isDate: true,
      isBefore: new Date().toISOString()
    }
  },
  embarazada: DataTypes.BOOLEAN,
  hijos_0_2: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0
    }
  },
  hijos_2_5: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0
    }
  },
  hijos_6_17: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0
    }
  },
  area_siembra_maiz: {
    type: DataTypes.DOUBLE,
    validate: {
      min: 0
    }
  },
  rendimiento_maiz: {
    type: DataTypes.DOUBLE,
    validate: {
      min: 0
    }
  },
  area_siembra_frijol: {
    type: DataTypes.DOUBLE,
    validate: {
      min: 0
    }
  },
  rendimiento_frijol: {
    type: DataTypes.DOUBLE,
    validate: {
      min: 0
    }
  },
  id_comunidad: DataTypes.INTEGER
}, {
  tableName: 'Familias',
  timestamps: false
});

module.exports = Familia;