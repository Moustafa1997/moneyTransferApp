const userProfile = require('../../app/controllers/client/userProfile');
const { verifyToken, verifyUserAuth } = require('../../app/services/jwtSign');
const { validateDto } = require('../../app/middlewares/joiValidation/validation');
const userProfileValid = require('../../app/middlewares/joiValidation/userValidationSchema');

module.exports = (app) => {
  // Define account setting user profile API here
  app.put(
    '/api/client/changePassword',
    [verifyToken, validateDto(userProfileValid.changePasswordValidSchema)],
    userProfile.userChangePassword
  );
  app.put(
    '/api/client/updateProfile',
    [verifyToken, validateDto(userProfileValid.updateUserProfileValid)],
    userProfile.updateUserProfile
  );
  app.get('/api/client/getUserProfile', [verifyToken], userProfile.getUserProfileById);
  app.get('/api/users/getUserByEmail', [verifyUserAuth], userProfile.getUserByEmail);
  app.put(
    '/api/client/updateProfileImage',
    [verifyToken, validateDto(userProfileValid.updateProfileImageValid)],
    userProfile.updateProfileImage
  );
  app.put(
    '/api/client/changeRole',
    [verifyToken, validateDto(userProfileValid.changeRoleOfClientValidSchema)],
    userProfile.changeRoleOfClient
  );
};
