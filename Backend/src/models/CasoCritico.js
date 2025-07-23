const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CasoCritico = sequelize.define('Casos_Criticos', {
  id_caso: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_nino: {
    type: DataTypes.INTEGER,
    allowNull: true // CAMBIO: Hacer opcional para evitar constraint errors
  },
  id_familia: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  nivel_urgencia: {
    type: DataTypes.ENUM('Alto', 'Crítico'),
    allowNull: false
  },
  sintomas: DataTypes.TEXT,
  acciones_tomadas: DataTypes.STRING(255),
  estado: {
    type: DataTypes.ENUM('Detectado', 'En Atención', 'Derivado', 'Resuelto', 'Seguimiento'),
    allowNull: false
  },
  id_responsable: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipo_responsable: {
    type: DataTypes.ENUM('Voluntario', 'ONG'),
    allowNull: false
  },
  requiere_traslado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  observaciones: DataTypes.TEXT,
  fecha_resolucion: DataTypes.DATEONLY
}, {
  tableName: 'Casos_Criticos',
  timestamps: false,
  hooks: {
    beforeCreate: (caso) => {
      if (!caso.fecha_deteccion) {
        caso.fecha_deteccion = new Date();
      }
      if (!caso.fecha_ultima_actualizacion) {
        caso.fecha_ultima_actualizacion = new Date();
      }
    }
  }
});

module.exports = CasoCritico;