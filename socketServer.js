'use strict';
const { Server } = require('socket.io');
const { verifySocketToken } = require('./app/services/jwtSign');
const setupSocketHandlers = require('./app/controllers/socket/index');

module.exports = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        'https://localhost:3000',
        'http://localhost:3000',
        'https://cnp2152.developer24x7.com'
      ],
      methods: ['GET', 'POST', 'OPTIONS', 'PATCH', 'PUT', 'DELETE'],
      allowedHeaders: ['*'],
      credentials: true,
      optionsSuccessStatus: 200,
      exposedHeaders: ['*']
    }
  });

  io.use(verifySocketToken);
  setupSocketHandlers(io);

  return io;
};
