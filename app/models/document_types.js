'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class documentTypes extends Model {
    static associate(models) {}
  }
  documentTypes.init(
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
      description: {
        type: DataTypes.STRING(255),
        allowNull: true // Optional description
      },
      document_type: {
        type: DataTypes.STRING(100),
        allowNull: false // For example, 'ID Proof', 'Address Proof'
      },
      required: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // If the document is required for upload, default is true
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
      modelName: 'document_types',
      timestamps: false,
      underscored: true,
      paranoid: true
    }
  );

  return documentTypes;
};
