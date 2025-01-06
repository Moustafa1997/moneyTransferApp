const winston = require('winston');

const logger = winston.createLogger({
  level: 'info', // Log level (e.g., error, warn, info, verbose, debug, silly)
  format: winston.format.simple(), // Log format
  transports: [
    new winston.transports.Console(), // Log to console
    // new winston.transports.File({ filename: 'error.log', level: 'error' }), // Log to file
    new winston.transports.File({ filename: 'info.log', level: 'info' }) // Log to file
  ]
});

module.exports = logger;
