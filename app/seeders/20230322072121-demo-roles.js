'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    return queryInterface.bulkInsert('roles', [
      {
        role_title: 'Admin Staff',
        role: 'admin_staff',
        description: 'This is the Admin Staff',
        created_at: new Date(),
        updated_at: new Date(),
        role_type: 2
      },
      {
        role_title: 'Supervisor',
        role: 'supervisor',
        description: 'These are Supervisor',
        created_at: new Date(),
        updated_at: new Date(),
        role_type: 2
      },
      {
        role_title: 'Operator',
        role: 'operator',
        description: 'These are Operator',
        created_at: new Date(),
        updated_at: new Date(),
        role_type: 2
      },
      {
        role_title: 'Super Administrator',
        role: 'super_administrator',
        description: 'These are Super Administrator',
        created_at: new Date(),
        updated_at: new Date(),
        role_type: 2
      },
      {
        role_title: 'Agency',
        role: 'agency',
        description: 'These are Agency',
        created_at: new Date(),
        updated_at: new Date(),
        role_type: 1
      },
      {
        role_title: 'Associate',
        role: 'associate',
        description: 'These are Associate Users',
        created_at: new Date(),
        updated_at: new Date(),
        role_type: 1
      },
      {
        role_title: 'User',
        role: 'user',
        description: 'These are Users',
        created_at: new Date(),
        updated_at: new Date(),
        role_type: 1
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    return queryInterface.bulkDelete('roles', null, {});
  }
};
