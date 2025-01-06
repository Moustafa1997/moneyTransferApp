'use strict';

module.exports = {
  async up(queryInterface) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    return queryInterface.bulkInsert('permissions', [
      // {
      //   name: 'Get Clients By RoleID',
      //   permission: '/api/admin/get-clients/{roleId}',
      //   group: 'ADMIN',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // },
      // {
      //   name: 'Get All Clients',
      //   permission: '/api/admin/get-all-clients',
      //   group: 'ADMIN',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // },
      // {
      //   name: 'View Client By ID',
      //   permission: '/api/admin/get-client-by-id/{id}',
      //   group: 'ADMIN',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // },
      // {
      //   name: 'Create Client',
      //   permission: '/api/admin/add-client',
      //   group: 'ADMIN',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // },
      // {
      //   name: 'Update Client',
      //   permission: '/api/admin/update-client/{id}',
      //   group: 'ADMIN',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // },
      // {
      //   name: 'Delete Client',
      //   permission: '/api/admin/delete-client/{id}',
      //   group: 'ADMIN',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // },
      // {
      //   name: 'Reset Password Of Client',
      //   permission: '/api/admin/reset-password',
      //   group: 'ADMIN',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // },
      // {
      //   name: 'Update Permissions',
      //   permission: '/api/admin/update-permissions',
      //   group: 'ADMIN',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // },
      // {
      //   name: 'Create Admin',
      //   permission: '/api/admin/add-admin',
      //   group: 'ADMIN',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // },
      // {
      //   name: 'Update Admin',
      //   permission: '/api/admin/update-admin/{id}',
      //   group: 'ADMIN',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // },
      // {
      //   name: 'Delete Admin',
      //   permission: '/api/admin/delete-admin/{id}',
      //   group: 'ADMIN',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // },
      // {
      //   name: 'Get All Admins',
      //   permission: '/api/admin/get-all-admins',
      //   group: 'ADMIN',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // },
      // {
      //   name: 'Get Admin By ID',
      //   permission: '/api/admin/get-admin-by-id/{id}',
      //   group: 'ADMIN',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // },
      // {
      //   name: 'Get Admins By Role',
      //   permission: '/api/admin/get-admins/{roleId}',
      //   group: 'ADMIN',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // },
      // {
      //   name: 'Get Default Commissions',
      //   permission: '/api/admin/get-default-commissions',
      //   group: 'ADMIN',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // },
      // {
      //   name: 'Update Default Commissions',
      //   permission: '/api/admin/update-default-commissions',
      //   group: 'ADMIN',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // },
      // {
      //   name: 'Get Commissions Of Agencies',
      //   permission: '/api/admin/get-commissions-of-agencies',
      //   group: 'ADMIN',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // },
      // {
      //   name: 'Update Commissions Of Agencies',
      //   permission: '/api/admin/update-agency-commissions',
      //   group: 'ADMIN',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // },
      // {
      //   name: 'Update to Default Commissions for Agencies',
      //   permission: '/api/admin/change-to-default-agency',
      //   group: 'ADMIN',
      //   created_at: new Date(),
      //   updated_at: new Date()
      // }

      {
        name: 'Get Dashboard Data',
        permission: '/api/admin/dashboard',
        group: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Get Associate Locations',
        permission: '/api/admin/get-associate-locations',
        group: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Get Agency Locations',
        permission: '/api/admin/get-agency-locations',
        group: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Update Associate Locations',
        permission: '/api/admin/update-associate-location/{params}',
        group: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Update Agency Locations',
        permission: '/api/admin/update-agency-location/{params}',
        group: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Get Permissions',
        permission: '/api/admin/get-permissions',
        group: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Get Recharges',
        permission: '/api/admin/get-recharges',
        group: 'ADMIN',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('permissions', null, {});
  }
};
