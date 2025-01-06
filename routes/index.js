'use strict';
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('../swagger.json');

module.exports = (app) => {
  let options = {
    customCss: '.swagger-ui .topbar { display: block }'
  };

  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile, options));

  require('./admin/auth')(app);
  require('./admin/adminProfile')(app);
  require('./admin/userManagement')(app);
  require('./admin/adminManagement')(app);
  require('./admin/permissionManagement')(app);
  require('./admin/commissionManagement')(app);
  require('./admin/dashboard')(app);
  require('./admin/rechargeManagement')(app);
  require('./admin/geoLocationManagement')(app);
  require('./admin/currencyExchangeManagement')(app);

  require('./common')(app);
  require('./role')(app);
  require('./bankTransaction')(app);

  require('./client/walletTransactions')(app);
  require('./client/agencyAssociate')(app);
  require('./client/auth')(app);
  require('./client/userProfile')(app);
  require('./client/inviteUser')(app);
  require('./client/dashboard')(app);
  require('./client/availability')(app);
  require('./client/moneyTransferByAssociate')(app);

  require('./agency/auth')(app);
  require('./agency/agencyProfile')(app);
  require('./agency/walletTransaction')(app);
  require('./agency/tellerAccount')(app);
  require('./agency/accountSearch')(app);
  require('./agency/moneyTransferByAgency')(app);
  require('./agency/dashboard')(app);
  require('./agency/availability')(app);
  //require('./socket/socket')(app);
};
