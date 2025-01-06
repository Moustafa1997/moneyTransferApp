'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('invitations', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
        allowNull: false
      },
      invited_by: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: {
            tableName: 'clients',
            key: 'id'
          }
        }
      },
      invited_to: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: {
            tableName: 'clients',
            key: 'id'
          }
        }
      },
      code: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('0', '1', '2'), // '0' (rejected), '1' (approved), '2' (pending)
        allowNull: false,
        defaultValue: '2'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('invitations');
  }
};
