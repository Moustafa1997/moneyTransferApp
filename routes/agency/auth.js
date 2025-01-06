const agencyAuth = require('../../app/controllers/agency/auth');

const { validateDto } = require('../../app/middlewares/joiValidation/validation');
const {
  agencyRegisterValidationSchema
} = require('../../app/middlewares/joiValidation/userValidationSchema');

module.exports = (app) => {
  // Define frontend routes API endpoint here

  app.post(
    '/api/agency/registerUser',
    validateDto(agencyRegisterValidationSchema),
    agencyAuth.registerUser
  );
  app.post('/api/agency/loginUser', agencyAuth.agencyLogin);
  app.get('/api/agency/verify-user-account', agencyAuth.verifyAgency);
  app.post('/api/agency/forgetPassword', agencyAuth.agencyForgotPassword);
  app.post('/api/agency/resetPassword', agencyAuth.agencyResetPassword);
};
