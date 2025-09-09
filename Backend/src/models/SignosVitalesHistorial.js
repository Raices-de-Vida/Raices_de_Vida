// Backend/src/models/SignosVitalesHistorial.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SignosVitalesHistorial = sequelize.define('Signos_Vitales_Historial', {
  id_signos: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_paciente: { type: DataTypes.INTEGER, allowNull: false },
  id_consulta: { type: DataTypes.INTEGER, allowNull: true },
  fecha_toma: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },

  presion_arterial_sistolica: { type: DataTypes.INTEGER },
  presion_arterial_diastolica: { type: DataTypes.INTEGER },
  frecuencia_cardiaca: { type: DataTypes.INTEGER },
  saturacion_oxigeno: { type: DataTypes.DECIMAL(5,2) },
  glucosa: { type: DataTypes.DECIMAL(6,2) },
  peso: { type: DataTypes.DECIMAL(6,2) },
  estatura: { type: DataTypes.DECIMAL(5,2) },
  temperatura: { type: DataTypes.DECIMAL(4,2) },

  usuario_registro: { type: DataTypes.INTEGER },
  observaciones: { type: DataTypes.TEXT }
}, {
  tableName: 'Signos_Vitales_Historial',
  timestamps: false
});

module.exports = SignosVitalesHistorial;
