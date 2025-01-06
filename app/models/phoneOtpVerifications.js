'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class phoneOtpVerifications extends Model {
    // static associate(models) {}
  }
  phoneOtpVerifications.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        type: DataTypes.BIGINT
      },
      phone: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      countryCode: {
        type: DataTypes.STRING(10),
        allowNull: false
      },
      otp: {
        type: DataTypes.STRING(6),
        allowNull: false
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      modelName: 'phone_otp_verifications',
      timestamps: true,
      underscored: true,
      paranoid: true
    }
  );

  return phoneOtpVerifications;
};
