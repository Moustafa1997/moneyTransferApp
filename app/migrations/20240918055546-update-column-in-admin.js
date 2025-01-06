module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('admins', 'is_active', 'is_suspend');
    await queryInterface.changeColumn('admins', 'is_suspend', {
      type: Sequelize.ENUM('0', '1'),
      defaultValue: '0',
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('admins', 'is_suspend', {
      type: Sequelize.ENUM('0', '1', '2'),
      defaultValue: '0',
      allowNull: false
    });
    await queryInterface.renameColumn('admins', 'is_suspend', 'is_active');
  }
};
