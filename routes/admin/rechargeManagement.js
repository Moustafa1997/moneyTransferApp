const rechargeManagement = require('../../app/controllers/admin/rechargeManagement');
const commonValidSchema = require('../../app/middlewares/joiValidation/commonValidSchema');
const { validateQuery } = require('../../app/middlewares/joiValidation/validation');
const { verifyAdmin, verifyAdminRole } = require('../../app/services/jwtSign');

module.exports = (app) => {
  app.get(
    '/api/admin/get-recharges',
    [
      verifyAdmin,
      verifyAdminRole,
      validateQuery(commonValidSchema.paginationQueryForRechargeValid)
    ],
    rechargeManagement.rechargesOfClients
  );
};
