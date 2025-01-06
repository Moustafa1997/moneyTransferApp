const tellerAccount = require('../../app/controllers/agency/tellerAccount');

const { validateDto, validateQuery } = require('../../app/middlewares/joiValidation/validation');
const {
  createTellerAccountValidSchema,
  listTellerAccountValidSchema,
  updateTellerAccountValidSchema
} = require('../../app/middlewares/joiValidation/tellerAccount');
const { verifyAgency } = require('../../app/services/jwtSign');

module.exports = (app) => {
  app.post(
    '/api/agency/create-teller-account',
    [verifyAgency, validateDto(createTellerAccountValidSchema)],
    tellerAccount.createTellerAccount
  );
  app.put(
    '/api/agency/update-teller-accounts/:id',
    [verifyAgency, validateDto(updateTellerAccountValidSchema)],
    tellerAccount.updateTellerProfile
  );
  app.get(
    '/api/agency/list-teller-accounts',
    [verifyAgency, validateQuery(listTellerAccountValidSchema)],
    tellerAccount.listTellerAccount
  );
  app.get('/api/agency/view-teller-account/:id', [verifyAgency], tellerAccount.viewTellerAccount);
};
