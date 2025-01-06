const Controller = require('../app/controllers/common');
const { validateParam, validateDto } = require('../app/middlewares/joiValidation/validation');
const {
  fileUploadParamValid,
  sendPhoneOtpValid,
  verifyOtpValid,
  documentTypeValidationSchema
} = require('../app/middlewares/joiValidation/commonValidSchema');
const imgaeUpload = require('../app/middlewares/uploadFile/fileUpload');
const { verifyTokenWithoutUser } = require('../app/services/jwtSign');

module.exports = (app) => {
  app.post(
    '/api/file-upload/:type',
    [validateParam(fileUploadParamValid), imgaeUpload.upload],
    Controller.fileUploadApi
  );
  app.get('/api/country-code', Controller.getCountryCode);
  app.get('/api/state-by-country/:countryId', Controller.getStates);
  app.get('/api/city-by-state/:stateId', Controller.getCities);
  app.get('/api/search-city-state-country', Controller.searchCityStateCountry);
  app.get('/api/currency-exchange', [verifyTokenWithoutUser], Controller.getCurrencyExchange);
  app.post(
    '/api/send-otp',
    [verifyTokenWithoutUser, validateDto(sendPhoneOtpValid)],
    Controller.sendOtp
  );
  app.post(
    '/api/verify-otp',
    [verifyTokenWithoutUser, validateDto(verifyOtpValid)],
    Controller.verifyOtp
  );
  app.post(
    '/api/create-document-type',
    [verifyTokenWithoutUser, validateDto(documentTypeValidationSchema)],
    Controller.createDocumentType
  );
  app.get('/api/get-all-document-type', [verifyTokenWithoutUser], Controller.getAllDocumentType);
  app.get(
    '/api/view-document-type/:id',
    [verifyTokenWithoutUser],
    Controller.getDetailDocumentType
  );
  app.put(
    '/api/update-document-type',
    [verifyTokenWithoutUser, validateDto(documentTypeValidationSchema)],
    Controller.updateDocumentType
  );
  app.delete('/api/document-type', [verifyTokenWithoutUser], Controller.deleteDocumentType);
};
