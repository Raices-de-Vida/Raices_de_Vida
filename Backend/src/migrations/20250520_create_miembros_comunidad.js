'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Miembros_Comunidad', {
      id_miembro: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Usuarios',
          key: 'id_usuario'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_comunidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Comunidades',
          key: 'id_comunidad'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      dpi: {
        type: Sequelize.STRING(13),
        allowNull: false,
        unique: true
      },
      telefono: {
        type: Sequelize.STRING(15)
      },
      rol_comunidad: {
        type: Sequelize.STRING(50),
        defaultValue: 'Miembro'
      },
      estado: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      fecha_registro: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Miembros_Comunidad');
  }
};