const dashboard = require('../../app/controllers/agency/dashboard');
const { validateDto } = require('../../app/middlewares/joiValidation/validation');
const {
  dashboardValidSchema,
  dashboardChartValidSchema
} = require('../../app/middlewares/joiValidation/walletTransaction');
const { verifyAgency } = require('../../app/services/jwtSign');

module.exports = (app) => {
  app.post(
    '/api/agency/get-dashboard-data',
    [verifyAgency, validateDto(dashboardChartValidSchema)],
    dashboard.getDashboardData
  );
  app.post(
    '/api/agency/get-transactions-for-dashboard',
    [verifyAgency, validateDto(dashboardValidSchema)],
    dashboard.getTransactionsForDashboard
  );
};
