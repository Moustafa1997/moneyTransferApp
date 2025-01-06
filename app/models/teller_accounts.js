'use strict';

const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class TellerAccounts extends Model {
    static associate(models) {
      this.belongsTo(models.country_codes, {
        foreignKey: 'countryId',
        as: 'country'
      });
      this.belongsTo(models.states, {
        foreignKey: 'stateId',
        as: 'state'
      });
      this.belongsTo(models.cities, {
        foreignKey: 'cityId',
        as: 'city'
      });
      this.belongsTo(models.agencies, {
        foreignKey: 'agencyId',
        as: 'agency'
      });
    }
  }
  TellerAccounts.init(
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
      cashCapacity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'cash_capacity'
      },
      companyName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'company_name'
      },
      yearSince: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'year_since'
      },
      // '0' (not suspend), '1' (suspend)
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
      gender: {
        type: DataTypes.ENUM('male', 'female'),
        allowNull: false,
        field: 'gender'
      },
      birthDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'birth_date'
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'address'
      },
      stateId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'state_id'
      },
      cityId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'city_id'
      },
      zipcode: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'zipcode'
      },
      countryId: {
        type: DataTypes.BIGINT,
        allowNull: true,
        field: 'country_id'
      },
      profileImage: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'profile_image'
      },
      digitalSignature: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      uploadedSignature: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      idDocument: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'id_document'
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
      },
      locationLatitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: true,
        field: 'location_latitude'
      },
      locationLongitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: true,
        field: 'location_longitude'
      }
    },
    {
      sequelize,
      modelName: 'teller_accounts',
      timestamps: true,
      underscored: true,
      paranoid: true
    }
  );

  TellerAccounts.beforeSave((user) => {
    if (user.changed('password')) {
      user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
    }
  });

  TellerAccounts.prototype.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
      if (err) {
        return cb(err);
      }
      cb(null, isMatch);
    });
  };

  return TellerAccounts;
};
