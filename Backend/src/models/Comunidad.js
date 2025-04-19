const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comunidad = sequelize.define('Comunidades', {
  id_comunidad: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_comunidad: {
    type: DataTypes.STRING(255),
    defaultValue: '100'
  },
  codigo_ine: {
    type: DataTypes.STRING(255),
    defaultValue: '10'
  },
  departamento: {
    type: DataTypes.STRING(255),
    defaultValue: '100'
  },
  municipio: {
    type: DataTypes.STRING(255),
    defaultValue: '100'
  },
  numero_familias: DataTypes.INTEGER,
  grupo_etnico: {
    type: DataTypes.STRING(255),
    defaultValue: '50'
  },
  tipo_comunidad: {
    type: DataTypes.STRING(255),
    defaultValue: '50'
  },
  estado: DataTypes.BOOLEAN,
  comentarios: DataTypes.TEXT,
  coordenadas_gps: DataTypes.STRING(255),
  recursos_disponibles: DataTypes.TEXT,
  necesidades_comunidad: DataTypes.TEXT,
  proyectos_en_comunidad: DataTypes.TEXT
}, {
  tableName: 'Comunidades',
  timestamps: false,
  hooks: {
    beforeCreate: (comunidad) => {
      if (!comunidad.fecha_registro) {
        comunidad.fecha_registro = new Date();
      }
    }
  }
});

module.exports = Comunidad;