const accountSearch = require('../../app/controllers/agency/accountSearch');
const { verifyAgency } = require('../../app/services/jwtSign');
const agencyAssociateProfile = require('../../app/controllers/client/agencyAssociate');
const { verifyToken } = require('../../app/services/jwtSign');
const { locationPoints } = require('../../app/middlewares/joiValidation/locationUpdate');
const { validateDto } = require('../../app/middlewares/joiValidation/validation');
module.exports = (app) => {
  app.get(
    '/api/agency/get-search-client-accounts',
    [verifyAgency],
    accountSearch.getSearchClientAccounts
  );
  //assoice  agency
  app.post(
    '/api/agency/get-nearby-agency',
    [verifyAgency, validateDto(locationPoints)],
    agencyAssociateProfile.getNearbyAgency
  );
  app.post(
    '/api/agency/get-nearby-associate',
    [verifyAgency, validateDto(locationPoints)],
    agencyAssociateProfile.getNearbyAssociate
  );
};
