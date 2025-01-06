const commissionManagement = require('../../app/controllers/admin/commissionManagement');
const {
  updateDefaultCommisionValidationSchema,
  updateAgencyCommisionValidationSchema,
  changeDefaultCommissionValidationSchema
} = require('../../app/middlewares/joiValidation/commissionManagement');
const { validateDto } = require('../../app/middlewares/joiValidation/validation');
const { verifyAdmin, verifyAdminRole } = require('../../app/services/jwtSign');

module.exports = (app) => {
  app.get(
    '/api/admin/get-default-commissions',
    [verifyAdmin, verifyAdminRole],
    commissionManagement.getDefaultCommissions
  );
  app.put(
    '/api/admin/update-default-commissions',
    [validateDto(updateDefaultCommisionValidationSchema), verifyAdmin, verifyAdminRole],
    commissionManagement.updateDefaultCommissions
  );
  app.get(
    '/api/admin/get-commissions-of-agencies',
    [verifyAdmin, verifyAdminRole],
    commissionManagement.getCommissionsOfAgencies
  );
  app.put(
    '/api/admin/update-agency-commissions',
    [verifyAdmin, verifyAdminRole, validateDto(updateAgencyCommisionValidationSchema)],
    commissionManagement.updateCommissions
  );
  app.put(
    '/api/admin/change-to-default-agency',
    [verifyAdmin, verifyAdminRole, validateDto(changeDefaultCommissionValidationSchema)],
    commissionManagement.changeDefaultCommission
  );
};
