'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Chats', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Format: userId1-userId2 (sorted for private chats)'
      },
      search_name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Format: userId1-userId2 (sorted for private chats) for searching'
      },
      type: {
        type: Sequelize.ENUM('private', 'group'),
        defaultValue: 'private',
        allowNull: false
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
      }
    });

    // Check if the index exists before adding
    const indexes = await queryInterface.showIndex('Chats');
    if (!indexes.find((index) => index.name === 'chat_name_index')) {
      await queryInterface.addIndex('Chats', {
        fields: ['name'],
        name: 'chat_name_index'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Chats', 'chat_name_index');
    await queryInterface.dropTable('Chats');
  }
};
