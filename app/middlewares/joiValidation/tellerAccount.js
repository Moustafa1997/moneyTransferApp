const joi = require('joi');

exports.createTellerAccountValidSchema = joi.object({
  email: joi.string().email().lowercase().trim(true).required(),
  firstName: joi.string().min(3).max(25).trim(true).required().messages({
    'string.base': `"First Name" should be a type of 'text'`,
    'string.empty': `"First Name" should have a minimum length of 3`,
    'string.min': `"First Name" should have a minimum length of 3`,
    'string.man': `"First Name" can have a maximum length of 25`,
    'any.required': `"First Name" is a required field`
  }),
  lastName: joi.string().min(3).max(25).trim(true).required().messages({
    'string.base': `"Last Name" should be a type of 'text'`,
    'string.empty': `"Last Name" should have a minimum length of 3`,
    'string.min': `"Last Name" should have a minimum length of 3`,
    'string.max': `"Last Name" can have a maximum length of 25`
  }),
  countryCode: joi.number().allow(null).required(),
  phone: joi.string().min(10).required(),

  gender: joi.string().valid('male', 'female').required(),
  birthDate: joi.date().required(),
  profileImage: joi.string().uri().required(),
  idDocument: joi.string().uri().required(),
  digitalSignature: joi.string().uri().required(),
  uploadedSignature: joi.string().uri().required(),
  address: joi.string().required(),
  stateId: joi.number().required(),
  cityId: joi.number().required(),
  countryId: joi.number().required(),
  zipcode: joi.string().required(),
  cashCapacity: joi.number().required(),
  companyName: joi.string().required(),
  yearSince: joi.string().required()
});
exports.updateTellerAccountValidSchema = joi.object({
  email: joi.string().email().lowercase().trim(true).optional(),
  firstName: joi.string().min(3).max(25).trim(true).optional().messages({
    'string.base': `"First Name" should be a type of 'text'`,
    'string.empty': `"First Name" should have a minimum length of 3`,
    'string.min': `"First Name" should have a minimum length of 3`,
    'string.man': `"First Name" can have a maximum length of 25`,
    'any.required': `"First Name" is a required field`
  }),
  lastName: joi.string().min(3).max(25).trim(true).optional().messages({
    'string.base': `"Last Name" should be a type of 'text'`,
    'string.empty': `"Last Name" should have a minimum length of 3`,
    'string.min': `"Last Name" should have a minimum length of 3`,
    'string.max': `"Last Name" can have a maximum length of 25`
  }),
  countryCode: joi.number().allow(null).optional(),
  phone: joi.string().min(10).optional(),

  gender: joi.string().valid('male', 'female').optional(),
  isSuspend: joi.string().valid('0', '1').optional(),
  birthDate: joi.date().optional(),
  profileImage: joi.string().uri().optional(),
  idDocument: joi.string().uri().optional(),
  digitalSignature: joi.string().uri().optional(),
  uploadedSignature: joi.string().uri().optional(),
  address: joi.string().optional(),
  stateId: joi.number().optional(),
  cityId: joi.number().optional(),
  countryId: joi.number().optional(),
  zipcode: joi.string().optional(),
  cashCapacity: joi.number().optional(),
  companyName: joi.string().optional(),
  yearSince: joi.string().optional()
});
exports.listTellerAccountValidSchema = joi.object({
  size: joi.number().required(),
  page: joi.number().required(),
  search: joi.string().optional().allow(''),
  status: joi.string().optional().allow('blocked', 'unblocked', 'all'),
  order: joi.string().valid('ASC', 'DESC').required()
});
