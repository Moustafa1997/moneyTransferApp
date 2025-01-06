const moneyTransferByAgency = require('../../app/controllers/agency/agencyMoneyTransfer');
const { verifyAgency } = require('../../app/services/jwtSign');
const { validateDto } = require('../../app/middlewares/joiValidation/validation');
const {
  sendMoneyFromUnregisteredToUnregisteredClientValidSchema,
  sendMoneyFromRegisteredClientToUnregisteredClientValidSchema,
  sendMoneyFromRegisteredClientToRegisteredClientValidSchema,
  sendMoneyFromRegisteredClientToRegisteredClientOfflineValidSchema,
  transactionsForClientValidSchema,
  withdrawValidSchema
} = require('../../app/middlewares/joiValidation/walletTransaction');

module.exports = (app) => {
  app.post(
    '/api/agency/moneyTransfer/unregister-to-unregister',
    [verifyAgency, validateDto(sendMoneyFromUnregisteredToUnregisteredClientValidSchema)],
    moneyTransferByAgency.sendMoneyFromUnRegisteredClientToUnregisteredClient
  );

  app.post(
    '/api/agency/moneyTransfer/register-to-unregister',
    [verifyAgency, validateDto(sendMoneyFromRegisteredClientToUnregisteredClientValidSchema)],
    moneyTransferByAgency.sendMoneyFromRegisteredClientToUnregisteredClient
  );

  app.post(
    '/api/agency/moneyTransfer/register-to-register-online',
    [verifyAgency, validateDto(sendMoneyFromRegisteredClientToRegisteredClientValidSchema)],
    moneyTransferByAgency.sendMoneyFromRegisteredClientToRegisteredClientOnline
  );

  app.post(
    '/api/agency/moneyTransfer/register-to-register-offline',
    [verifyAgency, validateDto(sendMoneyFromRegisteredClientToRegisteredClientOfflineValidSchema)],
    moneyTransferByAgency.sendMoneyFromRegisteredClientToRegisteredClientOffline
  );
  app.post(
    '/api/agency/transaction',
    [verifyAgency, validateDto(transactionsForClientValidSchema)],
    moneyTransferByAgency.agencyTransaction
  );
  app.post(
    '/api/agency/withdraw',
    [verifyAgency, validateDto(withdrawValidSchema)],
    moneyTransferByAgency.withdraw
  );
};
