'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class roles extends Model {
    static associate(models) {
      this.hasMany(models.clients, { foreignKey: 'roleId' });
      this.hasMany(models.role_permissions, { foreignKey: 'roleId' });
    }
  }
  roles.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: DataTypes.INTEGER
      },
      roleTitle: {
        allowNull: false,
        notEmpty: true,
        type: DataTypes.STRING(100)
      },
      role: {
        allowNull: false,
        notEmpty: true,
        type: DataTypes.STRING(100)
      },
      roleType: {
        // 1= frontend role, 2= backend role
        allowNull: true,
        type: DataTypes.ENUM('1', '2')
      },
      description: {
        allowNull: true,
        type: DataTypes.TEXT
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
      modelName: 'roles',
      timestamps: true,
      underscored: true,
      paranoid: true
    }
  );

  return roles;
};
