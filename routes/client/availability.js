const availability = require('../../app/controllers/client/availability');
const { verifyToken } = require('../../app/services/jwtSign');
const { validateDto } = require('../../app/middlewares/joiValidation/validation');
const userProfileValid = require('../../app/middlewares/joiValidation/userValidationSchema');

module.exports = (app) => {
  app.put(
    '/api/client/update-availability',
    [verifyToken, validateDto(userProfileValid.updateAvailabilitySchema)],
    availability.changeAvailability
  );
  app.get('/api/client/get-availability', [verifyToken], availability.getAvailability);
};
