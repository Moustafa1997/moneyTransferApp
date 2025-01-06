const dashboard = require('../../app/controllers/admin/dashboard');
const { verifyAdmin, verifyAdminRole } = require('../../app/services/jwtSign');

module.exports = (app) => {
  app.get('/api/admin/dashboard', [verifyAdmin, verifyAdminRole], dashboard.getData);
};
