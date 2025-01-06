const { verifyToken, verifyAgency } = require('../app/services/jwtSign');
const { validateDto, validateQuery } = require('../app/middlewares/joiValidation/validation');
const { validateAddToWallet } = require('../app/middlewares/joiValidation/walletTransaction');
const bankTransaction = require('../app/controllers/bankTransaction');

module.exports = (app) => {
  app.post(
    '/api/client/recharge-wallet-from-bank',
    [verifyToken, validateDto(validateAddToWallet)],
    bankTransaction.addToWalletFromBank
  );
  app.post(
    '/api/client/confirm-wallet-recharge',
    [verifyToken],
    bankTransaction.verifyAndConfirmWalletRecharge
  );
  app.post(
    '/api/agency/recharge-wallet-from-bank',
    [verifyAgency, validateDto(validateAddToWallet)],
    bankTransaction.addToWalletFromBank
  );
  app.post(
    '/api/agency/confirm-wallet-recharge',
    [verifyAgency],
    bankTransaction.verifyAndConfirmWalletRecharge
  );
};
////
//
