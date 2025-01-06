const joi = require('joi');

exports.updateDefaultCommisionValidationSchema = joi.object({
  type: joi.number().required().valid('cashDeposit', 'cashWithdrawal'),
  commissionInPercentage: joi.number().required()
});

exports.updateAgencyCommisionValidationSchema = joi.object({
  type: joi.string().required().valid('cashDeposit', 'cashWithdrawal'),
  commissionInPercentage: joi.number().required(),
  agencyId: joi.number().required()
});

exports.changeDefaultCommissionValidationSchema = joi.object({
  type: joi.string().required().valid('cashDeposit', 'cashWithdrawal'),
  agencyId: joi.number().required()
});
