'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class wallets extends Model {
    static associate(models) {
      this.belongsTo(models.clients, { foreignKey: 'clientId' });
      this.belongsTo(models.agencies, { foreignKey: 'agencyId' });
      this.belongsTo(models.admins, { foreignKey: 'roleType' });
    }
  }
  wallets.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
        allowNull: false
      },
      amount: {
        type: DataTypes.DOUBLE,
        allowNull: false
      },
      pendingAmount: {
        field: 'pending_amount',
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0.0 // Default value for pendingAmount
      },
      isActive: {
        field: 'is_active',
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
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
      roleType: {
        field: 'role_type',
        type: DataTypes.ENUM('1', '2'),
        allowNull: true,
        defaultValue: 1 // default value  for   normal  // agency  //  assocaite
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
      modelName: 'wallets',
      timestamps: true,
      underscored: true,
      paranoid: true
    }
  );

  return wallets;
};
