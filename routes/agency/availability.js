const availability = require('../../app/controllers/agency/availability');
const { verifyAgency } = require('../../app/services/jwtSign');
const { validateDto } = require('../../app/middlewares/joiValidation/validation');
const userProfileValid = require('../../app/middlewares/joiValidation/userValidationSchema');

module.exports = (app) => {
  app.put(
    '/api/agency/update-availability',
    [verifyAgency, validateDto(userProfileValid.updateAvailabilitySchema)],
    availability.changeAvailability
  );
  app.get('/api/agency/get-availability', [verifyAgency], availability.getAvailability);
};
