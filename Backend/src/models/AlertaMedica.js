// Backend/src/models/AlertaMedica.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AlertaMedica = sequelize.define('Alertas_Medicas', {
  id_alerta_medica: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_paciente: { type: DataTypes.INTEGER, allowNull: false },
  id_alerta: { type: DataTypes.INTEGER, allowNull: true }, // FK opcional a Alertas

  fecha_alerta: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  tipo_alerta_medica: {
    type: DataTypes.ENUM(
      'Signos Vitales Críticos','Glucosa Descontrolada','Hipertensión Severa',
      'Dificultad Respiratoria','Dolor Torácico','Emergencia Obstétrica',
      'Reacción Alérgica','Deshidratación Severa','Otro'
    ),
    allowNull: false
  },
  descripcion_medica: { type: DataTypes.TEXT, allowNull: false },

  presion_sistolica_alerta: { type: DataTypes.INTEGER },
  presion_diastolica_alerta: { type: DataTypes.INTEGER },
  frecuencia_cardiaca_alerta: { type: DataTypes.INTEGER },
  saturacion_oxigeno_alerta: { type: DataTypes.DECIMAL(5,2) },
  glucosa_alerta: { type: DataTypes.DECIMAL(6,2) },
  temperatura_alerta: { type: DataTypes.DECIMAL(4,2) },

  sintomas_reportados: { type: DataTypes.TEXT },
  acciones_inmediatas: { type: DataTypes.TEXT },
  requiere_traslado_urgente: { type: DataTypes.BOOLEAN, defaultValue: false },
  hospital_derivacion: { type: DataTypes.STRING(255) },

  estado_alerta: { type: DataTypes.ENUM('Pendiente','Atendida','Escalada','Cerrada'), defaultValue: 'Pendiente' },
  prioridad_medica: { type: DataTypes.ENUM('Baja','Media','Alta','Crítica'), defaultValue: 'Alta' },

  usuario_genera_alerta: { type: DataTypes.INTEGER },
  usuario_atiende_alerta: { type: DataTypes.INTEGER },
  fecha_atencion: { type: DataTypes.DATE },

  observaciones_medicas: { type: DataTypes.TEXT },
  seguimiento_requerido: { type: DataTypes.TEXT }
}, {
  tableName: 'Alertas_Medicas',
  timestamps: false
});

module.exports = AlertaMedica;
