const userAuth = require('../../app/controllers/client/auth');

const { validateDto } = require('../../app/middlewares/joiValidation/validation');
const {
  forgotPasswordValidSchema,
  frontendUserPasswordResetValidSchema,
  // verifyUserAccountValidSchema,
  clientRegisterValidationSchema,
  userLoginWithTypeValidSchema
} = require('../../app/middlewares/joiValidation/userValidationSchema');

module.exports = (app) => {
  // Define frontend routes API endpoint here

  app.post(
    '/api/client/registerUser',
    validateDto(clientRegisterValidationSchema),
    userAuth.registerUser
  );
  app.post(
    '/api/client/loginUser',
    validateDto(userLoginWithTypeValidSchema),
    userAuth.frontendLogin
  );
  app.post(
    '/api/client/forgetPassword',
    validateDto(forgotPasswordValidSchema),
    userAuth.frontendForgotPassword
  );
  app.post(
    '/api/client/resetPassword',
    validateDto(frontendUserPasswordResetValidSchema),
    userAuth.frontendResetPassword
  );

  app.get('/api/client/verify-user-account', userAuth.verifyFrontendUser);
  app.get('/api/client/logout', userAuth.logout);
};
