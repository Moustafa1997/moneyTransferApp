'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class states extends Model {
    static associate(models) {
      this.belongsTo(models.country_codes, {
        foreignKey: 'countryId',
        as: 'country'
      });
    }
  }
  states.init(
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
      countryId: {
        type: DataTypes.BIGINT,
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
      modelName: 'states',
      timestamps: false,
      underscored: true,
      paranoid: true
    }
  );

  return states;
};
