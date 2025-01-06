'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // await queryInterface.removeColumn('clients', 'country');
    // await queryInterface.removeColumn('clients', 'state');
    // await queryInterface.removeColumn('clients', 'city');
    await queryInterface.addColumn('clients', 'country_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'country_codes',
        key: 'id'
      }
    });
    await queryInterface.addColumn('clients', 'state_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'states',
        key: 'id'
      }
    });
    await queryInterface.addColumn('clients', 'city_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'cities',
        key: 'id'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('clients', 'country', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    await queryInterface.addColumn('clients', 'state', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    await queryInterface.addColumn('clients', 'city', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    await queryInterface.removeColumn('clients', 'country_id');
    await queryInterface.removeColumn('clients', 'state_id');
    await queryInterface.removeColumn('clients', 'city_id');
  }
};
