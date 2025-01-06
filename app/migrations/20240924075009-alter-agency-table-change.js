'use strict';

module.exports = {
  up: async (queryInterface) => {
    const tableDesc = await queryInterface.describeTable('agencies');

    if (tableDesc.representative_second_name) {
      await queryInterface.removeColumn('agencies', 'representative_second_name');
    }
    if (tableDesc.representative_id_number) {
      await queryInterface.removeColumn('agencies', 'representative_id_number');
    }
    if (tableDesc.birth_date) {
      await queryInterface.removeColumn('agencies', 'birth_date');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('agencies');

    if (!tableDesc.representative_second_name) {
      await queryInterface.addColumn('agencies', 'representative_second_name', {
        type: Sequelize.STRING(255),
        allowNull: true
      });
    }

    if (!tableDesc.representative_id_number) {
      await queryInterface.addColumn('agencies', 'representative_id_number', {
        type: Sequelize.STRING(255),
        allowNull: true
      });
    }

    if (!tableDesc.birth_date) {
      await queryInterface.addColumn('agencies', 'birth_date', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }
  }
};
