const dashboard = require('../../app/controllers/client/dashboard');
const { validateDto } = require('../../app/middlewares/joiValidation/validation');
const {
  dashboardValidSchema,
  dashboardChartValidSchema
} = require('../../app/middlewares/joiValidation/walletTransaction');
const { verifyToken } = require('../../app/services/jwtSign');

module.exports = (app) => {
  app.post(
    '/api/client/get-dashboard-data',
    [verifyToken, validateDto(dashboardChartValidSchema)],
    dashboard.getDashboardData
  );
  app.post(
    '/api/client/get-transactions-for-dashboard',
    [verifyToken, validateDto(dashboardValidSchema)],
    dashboard.getTransactionsForDashboard
  );
};
