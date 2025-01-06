const joi = require('joi');

module.exports = {
  fileUploadParamValid: joi.object({
    type: joi
      .string()
      .valid('profile-upload', 'id-document', 'digital-signature', 'uploaded-signature', 'frontend')
      .required()
  }),
  paginationQueryValid: joi.object({
    id: joi.number().optional(),
    size: joi.number().optional(),
    page: joi.number().optional(),
    search: joi.string().optional().allow(''),
    documentNumber: joi.string().optional(),
    status: joi.string().optional().allow('pending', 'completed', 'failed', 'all'),
    order: joi.string().optional().allow('ASC', 'DESC'),
    type: joi.string().optional().allow('sent', 'received')
  }),
  paginationQueryWithStatusValid: joi.object({
    size: joi.number().required(),
    page: joi.number().required(),
    search: joi.string().optional().allow(''),
    status: joi.string().optional().allow('pending', 'completed', 'failed', 'all'),
    order: joi.string().valid('ASC', 'DESC').required()
  }),
  paginationQueryWithStatusInviteValid: joi.object({
    size: joi.number().required(),
    page: joi.number().required(),
    search: joi.string().optional().allow(''),
    status: joi.string().optional().allow('pending', 'accepted', 'rejected'),
    order: joi.string().valid('ASC', 'DESC').required()
  }),
  paginationQueryForTransactionValid: joi.object({
    size: joi.number().required(),
    page: joi.number().required(),
    search: joi.string().optional().allow(''),
    status: joi.string().optional().allow('pending', 'completed', 'failed', 'all'),
    type: joi.string().optional().allow('sent', 'received'),
    order: joi.string().valid('ASC', 'DESC').required()
  }),
  paginationQueryForRechargeValid: joi.object({
    size: joi.number().required(),
    page: joi.number().required(),
    search: joi.string().optional().allow(''),
    status: joi.string().required().allow('completed', 'pending', 'failed', 'all'),
    order: joi.string().valid('ASC', 'DESC').required()
  }),
  sendPhoneOtpValid: joi.object({
    phone: joi.string().required(),
    countryCode: joi.string().required()
  }),
  verifyOtpValid: joi.object({
    otp: joi.string().required(),
    id: joi.number().required()
  }),
  documentTypeValidationSchema: joi.object({
    name: joi.string().min(3).max(255).required(),
    description: joi.string().max(255).optional(),
    document_type: joi.string().optional(),
    required: joi.boolean().optional()
  })
};
