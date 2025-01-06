'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class role_permission extends Model {
    static associate(models) {
      this.belongsTo(models.roles);
      this.belongsTo(models.permissions);
    }
  }
  role_permission.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: DataTypes.BIGINT
      },
      permissionId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        notEmpty: true
      },
      roleId: {
        allowNull: true,
        type: DataTypes.INTEGER
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
      modelName: 'role_permissions',
      timestamps: true,
      underscored: true,
      paranoid: true
    }
  );

  // Sync model with database
  // role_permission
  //   .sync()
  //   .then(() => {
  //     console.log('Role Permission table created successfully!');
  //   })
  //   .catch((err) => {
  //     console.error('Unable to create table:', err);
  //   });
  return role_permission;
};
