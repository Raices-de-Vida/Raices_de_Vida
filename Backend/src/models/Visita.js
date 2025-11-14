// Backend/src/models/Visita.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Visita = sequelize.define('Visitas', {
  id_visita: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  
  id_paciente: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    comment: 'FK al paciente al que pertenece esta visita'
  },
  
  fecha_visita: { 
    type: DataTypes.DATE, 
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha y hora de la visita médica'
  },
  
  numero_instancia: { 
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Número de instancia para visitas múltiples el mismo día (1, 2, 3...)'
  },
  
  usuario_registro: { 
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'FK al usuario que registró esta visita'
  },
  
  observaciones: { 
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas generales sobre la visita'
  },
  
  fecha_creacion: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  }
}, {
  tableName: 'Visitas',
  timestamps: false,
  indexes: [
    {
      // Índice para buscar visitas por paciente
      fields: ['id_paciente']
    },
    {
      // Índice compuesto para buscar visitas por paciente y fecha
      fields: ['id_paciente', 'fecha_visita']
    },
    {
      // Constraint único: un paciente no puede tener dos visitas con la misma fecha e instancia
      unique: true,
      fields: ['id_paciente', 'fecha_visita', 'numero_instancia'],
      name: 'unique_patient_visit_instance'
    }
  ]
});

module.exports = Visita;
