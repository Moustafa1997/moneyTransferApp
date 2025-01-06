const permission = require('../../app/controllers/admin/permissionManagement');
const {
  updatePermissionValidationSchema
} = require('../../app/middlewares/joiValidation/userValidationSchema');
const { validateDto } = require('../../app/middlewares/joiValidation/validation');
const { verifyAdmin, verifyAdminRole } = require('../../app/services/jwtSign');

module.exports = (app) => {
  app.get('/api/admin/get-permissions', [verifyAdmin, verifyAdminRole], permission.getPermissions);
  app.put(
    '/api/admin/update-permissions',
    [verifyAdmin, verifyAdminRole, validateDto(updatePermissionValidationSchema)],
    permission.updatePermissions
  );
};
