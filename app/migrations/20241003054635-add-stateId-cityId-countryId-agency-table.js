'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('agencies', 'country_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'country_codes',
        key: 'id'
      }
    });
    await queryInterface.addColumn('agencies', 'state_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'states',
        key: 'id'
      }
    });
    await queryInterface.addColumn('agencies', 'city_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'cities',
        key: 'id'
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('agencies', 'country_id');
    await queryInterface.removeColumn('agencies', 'state_id');
    await queryInterface.removeColumn('agencies', 'city_id');
  }
};
