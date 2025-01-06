const geoLocationManagement = require('../../app/controllers/admin/geoLocationManagement');
const { updateLocationValidSchema } = require('../../app/middlewares/joiValidation/locationUpdate');
const { validateDto } = require('../../app/middlewares/joiValidation/validation');
const { verifyAdmin, verifyAdminRole } = require('../../app/services/jwtSign');

module.exports = (app) => {
  app.get(
    '/api/admin/get-associate-locations',
    [verifyAdmin, verifyAdminRole],
    geoLocationManagement.getAssociateLocations
  );
  app.get(
    '/api/admin/get-agency-locations',
    [verifyAdmin, verifyAdminRole],
    geoLocationManagement.getAgencyLocations
  );
  app.put(
    '/api/admin/update-associate-location/:id',
    [verifyAdmin, verifyAdminRole, validateDto(updateLocationValidSchema)],
    geoLocationManagement.updateLocationOfAssociate
  );
  app.put(
    '/api/admin/update-agency-location/:id',
    [verifyAdmin, verifyAdminRole, validateDto(updateLocationValidSchema)],
    geoLocationManagement.updateLocationOfAgency
  );
};
