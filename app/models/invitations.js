'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class invitations extends Model {
    static associate(models) {
      this.belongsTo(models.clients, {
        foreignKey: 'invitedBy'
      });
      this.belongsTo(models.clients, {
        foreignKey: 'invitedTo',
        as: 'invitedClient'
      });
      this.belongsTo(models.agencies, {
        foreignKey: 'invitedToAgency',
        as: 'invitedAgency'
      });
    }
  }
  invitations.init(
    {
      // primary key
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
        allowNull: false
      },
      invitedBy: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      invitedTo: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      invitedToAgency: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      code: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      // '0'(rejected),'1'(accepted),'2'(pending)
      status: {
        type: DataTypes.ENUM('0', '1', '2'),
        allowNull: false,
        defaultValue: '2'
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
        type: DataTypes.DATE
      }
    },
    {
      sequelize,
      modelName: 'invitations',
      timestamps: false,
      underscored: true,
      paranoid: true
    }
  );

  // Sync model with database
  // invitations
  //   .sync({ alter: true })
  //   .then(() => {
  //     console.log('Invitation table created successfully!');
  //   })
  //   .catch((err) => {
  //     console.error('Unable to create table:', err);
  //   });
  return invitations;
};
