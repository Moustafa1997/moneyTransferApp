'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class cities extends Model {
    static associate(models) {
      this.belongsTo(models.states, {
        foreignKey: 'stateId',
        as: 'state'
      });
    }
  }
  cities.init(
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
      stateId: {
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
      modelName: 'cities',
      timestamps: false,
      underscored: true,
      paranoid: true
    }
  );

  return cities;
};
