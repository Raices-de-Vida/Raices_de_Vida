// Backend/src/models/Paciente.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Paciente = sequelize.define('Pacientes', {
  id_paciente: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

  // General
  fecha_registro: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
  idioma: { type: DataTypes.STRING(100), allowNull: false },
  nombre: { type: DataTypes.STRING(255), allowNull: false },
  apellido: { type: DataTypes.STRING(255) },
  telefono: { type: DataTypes.STRING(20), validate: { len: [8, 20] } },
  comunidad_pueblo: { type: DataTypes.STRING(255) },
  fecha_nacimiento: { type: DataTypes.DATEONLY },
  edad: { type: DataTypes.INTEGER }, // se calcula por trigger en DB
  genero: { type: DataTypes.ENUM('M', 'F'), allowNull: false },

  // Snapshot signos vitales (última toma)
  presion_arterial_sistolica: { type: DataTypes.INTEGER },
  presion_arterial_diastolica: { type: DataTypes.INTEGER },
  frecuencia_cardiaca: { type: DataTypes.INTEGER },
  saturacion_oxigeno: { type: DataTypes.DECIMAL(5,2) },
  glucosa: { type: DataTypes.DECIMAL(6,2) },
  peso: { type: DataTypes.DECIMAL(6,2) },
  estatura: { type: DataTypes.DECIMAL(5,2) },
  temperatura: { type: DataTypes.DECIMAL(4,2) },
  fecha_signos_vitales: { type: DataTypes.DATE },

  // Alergias
  tiene_alergias: { type: DataTypes.BOOLEAN, defaultValue: false },
  alergias: { type: DataTypes.TEXT },

  // Hábitos actuales
  tabaco_actual: { type: DataTypes.BOOLEAN, defaultValue: false },
  tabaco_actual_cantidad: { type: DataTypes.STRING(100) },
  alcohol_actual: { type: DataTypes.BOOLEAN, defaultValue: false },
  alcohol_actual_cantidad: { type: DataTypes.STRING(100) },
  drogas_actual: { type: DataTypes.BOOLEAN, defaultValue: false },
  drogas_actual_cantidad: { type: DataTypes.STRING(100) },

  // Hábitos pasados
  tabaco_pasado: { type: DataTypes.BOOLEAN, defaultValue: false },
  tabaco_pasado_cantidad: { type: DataTypes.STRING(100) },
  alcohol_pasado: { type: DataTypes.BOOLEAN, defaultValue: false },
  alcohol_pasado_cantidad: { type: DataTypes.STRING(100) },
  drogas_pasado: { type: DataTypes.BOOLEAN, defaultValue: false },
  drogas_pasado_cantidad: { type: DataTypes.STRING(100) },

  // Salud reproductiva (aplica a F)
  ultima_menstruacion: { type: DataTypes.DATEONLY },
  menopausia: { type: DataTypes.BOOLEAN, defaultValue: false },
  gestaciones: { type: DataTypes.INTEGER, defaultValue: 0 },
  partos: { type: DataTypes.INTEGER, defaultValue: 0 },
  abortos_espontaneos: { type: DataTypes.INTEGER, defaultValue: 0 },
  abortos_inducidos: { type: DataTypes.INTEGER, defaultValue: 0 },
  usa_anticonceptivos: { type: DataTypes.BOOLEAN, defaultValue: false },
  metodo_anticonceptivo: { 
    type: DataTypes.STRING(50), 
    allowNull: true 
  },

  // Estado y metadatos
  estado_paciente: {
    type: DataTypes.ENUM('Activo', 'Inactivo', 'Derivado', 'Fallecido'),
    defaultValue: 'Activo'
  },
  fecha_ultima_actualizacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  observaciones_generales: { type: DataTypes.TEXT },

  severidad_manual: { 
    type: DataTypes.ENUM('Baja', 'Media', 'Alta', 'Crítica'),
    allowNull: true,
    comment: 'Severidad establecida manualmente por el usuario, anula el cálculo automático'
  },

  // FK (coinciden con tu DB)
  id_comunidad: { type: DataTypes.INTEGER },
  id_familia:   { type: DataTypes.INTEGER },
  usuario_registro: { type: DataTypes.INTEGER }
}, {
  tableName: 'Pacientes',
  timestamps: false
});

module.exports = Paciente;
