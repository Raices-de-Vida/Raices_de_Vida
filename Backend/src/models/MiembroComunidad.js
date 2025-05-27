const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MiembroComunidad = sequelize.define('Miembros_Comunidad', {
  id_miembro: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_comunidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  dpi: {
    type: DataTypes.STRING(13),
    allowNull: false,
    unique: true,
    validate: {
      len: [13, 13]
    }
  },
  telefono: {
    type: DataTypes.STRING(15),
    validate: {
      len: [8, 15]
    }
  },
  rol_comunidad: {
    type: DataTypes.STRING(50),
    defaultValue: 'Miembro'
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  fecha_registro: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Miembros_Comunidad',
  timestamps: false,
  hooks: {
    beforeCreate: (miembro) => {
      if (!miembro.fecha_registro) {
        miembro.fecha_registro = new Date();
      }
    }
  }
});

module.exports = MiembroComunidad;