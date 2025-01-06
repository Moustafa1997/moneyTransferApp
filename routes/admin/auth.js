const auth = require('../../app/controllers/admin/auth');
const { validateDto } = require('../../app/middlewares/joiValidation/validation');
const {
  userLoginValidSchema,
  forgotPasswordValidSchema,
  userPasswordResetValidSchema,
  adminSignUpValidSchema
} = require('../../app/middlewares/joiValidation/userValidationSchema');

module.exports = (app) => {
  // Define auth routes API endpoint here
  app.post('/api/admin/register', validateDto(adminSignUpValidSchema), auth.signupUser);

  app.post('/api/admin/login', validateDto(userLoginValidSchema), auth.login);
  app.post(
    '/api/admin/forgot-password-mail',
    validateDto(forgotPasswordValidSchema),
    auth.forgotPassword
  );
  app.post(
    '/api/admin/forgot-password',
    [validateDto(userPasswordResetValidSchema)],
    auth.resetPassword
  );
};
