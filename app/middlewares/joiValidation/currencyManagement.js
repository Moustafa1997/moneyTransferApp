const Joi = require('joi');

exports.addNewCurrencyExchangeValidationSchema = Joi.object({
  countryId: Joi.number().required(),
  commissionInPercentage: Joi.number().required(),
  exchangeRate: Joi.number().required()
});

exports.updateCurrencyExchangeValidationSchema = Joi.object({
  id: Joi.number().required(),
  commissionInPercentage: Joi.number().required(),
  exchangeRate: Joi.number().required()
});

exports.deleteCurrencyExchangeValidationSchema = Joi.object({
  id: Joi.number().required()
});
