const admin = require('../../app/controllers/admin/adminProfile');
const { verifyAdmin } = require('../../app/services/jwtSign');
const { validateDto } = require('../../app/middlewares/joiValidation/validation');
const {
  updateAdminProfileValidSchema,
  changePasswordValidSchema
} = require('../../app/middlewares/joiValidation/userValidationSchema');

module.exports = (app) => {
  // Define Admin API endpoint here
  app.get('/api/admin/profile', [verifyAdmin], admin.getAdminProfile);
  app.put(
    '/api/admin/update-profile',
    [validateDto(updateAdminProfileValidSchema), verifyAdmin],
    admin.updateAdminProfile
  );
  app.put(
    '/api/admin/update-password',
    [validateDto(changePasswordValidSchema), verifyAdmin],
    admin.updateAdminPassword
  );
};
