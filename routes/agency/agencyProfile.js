const agencyProfile = require('../../app/controllers/agency/agencyProfile');

const { validateDto } = require('../../app/middlewares/joiValidation/validation');
const {
  agencyUpdateValidationSchema,
  changePasswordValidSchema,
  updateProfileImageValid
} = require('../../app/middlewares/joiValidation/userValidationSchema');
const { verifyAgency } = require('../../app/services/jwtSign');

module.exports = (app) => {
  app.put(
    '/api/agency/update-profile',
    [verifyAgency, validateDto(agencyUpdateValidationSchema)],
    agencyProfile.updateAgencyProfile
  );
  app.get('/api/agency/get-profile', verifyAgency, agencyProfile.getAgencyProfile);
  app.post(
    '/api/agency/change-password',
    [verifyAgency, validateDto(changePasswordValidSchema)],
    agencyProfile.agencyChangePassword
  );
  app.post(
    '/api/agency/update-profile-image',
    [verifyAgency, validateDto(updateProfileImageValid)],
    agencyProfile.updateAgencyProfileImage
  );
};
