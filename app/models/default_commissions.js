'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class defaultCommissions extends Model {
    static associate() {}
  }
  defaultCommissions.init(
    {
      // primary key
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('cashDeposit', 'cashWithdrawal'),
        allowNull: false
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
      modelName: 'default_commissions',
      timestamps: false,
      underscored: true,
      paranoid: true
    }
  );

  return defaultCommissions;
};
