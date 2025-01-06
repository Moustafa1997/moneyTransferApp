'use strict';

const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class Admins extends Model {
    static associate(models) {
      this.belongsTo(models.roles, {
        foreignKey: 'roleId'
      });

      this.hasOne(models.wallets, {
        foreignKey: 'roleType'
      });
    }
  }
  Admins.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        field: 'id'
      },
      email: {
        type: DataTypes.STRING(255),
        validate: { isEmail: true },
        allowNull: false,
        unique: true,
        field: 'email'
      },
      firstName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'first_name'
      },
      lastName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'last_name'
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'role_id'
      },
      countryCode: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'country_code'
      },
      phone: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'phone'
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'password'
      },
      // '0' (false), '1' (true)
      isSuspend: {
        type: DataTypes.ENUM('0', '1'),
        defaultValue: '0',
        allowNull: false,
        field: 'is_suspend'
      },
      isDeleted: {
        type: DataTypes.ENUM('0', '1'),
        defaultValue: '0',
        allowNull: false,
        field: 'is_deleted'
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login'
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
        field: 'created_at'
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
        field: 'updated_at'
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at'
      }
    },
    {
      sequelize,
      modelName: 'admins',
      timestamps: true,
      underscored: true,
      paranoid: true
    }
  );

  Admins.beforeSave((user) => {
    if (user.changed('password')) {
      user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
    }
  });

  Admins.prototype.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
      if (err) {
        return cb(err);
      }
      cb(null, isMatch);
    });
  };

  return Admins;
};
