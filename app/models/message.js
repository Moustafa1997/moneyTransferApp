'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      // Message belongs to a chat
      this.belongsTo(models.Chat, {
        foreignKey: 'chat_id',
        as: 'chat',
        onDelete: 'CASCADE'
      });

      // Message belongs to a sender (client)
      this.belongsTo(models.clients, {
        foreignKey: 'sender_id',
        as: 'sender',
        onDelete: 'CASCADE'
      });

      // Message belongs to a receiver (client)
      this.belongsTo(models.clients, {
        foreignKey: 'receiver_id',
        as: 'receiver',
        onDelete: 'CASCADE'
      });
    }
  }

  Message.init(
    {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.BIGINT,
        allowNull: false
      },
      chat_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'Chats',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      sender_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      receiver_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'The content of the message (text, file, or image URL)'
      },
      status: {
        type: DataTypes.ENUM('sent', 'delivered', 'read', 'deleted'),
        defaultValue: 'sent',
        allowNull: false,
        comment: 'The status of the message'
      },
      type: {
        type: DataTypes.ENUM('text', 'image', 'file'),
        defaultValue: 'text',
        allowNull: false,
        comment: 'The type of the message'
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
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Soft delete timestamp for the message'
      }
    },
    {
      sequelize,
      modelName: 'Message',
      timestamps: true,
      tableName: 'messages',
      paranoid: true, // Enables soft delete (deleted_at)
      underscored: true, // Use snake_case column names
      indexes: [
        {
          name: 'message_chat_id_index',
          fields: ['chat_id']
        },
        {
          name: 'message_sender_receiver_index',
          fields: ['sender_id', 'receiver_id']
        },
        {
          name: 'message_status_index',
          fields: ['status']
        }
      ]
    }
  );

  return Message;
};
