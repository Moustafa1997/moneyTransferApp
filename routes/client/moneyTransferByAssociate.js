const moneyTransferByAssociate = require('../../app/controllers/client/moneyTransferByAssociate');
const { verifyToken } = require('../../app/services/jwtSign');
const { validateDto, validateQuery } = require('../../app/middlewares/joiValidation/validation');
const {
  sendMoneyFromUnregisteredToUnregisteredClientValidSchema,
  sendMoneyFromRegisteredClientToUnregisteredClientValidSchema,
  sendMoneyFromRegisteredClientToRegisteredClientValidSchema,
  sendMoneyFromRegisteredClientToRegisteredClientOfflineValidSchema,
  transactionsForAssociateValidSchema,
  validateCashTransactionValidSchema,
  rechargeClientWalletValidSchema,
  transactionsForClientValidSchema
} = require('../../app/middlewares/joiValidation/walletTransaction');

module.exports = (app) => {
  app.post(
    '/api/client/unregister-to-unregister',
    [verifyToken, validateDto(sendMoneyFromUnregisteredToUnregisteredClientValidSchema)],
    moneyTransferByAssociate.sendMoneyFromUnRegisteredClientToUnregisteredClient
  );

  app.post(
    '/api/client/register-to-unregister',
    [verifyToken, validateDto(sendMoneyFromRegisteredClientToUnregisteredClientValidSchema)],
    moneyTransferByAssociate.sendMoneyFromRegisteredClientToUnregisteredClient
  );

  app.post(
    '/api/client/register-to-register-online',
    [verifyToken, validateDto(sendMoneyFromRegisteredClientToRegisteredClientValidSchema)],
    moneyTransferByAssociate.sendMoneyFromRegisteredClientToRegisteredClientOnline
  );

  app.post(
    '/api/client/register-to-register-offline',
    [verifyToken, validateDto(sendMoneyFromRegisteredClientToRegisteredClientOfflineValidSchema)],
    moneyTransferByAssociate.sendMoneyFromRegisteredClientToRegisteredClientOffline
  );

  app.get(
    '/api/client/transactions',
    [verifyToken, validateQuery(transactionsForAssociateValidSchema)],
    moneyTransferByAssociate.transactionsForAssociate
  );

  app.post(
    '/api/client/validate-cash-transaction',
    [verifyToken, validateDto(validateCashTransactionValidSchema)],
    moneyTransferByAssociate.verifyCashTransaction
  );

  app.post(
    '/api/client/recharge-client-wallet',
    [verifyToken, validateDto(rechargeClientWalletValidSchema)],
    moneyTransferByAssociate.rechargeClientWallet
  );

  app.post(
    '/api/client/transaction',
    [verifyToken, validateDto(transactionsForClientValidSchema)],
    moneyTransferByAssociate.clientTransaction
  );
};
