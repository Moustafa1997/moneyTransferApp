module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('wallets');

    if (!tableDescription.role_type) {
      await queryInterface.addColumn('wallets', 'role_type', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: 'role_type'
      });

      await queryInterface.sequelize.query(
        `UPDATE wallets SET role_type = 1 WHERE client_id IS NOT NULL OR agency_id IS NOT NULL;`
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('wallets', 'role_type');
  }
};
