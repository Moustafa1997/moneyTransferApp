const walletTransaction = require('../../app/controllers/client/walletTransactions');
const { verifyToken } = require('../../app/services/jwtSign');
const { validateDto, validateQuery } = require('../../app/middlewares/joiValidation/validation');
const {
  fromBankToWalletValidSchema,
  fromWalletToBankValidSchema,
  sendMoneyValidSchema,
  sendMoneyToUnregisteredClientValidSchema
} = require('../../app/middlewares/joiValidation/walletTransaction');
const commonValidSchema = require('../../app/middlewares/joiValidation/commonValidSchema');

module.exports = (app) => {
  app.post(
    '/api/client/add-money-from-bank',
    [verifyToken, validateDto(fromBankToWalletValidSchema)],
    walletTransaction.addToWalletFromBank
  );

  app.post(
    '/api/client/withdrawal-from-wallet',
    [verifyToken, validateDto(fromWalletToBankValidSchema)],
    walletTransaction.addToBankFromWallet
  );

  app.post(
    '/api/client/send-money',
    [verifyToken, validateDto(sendMoneyValidSchema)],
    walletTransaction.sendMoney
  );

  app.get('/api/client/my-wallet', [verifyToken], walletTransaction.getMyWalletDetails);
  app.get(
    '/api/client/all-transactions',
    [verifyToken, validateQuery(commonValidSchema.paginationQueryValid)],
    walletTransaction.getTransactions
  );
  app.get('/api/client/transaction/:id', [verifyToken], walletTransaction.transactionDetailById);
  app.get(
    '/api/client/recharge-transactions',
    [verifyToken, validateQuery(commonValidSchema.paginationQueryWithStatusValid)],
    walletTransaction.rechargeTransactions
  );
  app.get(
    '/api/client/transfer-transactions',
    [verifyToken, validateQuery(commonValidSchema.paginationQueryForTransactionValid)],
    walletTransaction.transferTransactions
  );

  app.post(
    '/api/client/send-money-to-unregistered-client',
    [verifyToken, validateDto(sendMoneyToUnregisteredClientValidSchema)],
    walletTransaction.sendMoneyToUnregisteredClient
  );
};
