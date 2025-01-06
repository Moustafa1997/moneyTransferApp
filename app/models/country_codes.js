'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class country_codes extends Model {
    static associate() {}
  }
  country_codes.init(
    {
      // primary key
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT, //bigint
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      shortName: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      dialCode: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      currencyName: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      currencyCode: {
        type: DataTypes.STRING(255),
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
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'country_codes',
      timestamps: false,
      underscored: true,
      paranoid: true
    }
  );

  return country_codes;
};
