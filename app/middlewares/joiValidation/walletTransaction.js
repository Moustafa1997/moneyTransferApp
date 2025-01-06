const joi = require('joi');

exports.fromBankToWalletValidSchema = joi.object({
  amount: joi.number().min(1).precision(2).prefs({ convert: false }).required(),
  note: joi.string().optional()
});

exports.validateAddToWallet = joi.object({
  clientId: joi.number().integer().optional(),
  agencyId: joi.number().integer().optional(),
  description: joi.string().optional(),
  purpose: joi.string().optional(),

  amount: joi.number().integer().required(),
  currency: joi.string().optional().default('usd')
  //status: joi.string().valid('0', '1', '2').required() // 0: Failed, 1: Succeeded, 2: Pending
});

exports.fromWalletToBankValidSchema = joi.object({
  amount: joi.number().min(1).precision(2).prefs({ convert: false }).required(),
  note: joi.string().optional()
});

exports.dashboardValidSchema = joi.object({
  order: joi.string().valid('ASC', 'DESC').required(),
  status: joi.string().valid('pending', 'completed', 'failed').optional(),
  search: joi.number().optional()
});

exports.dashboardChartValidSchema = joi.object({
  chartDuration: joi
    .string()
    .required()
    .regex(/^past-\d+$/)
});

exports.sendMoneyValidSchema = joi.object({
  amount: joi.number().min(1).precision(2).prefs({ convert: false }).required(),
  note: joi.string().optional(),
  receiverId: joi.number().required()
});

exports.cashReceiveFromClient = joi.object({
  amount: joi.number().min(1).precision(2).prefs({ convert: false }).required(),
  cashReceivedFromId: joi.number().required(),
  note: joi.string().optional()
});

exports.cashRequestFromClient = joi.object({
  amount: joi.number().min(1).precision(2).prefs({ convert: false }).required(),
  cashierId: joi.number().required(),
  note: joi.string().optional()
});

exports.approveCashRequest = joi.object({
  cashTransactionId: joi.number().required()
});

exports.sendMoneyToUnregisteredClientValidSchema = joi.object({
  amount: joi.number().min(1).precision(2).prefs({ convert: false }).required(),
  note: joi.string().optional(),
  unRegisteredClientDetails: joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    countryCode: joi.string().required(),
    phone: joi.string().required(),
    gender: joi.string().required().valid('male', 'female', 'other'),
    address: joi.string().required(),
    cityId: joi.number().required(),
    countryId: joi.number().required(),
    stateId: joi.number().required(),
    zipcode: joi.string().required()
  }),
  pickupDetails: joi.object({
    type: joi.string().optional(),
    address: joi.string().required(),
    cityId: joi.number().required(),
    stateId: joi.number().required(),
    countryId: joi.number().required(),
    zipcode: joi.string().required()
  })
});

exports.rechargeClientWalletValidSchema = joi.object({
  amount: joi.number().min(1).precision(2).prefs({ convert: false }).required(),
  note: joi.string().optional(),
  clientId: joi.number().required()
});

exports.listRechargeTransactionsValidSchema = joi.object({
  size: joi.number().required(),
  page: joi.number().required(),
  transactionId: joi.string().optional().allow(''),
  status: joi.string().optional().allow(''),
  // status: joi.string().optional().allow('blocked', 'unblocked', 'all'),
  order: joi.string().valid('ASC', 'DESC').required()
});

exports.validateCashTransactionValidSchema = joi.object({
  id: joi.number().required(),
  uniqueCode: joi.string().required()
});

exports.sendMoneyFromUnregisteredToUnregisteredClientValidSchema = joi.object({
  amount: joi.number().min(1).precision(2).prefs({ convert: false }).required(),
  note: joi.string().optional(),
  receiverDetails: joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    countryCode: joi.string().required(),
    phone: joi.string().required(),
    gender: joi.string().required().valid('male', 'female', 'other'),
    address: joi.string().required(),
    cityId: joi.number().required(),
    countryId: joi.number().required(),
    stateId: joi.number().required(),
    zipcode: joi.string().required(),
    idDocument: joi.string().required(),
    anotherIdDocument: joi.string().optional()
  }),
  senderDetails: joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    countryCode: joi.string().required(),
    phone: joi.string().required(),
    gender: joi.string().required().valid('male', 'female', 'other'),
    address: joi.string().required(),
    cityId: joi.number().required(),
    countryId: joi.number().required(),
    stateId: joi.number().required(),
    zipcode: joi.string().required()
  }),
  pickupDetails: joi.object({
    type: joi.string().optional(),
    address: joi.string().required(),
    cityId: joi.number().required(),
    stateId: joi.number().required(),
    countryId: joi.number().required(),
    zipcode: joi.string().required()
  })
});

exports.sendMoneyFromRegisteredClientToUnregisteredClientValidSchema = joi.object({
  amount: joi.number().min(1).precision(2).prefs({ convert: false }).required(),
  note: joi.string().optional(),
  receiverDetails: joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    countryCode: joi.string().required(),
    phone: joi.string().required(),
    gender: joi.string().required().valid('male', 'female', 'other'),
    address: joi.string().required(),
    cityId: joi.number().required(),
    countryId: joi.number().required(),
    stateId: joi.number().required(),
    zipcode: joi.string().required(),
    idDocument: joi.string().required(),
    anotherIdDocument: joi.string().optional()
  }),
  senderClientId: joi.number().required(),
  pickupDetails: joi.object({
    type: joi.string().optional(),
    address: joi.string().required(),
    cityId: joi.number().required(),
    stateId: joi.number().required(),
    countryId: joi.number().required(),
    zipcode: joi.string().required()
  })
});

exports.sendMoneyFromRegisteredClientToRegisteredClientValidSchema = joi.object({
  amount: joi.number().min(1).precision(2).prefs({ convert: false }).required(),
  note: joi.string().optional(),
  receiverClientId: joi.number().required(),
  senderClientId: joi.number().required()
});

exports.sendMoneyFromRegisteredClientToRegisteredClientOfflineValidSchema = joi.object({
  amount: joi.number().min(1).precision(2).prefs({ convert: false }).required(),
  note: joi.string().optional(),
  receiverClientId: joi.number().required(),
  senderClientId: joi.number().required(),
  pickupDetails: joi
    .object({
      type: joi.string().optional(),
      address: joi.string().required(),
      cityId: joi.number().required(),
      stateId: joi.number().required(),
      countryId: joi.number().required(),
      zipcode: joi.string().required()
    })
    .required()
});

exports.transactionsForAssociateValidSchema = joi.object({
  page: joi.number().required(),
  size: joi.number().required(),
  order: joi.string().valid('ASC', 'DESC').required(),
  search: joi.string().optional().allow(''),
  type: joi.string().required().valid('all', 'sent', 'received', 'recharge'),
  cityId: joi.number().optional(),
  status: joi.string().optional().valid('failed', 'completed', 'pending'),
  date: joi.string().optional()
});

exports.rechargeClientWalletValidSchema = joi.object({
  amount: joi.number().min(1).precision(2).prefs({ convert: false }).required(),
  note: joi.string().optional(),
  clientId: joi.number().required()
});
exports.withdrawValidSchema = joi.object({
  documentTypeId: joi.number().required(),
  documentNumber: joi.string().required(),
  uniqueCode: joi.string().required()
});

exports.transactionsForClientValidSchema = joi.object({
  amount: joi.number().min(1).precision(2).prefs({ convert: false }).required(),
  senderClientId: joi.number().optional(),
  isSenderAgency: joi.number().valid(0, 1).optional(),
  isReceiverAgency: joi.number().valid(0, 1).optional(),
  note: joi.string().optional(),
  receiverClientId: joi.number().optional(),
  receiverDetails: joi.object({
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    email: joi.string().email().required(),
    countryCode: joi.string().required(),
    phone: joi.string().required(),
    gender: joi.string().required().valid('male', 'female', 'other'),
    cityId: joi.number().required(),
    roleId: joi.number().optional(),
    countryId: joi.number().required(),
    stateId: joi.number().required(),
    documentTypeId: joi.number().optional(),
    documentNumber: joi.string().optional()
  }),
  senderDetails: joi.object({
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    email: joi.string().email().required(),
    countryCode: joi.string().required(),
    phone: joi.string().required(),
    gender: joi.string().required().valid('male', 'female', 'other'),
    cityId: joi.number().required(),
    roleId: joi.number().optional(),
    countryId: joi.number().required(),
    stateId: joi.number().required()
  })
});
