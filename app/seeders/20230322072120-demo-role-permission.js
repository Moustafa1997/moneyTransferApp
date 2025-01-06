'use strict';

module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert('role_permissions', [
      {
        permission_id: 1,
        role_id: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        permission_id: 2,
        role_id: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        permission_id: 3,
        role_id: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        permission_id: 4,
        role_id: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        permission_id: 5,
        role_id: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        permission_id: 6,
        role_id: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        permission_id: 7,
        role_id: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        permission_id: 8,
        role_id: 4,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete('role_permissions', null, {});
  }
};
