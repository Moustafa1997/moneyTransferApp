'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class bankTransactions extends Model {
    static associate(models) {
      this.belongsTo(models.clients, {
        foreignKey: 'clientId',
        targetKey: 'id',
        as: 'client'
      });
      this.belongsTo(models.agencies, {
        foreignKey: 'agencyId',
        targetKey: 'id',
        as: 'agency'
      });
    }
  }

  bankTransactions.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      clientId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: 'clients',
          key: 'id'
        }
      },
      agencyId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        references: {
          model: 'agencies',
          key: 'id'
        }
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      purpose: {
        type: DataTypes.STRING,
        allowNull: true
      },
      amountReceived: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      stripeFee: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      paymentMethodOptions: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Details of the payment method options from Stripe'
      },
      stripePaymentId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Stripe PaymentIntent ID'
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      currency: {
        type: DataTypes.STRING,
        defaultValue: 'usd'
      },
      //0 - Failed, 1 - Completed  , 2 - Pending
      status: {
        type: DataTypes.ENUM('0', '1', '2'),
        allowNull: false
      },
      stripeStatus: {
        type: DataTypes.STRING,
        allowNull: true
      },

      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'bankTransactions',
      timestamps: true,
      underscored: true,
      paranoid: true
    }
  );

  return bankTransactions;
};
