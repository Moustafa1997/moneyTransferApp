'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transactions', {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
        allowNull: false
      },
      amount: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      //0 - bank to wallet, 1- wallet to bank, 2 - sent, 3 - received, 4 - charged, 5 - Filled by Cash, 6 - Encashment of wallet balance, 7  - Send to unregistered client
      type: {
        type: Sequelize.ENUM('0', '1', '2', '3', '4', '5', '6', '7', '8'),
        defaultValue: '0',
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('0', '1', '2'),
        allowNull: false
      },
      isCashTransaction: {
        field: 'is_cash_transaction',
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isDeducted: {
        field: 'is_deducted',
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      clientId: {
        field: 'client_id',
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: {
            tableName: 'clients',
            key: 'id'
          }
        }
      },
      agencyId: {
        field: 'agency_id',
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: {
            tableName: 'agencies',
            key: 'id'
          }
        }
      },
      fromWalletId: {
        field: 'from_wallet_id',
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: {
            tableName: 'wallets',
            key: 'id'
          }
        }
      },
      toWalletId: {
        field: 'to_wallet_id',
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: {
            tableName: 'wallets',
            key: 'id'
          }
        }
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        field: 'created_at',
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      updatedAt: {
        field: 'updated_at',
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      deletedAt: {
        field: 'deleted_at',
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('transactions');
  }
};
