const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alerta = sequelize.define('Alertas', {
  alerta_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha_alerta: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  tipo_alerta: {
    type: DataTypes.ENUM('Médica', 'Nutricional', 'Psicosocial', 'Urgente'), // Ejemplos
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('Pendiente', 'Atendida', 'Escalada', 'Cerrada'),
    allowNull: false,
    defaultValue: 'Pendiente'
  },
  fecha_respuesta: {
    type: DataTypes.DATE,
    allowNull: true
  },
  respuesta: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prioridad: {
    type: DataTypes.ENUM('Baja', 'Media', 'Alta', 'Crítica'),
    allowNull: false,
    defaultValue: 'Media'
  },
  caso_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Casos_Criticos', // Relación con Casos_Criticos
      key: 'id_caso'
    }
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios', // Relación con Usuarios (quien reporta la alerta)
      key: 'usuario_id'
    }
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'Alertas',
  timestamps: false,
  hooks: {
    beforeUpdate: (alerta) => {
      if (alerta.estado === 'Atendida' && !alerta.fecha_respuesta) {
        alerta.fecha_respuesta = new Date(); // Auto-fecha al atender
      }
    }
  }
});

module.exports = Alerta;