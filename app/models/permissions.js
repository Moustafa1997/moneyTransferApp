'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class permissions extends Model {
    static associate(models) {
      this.hasMany(models.role_permissions, { foreignKey: 'permissionId' });
    }
  }
  permissions.init(
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
      permission: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      group: {
        type: DataTypes.STRING(100),
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
      }
    },
    {
      sequelize,
      modelName: 'permissions',
      timestamps: false,
      underscored: true,
      paranoid: true
    }
  );

  return permissions;
};
