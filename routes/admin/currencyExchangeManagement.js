const { verifyAdmin /* verifyAdminRole */ } = require('../../app/services/jwtSign');
const currencyExchangeManagement = require('../../app/controllers/admin/currencyExchangeManagement');
const {
  addNewCurrencyExchangeValidationSchema,
  updateCurrencyExchangeValidationSchema,
  deleteCurrencyExchangeValidationSchema
} = require('../../app/middlewares/joiValidation/currencyManagement');
const { validateDto } = require('../../app/middlewares/joiValidation/validation');

module.exports = (app) => {
  app.get(
    '/api/admin/get-currency-exchange',
    [verifyAdmin /* verifyAdminRole */],
    currencyExchangeManagement.getCurrencyExchange
  );
  app.post(
    '/api/admin/add-new-currency-exchange',
    [verifyAdmin /* verifyAdminRole */, validateDto(addNewCurrencyExchangeValidationSchema)],
    currencyExchangeManagement.addNewCurrencyExchange
  );
  app.put(
    '/api/admin/update-currency-exchange',
    [verifyAdmin /* verifyAdminRole */, validateDto(updateCurrencyExchangeValidationSchema)],
    currencyExchangeManagement.updateCurrencyExchange
  );
  app.delete(
    '/api/admin/delete-currency-exchange',
    [verifyAdmin /* verifyAdminRole */, validateDto(deleteCurrencyExchangeValidationSchema)],
    currencyExchangeManagement.deleteCurrencyExchange
  );
};
