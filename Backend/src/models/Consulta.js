// Backend/src/models/Consulta.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Consulta = sequelize.define('Consultas', {
  id_consulta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_paciente: { type: DataTypes.INTEGER, allowNull: false },
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  idioma: { type: DataTypes.STRING(100) },
  tipo_consulta: { type: DataTypes.ENUM('Diabetes', 'HTN', 'Respiratory', 'Other'), allowNull: false },
  consult_other_text: { type: DataTypes.STRING(25) }, // Especificar si tipo_consulta = Other
  chief_complaint: { type: DataTypes.TEXT, allowNull: false }, // Motivo consulta (250 chars)

  // Medicamentos preventivos
  vitamins: { type: DataTypes.INTEGER }, // Dosis vitaminas
  albendazole: { type: DataTypes.INTEGER }, // Dosis albendazol

  // Historia clínica
  historia_enfermedad_actual: { type: DataTypes.TEXT }, // history en PDF
  diagnosticos_previos: { type: DataTypes.TEXT }, // medical_dx en PDF
  cirugias_previas: { type: DataTypes.TEXT }, // surgeries en PDF
  medicamentos_actuales: { type: DataTypes.TEXT }, // meds en PDF

  // Examen físico (physical_exam.*)
  examen_corazon: { type: DataTypes.STRING(40) }, // heart (40 chars max)
  examen_pulmones: { type: DataTypes.STRING(40) }, // lungs (40 chars max)
  examen_abdomen: { type: DataTypes.STRING(40) }, // abdomen (40 chars max)
  examen_ginecologico: { type: DataTypes.STRING(40) }, // gyn (40 chars max)
  otros_examenes: { type: DataTypes.TEXT },

  // Evaluación y plan
  impresion: { type: DataTypes.TEXT }, // impression (400 chars, 2 líneas)
  plan: { type: DataTypes.TEXT }, // plan (400 chars, 2 líneas)
  rx_notes: { type: DataTypes.TEXT }, // Notas prescripción (200 chars)
  further_consult: { type: DataTypes.STRING(100) }, // Gen Surg, GYN, Other
  further_consult_other_text: { type: DataTypes.STRING(35) }, // Especificar si further_consult = Other
  provider: { type: DataTypes.STRING(35) }, // Proveedor de salud
  interprete: { type: DataTypes.STRING(35) }, // Intérprete

  // Flags médicos
  paciente_en_ayuno: { type: DataTypes.BOOLEAN }, // fasting (Y/N)
  medicamento_bp_tomado: { type: DataTypes.BOOLEAN }, // taken_med_bp (Y/N)
  medicamento_bs_tomado: { type: DataTypes.BOOLEAN }, // taken_med_bs (Y/N)

  // Consulta quirúrgica (página 2, opcional)
  surgical_date: { type: DataTypes.DATE },
  surgical_history: { type: DataTypes.TEXT }, // Historia quirúrgica (200 chars, 3 líneas)
  surgical_exam: { type: DataTypes.TEXT }, // Examen quirúrgico (200 chars, 2 líneas)
  surgical_impression: { type: DataTypes.TEXT }, // Impresión quirúrgica (180 chars, 2 líneas)
  surgical_plan: { type: DataTypes.TEXT }, // Plan quirúrgico (200 chars, 2 líneas)
  surgical_meds: { type: DataTypes.TEXT }, // Medicamentos quirúrgicos (300 chars, 4 líneas)
  surgical_consult: { type: DataTypes.STRING(100) }, // Gen Surg, GYN, Other
  surgical_consult_other_text: { type: DataTypes.STRING(30) }, // Especificar si surgical_consult = Other
  surgical_surgeon: { type: DataTypes.STRING(35) }, // Cirujano
  surgical_interpreter: { type: DataTypes.STRING(35) }, // Intérprete quirúrgico
  surgical_notes: { type: DataTypes.TEXT }, // Notas quirúrgicas adicionales (500 chars)
  rx_slips_attached: { type: DataTypes.BOOLEAN } // Recetas adjuntas (Y/N)
}, {
  tableName: 'Consultas',
  timestamps: false
});

module.exports = Consulta;
