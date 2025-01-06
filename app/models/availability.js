'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class availabilityTimings extends Model {
    static associate(models) {
      this.belongsTo(models.clients, { foreignKey: 'clientId' });
      this.belongsTo(models.agencies, { foreignKey: 'agencyId' });
    }
  }
  availabilityTimings.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
        allowNull: false
      },
      day: {
        type: DataTypes.ENUM(
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday'
        ),
        allowNull: false
      },
      startTime: {
        type: DataTypes.TIME,
        allowNull: true
      },
      endTime: {
        type: DataTypes.TIME,
        allowNull: true
      },
      clientId: {
        field: 'client_id',
        type: DataTypes.BIGINT,
        allowNull: true
      },
      agencyId: {
        field: 'agency_id',
        type: DataTypes.BIGINT,
        allowNull: true
      },
      rank: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      createdAt: {
        field: 'created_at',
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
      },
      updatedAt: {
        field: 'updated_at',
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
      },
      deletedAt: {
        field: 'deleted_at',
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'availability_timings',
      timestamps: true,
      underscored: true,
      paranoid: true
    }
  );

  return availabilityTimings;
};
