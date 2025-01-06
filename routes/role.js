const role = require('../app/controllers/role');
const { verifyTokenWithoutUser } = require('../app/services/jwtSign');

module.exports = (app) => {
  //Define role API endpoint here
  app.get('/api/role/getAllRoles', verifyTokenWithoutUser, role.getAllRoles);
  app.get('/api/role/getAdminRoles', verifyTokenWithoutUser, role.getAdminRoles);
  app.get('/api/role/getClientRoles', verifyTokenWithoutUser, role.getClientRoles);
};
