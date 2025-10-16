const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ImagenPaciente = sequelize.define('ImagenesPaciente', {
  id_imagen: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  id_paciente: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
      model: 'Pacientes',
      key: 'id_paciente'
    },
    onDelete: 'CASCADE'
  },
  titulo: { 
    type: DataTypes.STRING(100), 
    allowNull: false 
  },
  descripcion: { 
    type: DataTypes.STRING(200), 
    allowNull: true 
  },
  imagen_base64: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  },
  mime_type: { 
    type: DataTypes.STRING(50), 
    allowNull: false,
    defaultValue: 'image/jpeg'
  },
  fecha_subida: { 
    type: DataTypes.DATE, 
    allowNull: false, 
    defaultValue: DataTypes.NOW 
  },
  orden: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  }
}, {
  tableName: 'ImagenesPaciente',
  timestamps: false
});

module.exports = ImagenPaciente;
