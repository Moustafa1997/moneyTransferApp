const joi = require('joi');

const userLoginValidSchema = joi.object({
  email: joi.string().email().trim(true).required(),
  password: joi.string().min(8).trim(true).required()
});

const userLoginWithTypeValidSchema = joi.object({
  email: joi.string().email().trim(true).required(),
  password: joi.string().min(8).trim(true).required(),
  type: joi.string().valid('normal', 'associate').required()
});

const userPasswordResetValidSchema = joi.object({
  newPassword: joi.string().min(8).trim(true).required(),
  confirmPassword: joi.string().min(8).trim(true).required(),
  token: joi.string().required()
});

const frontendUserPasswordResetValidSchema = joi.object({
  newPassword: joi.string().min(8).trim(true).required(),
  token: joi.string().required()
});

const verifyUserAccountValidSchema = joi.object({
  token: joi.string().required()
});

const forgotPasswordValidSchema = joi.object({
  email: joi.string().email().lowercase().trim(true).optional(),
  phone: joi.number().allow(null).optional()
});

const changeRoleOfClientValidSchema = joi.object({
  roleId: joi.number().required().valid(6, 7),
  reason: joi.string().required()
});

const userAddValidSchema = joi.object({
  first_name: joi.string().min(3).max(25).trim(true).required(),
  last_name: joi.string().min(3).max(25).trim(true),
  role_id: joi.number().required(),
  email: joi.string().email().lowercase().trim(true).required(),
  phone: joi.number().allow(null).optional(),
  password: joi.string().min(8).trim(true).required(),
  gender: joi.string().valid('male', 'female', 'other'),
  birth_date: joi.date().optional(),
  profile_image: joi.string().optional(),
  id_document: joi.string().optional()
});

const addUserValidSchema = joi.object({
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
  roleId: joi.number().required().valid(6, 7),
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
  cashCapacity: joi.number().when('roleId', {
    is: joi.valid(6),
    then: joi.required(),
    otherwise: joi.forbidden()
  }),
  companyName: joi.string().when('roleId', {
    is: joi.valid(6),
    then: joi.required(),
    otherwise: joi.forbidden()
  }),
  yearSince: joi.string().when('roleId', {
    is: joi.valid(6),
    then: joi.required(),
    otherwise: joi.forbidden()
  })
});

const addAdminValidSchema = joi.object({
  email: joi.string().email().lowercase().trim(true).required(),
  firstName: joi.string().min(3).max(25).trim(true).required().messages({
    'string.base': `"First Name" should be a type of 'text'`,
    'string.empty': `"First Name" should have a minimum length of 3`,
    'string.min': `"First Name" should have a minimum length of 3`,
    'string.man': `"First Name" can have a maximum length of 25`,
    'any.required': `"First Name" is a required field`
  }),
  lastName: joi.string().min(3).max(25).trim(true).messages({
    'string.base': `"Last Name" should be a type of 'text'`,
    'string.empty': `"Last Name" should have a minimum length of 3`,
    'string.min': `"Last Name" should have a minimum length of 3`,
    'string.max': `"Last Name" can have a maximum length of 25`
  }),
  countryCode: joi.number().allow(null).optional(),
  phone: joi.number().allow(null).optional(),
  roleId: joi.number().required().valid(1, 2, 3, 4)
});

const updateUserValidSchema = joi.object({
  firstName: joi.string().min(3).max(25).trim(true).optional().messages({
    'string.base': `"First Name" should be a type of 'text'`,
    'string.empty': `"First Name" should have a minimum length of 3`,
    'string.min': `"First Name" should have a minimum length of 3`,
    'string.man': `"First Name" can have a maximum length of 25`
  }),
  lastName: joi.string().min(3).max(25).trim(true).optional().messages({
    'string.base': `"Last Name" should be a type of 'text'`,
    'string.empty': `"Last Name" should have a minimum length of 3`,
    'string.min': `"Last Name" should have a minimum length of 3`,
    'string.max': `"Last Name" can have a maximum length of 25`
  }),
  countryCode: joi.string().allow(null).optional(),
  phone: joi.string().allow(null).optional(),
  roleId: joi.number().optional(),
  address: joi.string().min(2).trim(true),
  stateId: joi.number().optional(),
  cityId: joi.number().optional(),
  countryId: joi.number().optional(),
  zipcode: joi.string().min(2).trim(true),
  gender: joi.string().valid('male', 'female'),
  birthDate: joi.date().optional(),
  isSuspend: joi.string().optional().valid('0', '1'),
  profileImage: joi.string().uri().optional().allow(null),
  idDocument: joi.string().uri().optional().allow(null),
  digitalSignature: joi.string().uri().optional().allow(null),
  uploadedSignature: joi.string().uri().optional().allow(null)
});

const updateAdminValidSchema = joi.object({
  email: joi.string().email().lowercase().trim(true).optional(),
  firstName: joi.string().min(3).max(25).trim(true).optional().messages({
    'string.base': `"First Name" should be a type of 'text'`,
    'string.empty': `"First Name" should have a minimum length of 3`,
    'string.min': `"First Name" should have a minimum length of 3`,
    'string.man': `"First Name" can have a maximum length of 25`
  }),
  lastName: joi.string().min(3).max(25).trim(true).optional().messages({
    'string.base': `"Last Name" should be a type of 'text'`,
    'string.empty': `"Last Name" should have a minimum length of 3`,
    'string.min': `"Last Name" should have a minimum length of 3`,
    'string.max': `"Last Name" can have a maximum length of 25`
  }),
  countryCode: joi.string().allow(null).optional(),
  phone: joi.string().allow(null).optional(),
  roleId: joi.number().optional(),
  isSuspend: joi.string().optional().valid('0', '1')
});

const updateApprovalValidSchema = joi.object({
  email: joi.string().email().lowercase().trim(true).optional(),
  first_name: joi.string().min(3).max(25).trim(true).optional().messages({
    'string.base': `"First Name" should be a type of 'text'`,
    'string.empty': `"First Name" should have a minimum length of 3`,
    'string.min': `"First Name" should have a minimum length of 3`,
    'string.man': `"First Name" can have a maximum length of 25`
  }),
  last_name: joi.string().min(3).max(25).trim(true).optional().messages({
    'string.base': `"Last Name" should be a type of 'text'`,
    'string.empty': `"Last Name" should have a minimum length of 3`,
    'string.min': `"Last Name" should have a minimum length of 3`,
    'string.max': `"Last Name" can have a maximum length of 25`
  }),
  phone: joi.number().allow(null).optional().messages({
    'number.base': `Please provide a number for "phone"`,
    'number.integer': `Please pride an integer for "phone"`
  }),
  role_id: joi.number().optional(),
  is_active: joi.number().min(0).max(1).optional(),
  is_approved: joi.number().min(0).max(2).optional(),
  npi_number: joi.string().allow('').allow(null).min(2).trim(true).optional().messages({
    'string.base': `"npi_number" should be a type of 'string'`,
    'string.min': `"npi_number" should have a minimum length of 2`
  })
});

const updateAdminProfileValidSchema = joi.object({
  firstName: joi.string().min(3).max(25).trim(true),
  lastName: joi.string().min(3).max(25).trim(true),
  phone: joi.string().min(10).allow(null),
  countryCode: joi.number().allow(null).optional()
});

const changePasswordValidSchema = joi.object({
  password: joi.string().min(8).trim(true).required(),
  newPassword: joi.string().min(8).trim(true).required(),
  confirmPassword: joi.string().min(8).trim(true).required()
});

const sendInvitation = joi.object({
  email: joi.string().min(8).trim(true).required(),
  phone: joi.string().min(10).trim(true).required()
});

const changePasswordByAdminValidSchema = joi.object({
  email: joi.string().trim(true).required(),
  newPassword: joi.string().min(8).trim(true).required(),
  confirmPassword: joi.string().min(8).trim(true).required()
});

const deleteUserValidSchema = joi.object({
  id: joi.number().required()
});

const clientRegisterValidationSchema = joi.object({
  firstName: joi.string().alphanum().min(3).max(25).trim(true).required(),
  lastName: joi.string().alphanum().min(3).max(25).trim(true).required(),
  roleId: joi.number().required().valid(6, 7),
  email: joi.string().email().lowercase().trim(true).required(),
  countryCode: joi.string().required(),
  phone: joi.string().required().min(10),
  password: joi.string().min(8).trim(true).required(),
  gender: joi.string().valid('male', 'female').required(),
  birthDate: joi.date().required(),
  country: joi.number().required(),
  profileImage: joi.string().uri().optional(),
  idDocument: joi.string().uri().optional(),
  address: joi.string().required(),
  state: joi.number().required(),
  city: joi.number().required(),
  zipcode: joi.string().required(),
  cashCapacity: joi.number().when('roleId', {
    is: joi.valid(6),
    then: joi.optional(),
    otherwise: joi.forbidden()
  }),
  companyName: joi.string().when('roleId', {
    is: joi.valid(6),
    then: joi.optional(),
    otherwise: joi.forbidden()
  }),
  yearSince: joi.string().when('roleId', {
    is: joi.valid(6),
    then: joi.optional(),
    otherwise: joi.forbidden()
  }),
  // rechargeBudget: joi.number().when('roleId', {
  //   is: joi.valid(5),
  //   then: joi.required(),
  //   otherwise: joi.forbidden()
  // }),
  // cashiers: joi.number().when('roleId', {
  //   is: joi.valid(5),
  //   then: joi.required(),
  //   otherwise: joi.forbidden()
  // }),
  // agencyDetails: joi
  //   .object({
  //     companyName: joi.string().allow(null, ''),
  //     companyAddress: joi.string().allow(null, ''),
  //     companyLogo: joi.string().uri().allow(null, ''),
  //     companyPhone: joi.string().allow(null, ''),
  //     companyEmail: joi.string().email().allow(null, ''),
  //     companyRegistrationDocument: joi.string().uri().allow(null, ''),
  //     representativeFirstName: joi.string().allow(null, ''),
  //     representativeSecondName: joi.string().allow(null, ''),
  //     representativeBirthDate: joi.date().allow(null),
  //     representativePhone: joi.string().allow(null, ''),
  //     representativeEmail: joi.string().email().allow(null, ''),
  //     representativeIdNumber: joi.string().allow(null, ''),
  //     representativeIdDocument: joi.string().uri().allow(null, ''),
  //     representativeProfile: joi.string().uri().allow(null, '')
  //   })
  //   .when('roleId', {
  //     is: joi.valid(5),
  //     then: joi.required(),
  //     otherwise: joi.forbidden()
  //   }),
  referCode: joi.string().optional(),
  digitalSignature: joi.string().uri().optional(),
  uploadedSignature: joi.string().uri().optional(),
  locationLatitude: joi.number().min(-90).max(90).precision(6).optional(),
  locationLongitude: joi.number().min(-180).max(180).precision(6).optional()
});

const agencyRegisterValidationSchema = joi.object({
  name: joi.string().trim(true).required(),
  email: joi.string().email().lowercase().trim(true).required(),
  countryCode: joi.string().required(),
  phone: joi.string().required(),
  password: joi.string().min(8).trim(true).required(),
  country: joi.number().required(),
  address: joi.string().required(),
  state: joi.number().required(),
  city: joi.number().required(),
  zipcode: joi.string().required(),
  cashCapacity: joi.number().required(),
  rechargeBudget: joi.number().required(),
  cashiers: joi.number().required(),
  representativeDetails: joi.object({
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    gender: joi.string().valid('male', 'female').required(),
    birthDate: joi.date().required(),
    phone: joi.string().required(),
    email: joi.string().email().required(),
    idNumber: joi.string().required()
  }),
  profileImage: joi.string().uri().optional(),
  idDocument: joi.string().uri().required(),
  digitalSignature: joi.string().uri().required(),
  uploadedSignature: joi.string().uri().required(),
  locationLatitude: joi.number().min(-90).max(90).precision(6).optional(),
  locationLongitude: joi.number().min(-180).max(180).precision(6).optional(),
  referCode: joi.string().optional()
});

const agencyUpdateValidationSchema = joi.object({
  name: joi.string().trim(true).optional(),
  countryCode: joi.string().optional(),
  phone: joi.string().optional(),
  countryId: joi.number().optional(),
  stateId: joi.number().optional(),
  cityId: joi.number().optional(),
  address: joi.string().optional(),
  city: joi.string().optional(),
  zipcode: joi.string().optional(),
  cashCapacity: joi.number().optional(),
  rechargeBudget: joi.number().optional(),
  cashiers: joi.number().optional(),
  representativeDetails: joi.object({
    firstName: joi.string().optional(),
    lastName: joi.string().optional(),
    gender: joi.string().valid('male', 'female').optional(),
    birthDate: joi.date().optional(),
    phone: joi.string().optional(),
    email: joi.string().email().optional(),
    idNumber: joi.string().optional()
  }),
  profileImage: joi.string().uri().optional(),
  idDocument: joi.string().uri().optional(),
  digitalSignature: joi.string().uri().optional(),
  uploadedSignature: joi.string().uri().optional(),
  locationLatitude: joi.number().min(-90).max(90).precision(6).optional(),
  locationLongitude: joi.number().min(-180).max(180).precision(6).optional()
});

const frontendRegisterUserTokenParamSchema = joi.object({
  token: joi.string().required()
});

// frontend profile validation here

const updateUserProfileValid = joi.object({
  firstName: joi.string().min(3).max(25).trim(true).optional(),
  lastName: joi.string().min(3).max(25).trim(true).optional(),
  countryCode: joi.string().optional(),
  gender: joi.string().valid('male', 'female').optional(),
  birthDate: joi.date().optional(),
  countryId: joi.number().optional(),
  profileImage: joi.string().uri().optional(),
  idDocument: joi.string().uri().optional(),
  address: joi.string().optional(),
  stateId: joi.number().optional(),
  cityId: joi.number().optional(),
  zipcode: joi.string().optional(),
  roleId: joi.number().optional().valid(6, 7),
  phone: joi.number().allow(null).optional(),
  locationLatitude: joi.number().min(-90).max(90).precision(6).optional(),
  locationLongitude: joi.number().min(-180).max(180).precision(6).optional()
});

const updateProfileImageValid = joi.object({
  profileImage: joi.string().uri().required()
});

const adminSignUpValidSchema = joi.object({
  firstName: joi.string().min(3).max(25).trim(true).required(),
  lastName: joi.string().min(3).max(25).trim(true).required(),
  email: joi.string().email().lowercase().trim(true).required(),
  phone: joi.number().allow(null).allow('').optional(),
  password: joi.string().min(8).required(),
  roleId: joi.string().required().valid(1, 2, 3, 4)
});

const updateUserMailValid = joi.object({
  street_address: joi.string().trim(true).allow(null).allow('').optional(),
  state: joi.string().trim(true).allow(null).allow('').optional(),
  city: joi.string().trim(true).allow(null).allow('').optional(),
  zipcode: joi.string().trim(true).allow(null).allow('').optional()
});

const updateUserFeeValid = joi.object({
  user_id: joi.number().required(),
  fee: joi.number().required(),
  download_fee: joi.number().allow(null).required(),
  days_before_call: joi.number().required(),
  refund_policy: joi.string().required()
});

const getFeeParamValid = joi.object({
  user_id: joi.number().required()
});

const attorneyUserValidationSchema = joi.object({
  first_name: joi.string().min(3).max(25).trim(true).required(),
  last_name: joi.string().min(3).max(25).trim(true).required(),
  email: joi.string().email().lowercase().trim(true).required(),
  password: joi.string().min(8).trim(true).required()
});

const attorneyUpdateValidationSchema = joi.object({
  first_name: joi.string().min(3).max(25).trim(true).optional(),
  last_name: joi.string().min(3).max(25).trim(true).optional(),
  email: joi.string().email().lowercase().trim(true).optional()
  // password: joi.string().min(8).trim(true).required()
});

const updatePermissionValidationSchema = joi.object({
  roleId: joi.number().required().valid(1, 2, 3, 4),
  permissionId: joi.number().required(),
  isGiving: joi.boolean().required()
});

const updateAvailabilitySchema = joi.object({
  availabilityArr: joi.array().items(
    joi.object({
      day: joi
        .string()
        .required()
        .valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
      startTime: joi
        .string()
        .required()
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .allow(null),
      endTime: joi
        .string()
        .required()
        .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .allow(null)
    })
  )
});

module.exports = {
  userLoginValidSchema,
  userLoginWithTypeValidSchema,
  userAddValidSchema,
  addUserValidSchema,
  updateUserValidSchema,
  deleteUserValidSchema,
  userPasswordResetValidSchema,
  forgotPasswordValidSchema,
  updateAdminProfileValidSchema,
  changePasswordValidSchema,
  clientRegisterValidationSchema,
  frontendRegisterUserTokenParamSchema,
  frontendUserPasswordResetValidSchema,
  updateUserFeeValid,
  getFeeParamValid,
  updateUserProfileValid,
  attorneyUserValidationSchema,
  attorneyUpdateValidationSchema,
  updateUserMailValid,
  updateApprovalValidSchema,
  adminSignUpValidSchema,
  changePasswordByAdminValidSchema,
  sendInvitation,
  verifyUserAccountValidSchema,
  updatePermissionValidationSchema,
  addAdminValidSchema,
  updateAdminValidSchema,
  agencyRegisterValidationSchema,
  agencyUpdateValidationSchema,
  updateProfileImageValid,
  updateAvailabilitySchema,
  changeRoleOfClientValidSchema
};
