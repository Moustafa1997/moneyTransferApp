const invitation = require('../../app/controllers/client/invitation');
const { verifyToken } = require('../../app/services/jwtSign');
const { validateDto, validateQuery } = require('../../app/middlewares/joiValidation/validation');
const userProfileValid = require('../../app/middlewares/joiValidation/userValidationSchema');
const commonValidSchema = require('../../app/middlewares/joiValidation/commonValidSchema');

module.exports = (app) => {
  // Define account setting user profile API here
  app.post(
    '/api/client/send-invitation',
    [verifyToken, validateDto(userProfileValid.sendInvitation)],
    invitation.sendInvitation
  );
  app.get(
    '/api/client/invitations',
    [verifyToken, validateQuery(commonValidSchema.paginationQueryWithStatusInviteValid)],
    invitation.getInvitedUsers
  );
};
