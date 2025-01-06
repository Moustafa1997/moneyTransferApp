const multer = require('multer');
// let path = require('path');
// const User = require('../../models').user;
let currentPath = __dirname;

let imagePath = currentPath.replace('/app/middlewares/uploadFile', '/public/images');

var multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    //cb(null, '/data/html/cnp1560-backend/src/images/');
    cb(null, imagePath);
  },
  filename: (req, file, cb) => {
    // cb(null, file.originalname);
    const timestamp = new Date().getTime();
    const fileExtension = file.originalname.split('.').pop(); // Extract file extension
    const fileName = `image_${timestamp}_${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    cb(null, fileName);
  }
});

const multerFilter = (req, file, cb) => {
  let imgType = ['image/jpeg', 'image/jpg', 'image/png'];

  if (!imgType.includes(file.mimetype)) {
    return cb(new Error('Please upload file format as allowed(png, jpg or jpeg)'));
  }
  cb(null, true);

  // if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
  //      // upload only png and jpg format
  //    return cb(new Error('Please upload file format as allowed(png, jpg or jpeg)'));
  // }
  // cb(null, true);
};

let upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

module.exports = { upload };
