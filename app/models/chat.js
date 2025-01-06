'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    static associate(models) {
      // Chat has many messages
      this.hasMany(models.Message, {
        foreignKey: 'chat_id',
        as: 'messages',
        onDelete: 'CASCADE'
      });
    }
  }
  Chat.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
        allowNull: false
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Format: userId1-userId2 (sorted for private chats)'
      },
      searchName: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Format: userId1-userId2 (sorted for private chats) for searching'
      },
      type: {
        type: DataTypes.ENUM('private', 'group'),
        defaultValue: 'private',
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'Chat',
      timestamps: true,
      ableName: 'chats',
      underscored: true,
      indexes: [
        {
          name: 'chat_name_index',
          fields: ['name']
        }
      ]
    }
  );

  return Chat;
};
