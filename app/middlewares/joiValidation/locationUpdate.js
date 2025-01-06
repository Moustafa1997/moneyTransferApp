const joi = require('joi');

exports.updateLocationValidSchema = joi.object({
  address: joi.string().optional(),
  zipcode: joi.string().optional(),
  city: joi.string().optional(),
  state: joi.string().optional(),
  country: joi.string().optional(),
  locationLatitude: joi.string().optional(),
  locationLongitude: joi.string().optional()
});

exports.locationPoints = joi.object({
  locationLatitude: joi.number().min(-90).max(90).precision(6).optional(),
  locationLongitude: joi.number().min(-180).max(180).precision(6).optional()
});
