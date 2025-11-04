// Backend/src/models/Consulta.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Consulta = sequelize.define('Consultas', {
  id_consulta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_paciente: { type: DataTypes.INTEGER, allowNull: false },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  idioma: { type: DataTypes.STRING(100) },
  tipo_consulta: { type: DataTypes.ENUM('Diabetes', 'HTN', 'Respiratory', 'Other', 'Hipertension'), allowNull: false },
  chief_complaint: { type: DataTypes.TEXT, allowNull: false },

  // Historia clínica
  historia_enfermedad_actual: { type: DataTypes.TEXT },
  diagnosticos_previos: { type: DataTypes.TEXT },
  medicamentos_actuales: { type: DataTypes.TEXT },

  // Examen físico
  examen_corazon: { type: DataTypes.TEXT },
  examen_pulmones: { type: DataTypes.TEXT },
  examen_abdomen: { type: DataTypes.TEXT },
  examen_ginecologico: { type: DataTypes.TEXT },
  otros_examenes: { type: DataTypes.TEXT },

  // Evaluación y plan
  impresion: { type: DataTypes.TEXT },
  plan: { type: DataTypes.TEXT },
  rx_notes: { type: DataTypes.TEXT },
  further_consult: { type: DataTypes.STRING(100) },
  provider: { type: DataTypes.STRING(255) },
  interprete: { type: DataTypes.STRING(255) },

  // Notas quirúrgicas (flags)
  paciente_en_ayuno: { type: DataTypes.BOOLEAN },
  medicamentos_tomados: { type: DataTypes.BOOLEAN }
}, {
  tableName: 'Consultas',
  timestamps: false
});

module.exports = Consulta;
