// Backend/src/models/CirugiaPaciente.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CirugiaPaciente = sequelize.define('Cirugias_Paciente', {
  id_cirugia: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_paciente: { type: DataTypes.INTEGER, allowNull: false },
  tipo_cirugia: { type: DataTypes.ENUM('Abdominal', 'Cardíaca', 'Ginecológica', 'Traumatológica', 'Otra') },
  descripcion_cirugia: { type: DataTypes.TEXT, allowNull: false },
  fecha_cirugia: { type: DataTypes.DATEONLY },
  hospital: { type: DataTypes.STRING(255) },
  complicaciones: { type: DataTypes.TEXT },
  fecha_registro: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW }
}, {
  tableName: 'Cirugias_Paciente',
  timestamps: false
});

module.exports = CirugiaPaciente;
