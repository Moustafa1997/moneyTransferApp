'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create the Messages table
    await queryInterface.createTable('Messages', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      chat_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Chats',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      sender_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      receiver_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'The content of the message (text, file, or image URL)'
      },
      status: {
        type: Sequelize.ENUM('sent', 'delivered', 'read', 'deleted'),
        defaultValue: 'sent',
        allowNull: false,
        comment: 'The status of the message'
      },
      type: {
        type: Sequelize.ENUM('text', 'image', 'file'),
        defaultValue: 'text',
        allowNull: false,
        comment: 'The type of the message'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Soft delete timestamp for the message'
      }
    });

    const existingIndexes = await queryInterface.showIndex('Messages');

    const indexNames = existingIndexes.map((index) => index.name);

    if (!indexNames.includes('message_chat_id_index')) {
      await queryInterface.addIndex('Messages', {
        fields: ['chat_id'],
        name: 'message_chat_id_index'
      });
    }

    if (!indexNames.includes('message_sender_receiver_index')) {
      await queryInterface.addIndex('Messages', {
        fields: ['sender_id', 'receiver_id'],
        name: 'message_sender_receiver_index'
      });
    }

    if (!indexNames.includes('message_status_index')) {
      await queryInterface.addIndex('Messages', {
        fields: ['status'],
        name: 'message_status_index'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex('Messages', 'message_chat_id_index');
    await queryInterface.removeIndex('Messages', 'message_sender_receiver_index');
    await queryInterface.removeIndex('Messages', 'message_status_index');

    // Drop the Messages table
    await queryInterface.dropTable('Messages');
  }
};
