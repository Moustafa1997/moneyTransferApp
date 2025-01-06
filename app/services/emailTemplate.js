const path = require('path');

let templateImageLink = `http://dev81.developer24x7.com:4020/templateImages`;

let getPath = async (fileName) => {
  const filePath = path.join(__dirname, '..', '..', 'public', 'templates', `${fileName}`);
  return { filePath, templateImageLink };
};

module.exports = { getPath };
