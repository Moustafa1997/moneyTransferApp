const agencyAssociateProfile = require('../../app/controllers/client/agencyAssociate');
const { verifyToken } = require('../../app/services/jwtSign');
const { locationPoints } = require('../../app/middlewares/joiValidation/locationUpdate');
const { validateDto } = require('../../app/middlewares/joiValidation/validation');

module.exports = (app) => {
  app.post(
    '/api/client/get-nearby-associate',
    [verifyToken, validateDto(locationPoints)],
    agencyAssociateProfile.getNearbyAssociate
  );

  app.post(
    '/api/client/get-nearby-agency',
    [verifyToken, validateDto(locationPoints)],
    agencyAssociateProfile.getNearbyAgency
  );

  app.get(
    '/api/client/get-search-client-accounts',
    [verifyToken],
    agencyAssociateProfile.getSearchClientAccounts
  );
};
