const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  class Agency extends Model {
    static associate(models) {
      this.belongsTo(models.roles, { foreignKey: 'roleId' });
      this.belongsTo(models.country_codes, { foreignKey: 'countryId', as: 'country' });
      this.belongsTo(models.states, { foreignKey: 'stateId', as: 'state' });
      this.belongsTo(models.cities, { foreignKey: 'cityId', as: 'city' });
      this.hasOne(models.wallets, {
        foreignKey: 'clientId'
      });
      this.hasMany(models.commissions, {
        foreignKey: 'agencyId'
      });
    }
  }

  Agency.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 7
      },
      countryCode: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      phone: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 0
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      cashCapacity: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      rechargeBudget: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      cashiers: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      stateId: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      cityId: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      zipcode: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      countryId: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      profileImage: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      idDocument: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      digitalSignature: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      uploadedSignature: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      // isActive: {
      //   type: DataTypes.ENUM('0', '1', '2'),
      //   defaultValue: '0',
      //   allowNull: false
      // },
      isApproved: {
        type: DataTypes.ENUM('0', '1', '2'),
        defaultValue: '1',
        allowNull: false
      },
      isSuspend: {
        type: DataTypes.ENUM('0', '1'),
        defaultValue: '0',
        allowNull: false
      },
      isEmailVerified: {
        type: DataTypes.ENUM('0', '1'),
        defaultValue: '0',
        allowNull: false
      },
      isDeleted: {
        type: DataTypes.ENUM('0', '1'),
        defaultValue: '0',
        allowNull: false
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
      },
      emailVerifiedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      rememberToken: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      representativeFirstName: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      representativeLastName: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      representativeGender: {
        type: DataTypes.ENUM('male', 'female'),
        allowNull: true
      },
      representativeBirthDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      representativePhone: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      representativeEmail: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      representativeIdDocument: {
        type: DataTypes.STRING(255),
        allowNull: true
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
      stripeCustomerId: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'agencies',
      timestamps: true,
      underscored: true,
      paranoid: true
    }
  );

  Agency.beforeSave((user) => {
    if (user.changed('password')) {
      user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
    }
  });

  Agency.prototype.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
      if (err) {
        return cb(err);
      }
      cb(null, isMatch);
    });
  };

  return Agency;
};
