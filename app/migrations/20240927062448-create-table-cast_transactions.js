'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cash_transactions', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      unique_code: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      amount: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      // 1 - take cash, 2 - give cash
      type: {
        type: Sequelize.ENUM('1', '2'),
        defaultValue: '1',
        allowNull: false
      },
      // 0 - Failed, 1 - Completed, 2 - Pending
      status: {
        type: Sequelize.ENUM('0', '1', '2'),
        allowNull: false
      },
      sent_by_registered_client: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      sender_client_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'clients',
          key: 'id'
        }
      },
      un_registered_client_details: {
        type: Sequelize.JSON,
        allowNull: true
      },
      pickup_details: {
        type: Sequelize.JSON,
        allowNull: true
      },
      agency_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'agencies',
          key: 'id'
        }
      },
      associate_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'clients',
          key: 'id'
        }
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('cash_transactions');
  }
};
