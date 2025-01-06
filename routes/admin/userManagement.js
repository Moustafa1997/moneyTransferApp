const user = require('../../app/controllers/admin/userManagement');
const { verifyToken } = require('../../app/services/jwtSign');
const { verifyAdmin, verifyAdminRole } = require('../../app/services/jwtSign');
const {
  validateDto,
  validateParam,
  validateQuery
} = require('../../app/middlewares/joiValidation/validation');
const {
  addUserValidSchema,
  updateUserValidSchema,
  deleteUserValidSchema,
  changePasswordByAdminValidSchema
} = require('../../app/middlewares/joiValidation/userValidationSchema');
const commonValidSchema = require('../../app/middlewares/joiValidation/commonValidSchema');

module.exports = (app) => {
  // Define user routes API endpoint here
  app.post(
    '/api/admin/add-client',
    [verifyAdmin, verifyAdminRole, validateDto(addUserValidSchema)],
    user.addUser
  );
  //common
  app.get('/api/get-all-clients', [verifyToken], user.allUserList);
  app.get('/api/admin/get-clients/:roleId', [verifyAdmin, verifyAdminRole], user.userList);
  app.get('/api/admin/get-all-clients/', [verifyAdmin, verifyAdminRole], user.allUserList);
  app.get('/api/admin/get-client-by-id/:id', [verifyAdmin, verifyAdminRole], user.getUserById);
  app.put(
    '/api/admin/update-client/:id',
    [verifyAdmin, verifyAdminRole, validateDto(updateUserValidSchema)],
    user.updateUser
  );
  app.put(
    '/api/admin/reset-password-client',
    [verifyAdmin, verifyAdminRole, validateDto(changePasswordByAdminValidSchema)],
    user.updatePassword
  );
  app.delete(
    '/api/admin/delete-client/:id',
    [verifyAdmin, verifyAdminRole, validateParam(deleteUserValidSchema)],
    user.deleteUser
  );
  app.get(
    '/api/admin/get-transactions-by-user-id/:userId',
    [verifyAdmin, verifyAdminRole, validateQuery(commonValidSchema.paginationQueryWithStatusValid)],
    user.getTransactionByUserId
  );
};
