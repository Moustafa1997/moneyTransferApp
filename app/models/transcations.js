'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class transactions extends Model {
    static associate(models) {
      this.belongsTo(models.clients, { as: 'currentClient', foreignKey: 'clientId' });
      this.belongsTo(models.agencies, { as: 'currentAgency', foreignKey: 'agencyId' });
      this.belongsTo(models.wallets, { as: 'fromWallet', foreignKey: 'fromWalletId' });
      this.belongsTo(models.wallets, { as: 'toWallet', foreignKey: 'toWalletId' });
      this.belongsTo(models.document_types, { foreignKey: 'documentTypeId', as: 'documentType' });
    }
  }
  transactions.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
        allowNull: false
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
      },
      parentId: {
        field: 'parent_id',
        type: DataTypes.BIGINT,
        allowNull: true, // Nullable to allow standalone transactions
        references: {
          model: 'transactions', // Self-referencing relationship
          key: 'id'
        }
      },
      //0 - bank to wallet, 1- wallet to bank, 2 - sent, 3 - received, 4 - charged, 5 - Cash Deposit, 6 - Cash Withdrawal, 7  - Send to unregistered client
      type: {
        type: DataTypes.ENUM('0', '1', '2', '3', '4', '5', '6', '7'),
        defaultValue: true,
        allowNull: false
      },
      //0 - Failed, 1 - Completed, 2 - Pending
      status: {
        type: DataTypes.ENUM('0', '1', '2'),
        allowNull: false
      },
      isRegisteredClient: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      unregisteredClientDetails: {
        type: DataTypes.JSON,
        allowNull: true
      },
      isDeducted: {
        field: 'is_deducted',
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      isCashTransaction: {
        field: 'is_cash_transaction',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      clientId: {
        field: 'client_id',
        type: DataTypes.BIGINT,
        allowNull: true
      },
      agencyId: {
        field: 'agency_id',
        type: DataTypes.BIGINT,
        allowNull: true
      },
      cashTransactionBy: {
        field: 'cash_transaction_by',
        type: DataTypes.ENUM('agency', 'associateClient'),
        allowNull: true
      },
      cashTransactionByClientId: {
        field: 'cash_transaction_by_client_id',
        type: DataTypes.BIGINT,
        allowNull: true
      },
      fromWalletId: {
        field: 'from_wallet_id',
        type: DataTypes.BIGINT,
        allowNull: true
      },
      toWalletId: {
        field: 'to_wallet_id',
        type: DataTypes.BIGINT,
        allowNull: true
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      documentTypeId: {
        type: DataTypes.BIGINT,
        allowNull: true, // Adjust based on your use case
        references: {
          model: 'document_types',
          key: 'id'
        }
      },
      documentNumber: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'document_number'
      },
      uniqueCode: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'unique_code'
      },
      commissions: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Stores commission details like { fee: <value>, purpose: <value> }'
      },
      createdAt: {
        field: 'created_at',
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
      },
      updatedAt: {
        field: 'updated_at',
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
      },
      deletedAt: {
        field: 'deleted_at',
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'transactions',
      timestamps: true,
      underscored: true,
      paranoid: true
    }
  );

  // Sync model with database
  // transactions
  //   .sync({ alter: true })
  //   .then(() => {
  //     console.log('transcation table created successfully!');
  //   })
  //   .catch((err) => {
  //     console.error('Unable to create table:', err);
  //   });

  return transactions;
};
