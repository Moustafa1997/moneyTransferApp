'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class commissions extends Model {
    static associate(models) {
      this.belongsTo(models.agencies, {
        foreignKey: 'agencyId'
      });
      this.belongsTo(models.clients, {
        foreignKey: 'associateId'
      });
    }
  }
  commissions.init(
    {
      // primary key
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
        allowNull: false
      },
      //   0  - cash deposit, 1 - cash withdrawal
      type: {
        type: DataTypes.ENUM('cashDeposit', 'cashWithdrawal'),
        allowNull: false
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      agencyId: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      associateId: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      commissionInPercentage: {
        type: DataTypes.DOUBLE,
        allowNull: false
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
        type: DataTypes.DATE
      }
    },
    {
      sequelize,
      modelName: 'commissions',
      timestamps: false,
      underscored: true,
      paranoid: true
    }
  );

  return commissions;
};
