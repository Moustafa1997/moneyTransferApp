'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class currencyExchanges extends Model {
    static associate(models) {
      this.belongsTo(models.country_codes, {
        foreignKey: 'countryId',
        targetKey: 'id',
        as: 'countryCurrency'
      });
    }
  }
  currencyExchanges.init(
    {
      // primary key
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
        allowNull: false
      },
      countryId: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      commissionInPercentage: {
        type: DataTypes.DOUBLE,
        allowNull: false
      },
      exchangeRate: {
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
      modelName: 'currency_exchanges',
      timestamps: false,
      underscored: true,
      paranoid: true
    }
  );

  return currencyExchanges;
};
