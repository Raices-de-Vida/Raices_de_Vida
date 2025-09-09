// Backend/src/models/HistorialMedico.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistorialMedico = sequelize.define('Historial_Medico', {
  id_historial: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_paciente: { type: DataTypes.INTEGER, allowNull: false },
  historia_enfermedad_actual: { type: DataTypes.TEXT },
  diagnosticos_previos: { type: DataTypes.TEXT },
  medicamentos_actuales: { type: DataTypes.TEXT },
  fecha_registro: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  usuario_registro: { type: DataTypes.INTEGER }
}, {
  tableName: 'Historial_Medico',
  timestamps: false
});

module.exports = HistorialMedico;
