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
    allowNull: true
  },
  id_familia: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // ✅ NUEVO: Fecha de detección explícita
  fecha_deteccion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
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
  // ✅ NUEVO: Fecha de última actualización explícita
  fecha_ultima_actualizacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
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
      // Asegurar que las fechas tengan valores por defecto
      if (!caso.fecha_deteccion) {
        caso.fecha_deteccion = new Date();
      }
      if (!caso.fecha_ultima_actualizacion) {
        caso.fecha_ultima_actualizacion = new Date();
      }
    },
    beforeUpdate: (caso) => {
      // Actualizar automáticamente la fecha de última actualización
      caso.fecha_ultima_actualizacion = new Date();
    }
  }
});

module.exports = CasoCritico;