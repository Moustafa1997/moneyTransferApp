const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    version: '1.0.0',
    title: 'MONEY TRANSFER API',
    description: 'Documentation automatically generated by the <b>swagger-autogen</b> module.'
  },
  //host: "localhost:9000",
  host: 'https://cnp2152api.developer24x7.com',
  basePath: '/',
  schemes: ['http', 'https'],
  consumes: ['application/json'],
  produces: ['application/json'],
  tags: [
    {
      name: 'User',
      description: 'Endpoints'
    }
  ],
  securityDefinitions: {
    apiKeyAuth: {
      type: 'apiKey',
      in: 'header', // can be "header", "query" or "cookie"
      name: 'X-API-KEY', // name of the header, query parameter or cookie
      description: 'any description...'
    }
  },
  definitions: {}
};

const outputFile = './swagger.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require('./routes/index'); // Your project's root file
});
