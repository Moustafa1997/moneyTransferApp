'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class cash_transactions extends Model {
    static associate(models) {
      this.belongsTo(models.clients, { as: 'senderClient', foreignKey: 'senderClientId' });
      this.belongsTo(models.clients, { as: 'receiverAssociate', foreignKey: 'associateId' });
      this.belongsTo(models.agencies, { as: 'receiverAgency', foreignKey: 'agencyId' });
      this.belongsTo(models.clients, { as: 'senderAssociate', foreignKey: 'createdById' });
      this.belongsTo(models.agencies, { as: 'senderAgency', foreignKey: 'createdById' });

      // this.belongsTo(models.clients, { as: 'receiverClient', foreignKey: 'receiverClientId' });
    }
  }
  cash_transactions.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
        allowNull: false
      },
      uniqueCode: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
      },
      // 1 - take cash, 2 - registered client to unregistered client transfer,
      //  3 - unregistered client to unregistered client transfer, 4 - registered client to registered client transfer online by assoiciate or agency
      // 5 - registered client to registered client offline by associate or agency
      // 6 - Recharge client wallet
      type: {
        type: DataTypes.ENUM('1', '2', '3', '4', '5', '6'),
        allowNull: false
      },
      //0 - Failed, 1 - Completed, 2 - Pending
      status: {
        type: DataTypes.ENUM('0', '1', '2'),
        allowNull: false
      },
      sentByRegisteredClient: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      senderClientId: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      // 1 - normal, 2 - associate, 3 - agency
      createdByType: {
        type: DataTypes.ENUM('1', '2', '3'),
        allowNull: true
      },
      createdById: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      unRegisteredSenderClientDetails: {
        type: DataTypes.JSON,
        allowNull: true
      },
      receiverClientIsRegistered: {
        type: DataTypes.BOOLEAN,
        allowNull: true
      },
      unRegisteredClientDetails: {
        type: DataTypes.JSON,
        allowNull: true
      },
      pickupDetails: {
        type: DataTypes.JSON,
        allowNull: true
      },
      agencyId: {
        field: 'agency_id',
        type: DataTypes.BIGINT,
        allowNull: true
      },
      associateId: {
        field: 'associate_id',
        type: DataTypes.BIGINT,
        allowNull: true
      },
      receiverClientId: {
        field: 'receiver_client_id',
        type: DataTypes.BIGINT,
        allowNull: true
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true
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
      modelName: 'cash_transactions',
      timestamps: true,
      underscored: true,
      paranoid: true
    }
  );

  return cash_transactions;
};
