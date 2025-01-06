'use strict';

const express = require('express');
require('dotenv').config();

const app = express();
const http = require('http');
const port = process.env.PORT || 3000;

const server = http.createServer(app);

require('./config/express')(app);
require('./routes')(app);

app.use('/templateImages', express.static('public/templates/images'));

app.get('/health', (req, res) => {
  res.status(200).send({ message: 'Server is running.' });
});
server.listen(port, (err) => {
  if (!err) {
    console.log(`Server is running on port ${port}.`);
    require('./socketServer')(server);
  } else console.log(err);
});

process.on('unhandledRejection', (err) => {
  console.log('unhandledRejection error', err);
  console.log('Some error happened in Database. Exiting now...');
  // server.close(() => process.exit(1))
});

module.exports = app;
