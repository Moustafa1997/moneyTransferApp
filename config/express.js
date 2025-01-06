const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const env = process.env.NODE_ENV || 'development';

module.exports = function (app, passport) {
  // parse application/json
  app.use(bodyParser.json({ limit: '50mb' }));

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(
    cors({
      origin: '*'
    })
  );
  app.use(helmet());

  app.use('/public', express.static('public'));
  app.set('view engine', 'ejs');
};
