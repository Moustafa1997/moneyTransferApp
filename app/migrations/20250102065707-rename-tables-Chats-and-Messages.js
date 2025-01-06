'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('Chats', 'chats');

    await queryInterface.renameTable('Messages', 'messages');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('chats', 'Chats');

    await queryInterface.renameTable('messages', 'Messages');
  }
};
