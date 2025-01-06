const walletTransaction = require('../../app/controllers/agency/walletTransaction');
const { validateDto, validateQuery } = require('../../app/middlewares/joiValidation/validation');
const {
  fromBankToWalletValidSchema,
  fromWalletToBankValidSchema,
  rechargeClientWalletValidSchema,
  listRechargeTransactionsValidSchema,
  validateCashTransactionValidSchema
} = require('../../app/middlewares/joiValidation/walletTransaction');

const commonValidSchema = require('../../app/middlewares/joiValidation/commonValidSchema');
const { verifyAgency } = require('../../app/services/jwtSign');

module.exports = (app) => {
  app.post(
    '/api/agency/add-money-from-bank',
    [verifyAgency, validateDto(fromBankToWalletValidSchema)],
    walletTransaction.addToWalletFromBank
  );

  app.post(
    '/api/agency/withdrawal-from-wallet',
    [verifyAgency, validateDto(fromWalletToBankValidSchema)],
    walletTransaction.addToBankFromWallet
  );

  app.get('/api/agency/my-wallet', [verifyAgency], walletTransaction.getMyWalletDetails);

  app.post(
    '/api/agency/recharge-client-wallet',
    [verifyAgency, validateDto(rechargeClientWalletValidSchema)],
    walletTransaction.rechargeClientWallet
  );

  app.get(
    '/api/agency/recharge-transactions-clients',
    [verifyAgency, validateQuery(listRechargeTransactionsValidSchema)],
    walletTransaction.rechargeTransactions
  );

  app.post(
    '/api/agency/validate-cash-transaction',
    [verifyAgency, validateDto(validateCashTransactionValidSchema)],
    walletTransaction.validateCashTransaction
  );
  app.get(
    '/api/agency/all-transactions',
    [verifyAgency, validateQuery(commonValidSchema.paginationQueryValid)],
    walletTransaction.getTransactions
  );
  app.get('/api/agency/transaction/:id', [verifyAgency], walletTransaction.transactionDetailById);
};
