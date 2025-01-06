const user = require('../../app/controllers/admin/adminManagement');

const { verifyAdmin, verifyAdminRole } = require('../../app/services/jwtSign');
const { validateDto, validateParam } = require('../../app/middlewares/joiValidation/validation');
const {
  deleteUserValidSchema,
  changePasswordByAdminValidSchema,
  addAdminValidSchema,
  updateAdminValidSchema
} = require('../../app/middlewares/joiValidation/userValidationSchema');

module.exports = (app) => {
  // Define user routes API endpoint here
  app.post(
    '/api/admin/add-admin',
    [validateDto(addAdminValidSchema), verifyAdmin, verifyAdminRole],
    user.addAdmin
  );
  app.get('/api/admin/get-admins/:roleId', [verifyAdmin, verifyAdminRole], user.adminListByRoleId);
  app.get('/api/admin/get-all-admins/', [verifyAdmin, verifyAdminRole], user.allAdminList);
  app.get('/api/admin/get-admin-by-id/:id', [verifyAdmin, verifyAdminRole], user.getAdminById);
  app.put(
    '/api/admin/update-admin/:id',
    [validateDto(updateAdminValidSchema), verifyAdmin, verifyAdminRole],
    user.updateAdmin
  );
  app.put(
    '/api/admin/reset-password-admin',
    [validateDto(changePasswordByAdminValidSchema), verifyAdmin, verifyAdminRole],
    user.updatePassword
  );
  app.delete(
    '/api/admin/delete-admin/:id',
    [validateParam(deleteUserValidSchema), verifyAdmin, verifyAdminRole],
    user.deleteAdmin
  );
};
