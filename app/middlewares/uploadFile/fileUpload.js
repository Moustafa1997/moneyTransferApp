const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const multerStorage = multerS3({
  s3: s3,
  bucket: process.env.BUCKET_NAME,
  key: (req, file, cb) => {
    let fileFolderType = req.params.type;
    const timestamp = new Date().getTime();
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${timestamp}_${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;

    let filePath = `${fileFolderType}/${fileName}`;
    // if (fileFolderType === 'profile-upload') {
    //   filePath = `profile-upload/${fileName}`;
    // }
    // if (fileFolderType === 'id-document') {
    //   filePath = `id-document/${fileName}`;
    // }

    cb(null, filePath);
  }
});

const multerFilter = (req, file, cb) => {
  let imgType = ['image/jpeg', 'image/jpg', 'image/png'];
  let idDocument = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

  // let uploadImgType = [
  //   'application/pdf', //pdf
  //   'application/msword', //doc
  //   'application/vnd.ms-powerpoint', //ppt
  //   'application/vnd.openxmlformats-officedocument.presentationml.presentation', //pptx:
  //   'audio/mpeg', //mp3
  //   'video/mp4', //mp4
  //   'text/plain', //txt
  //   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' //xlsx
  // ];

  if (file.fieldname === 'id-document') {
    if (!idDocument.includes(file.mimetype)) {
      return cb(
        new Error('Please upload files in PDF, DOC, XLSX, PPT, MP3, MP4, or TXT format only')
      );
    }
  }
  if (
    file.fieldname === 'profile-upload' ||
    file.fieldname === 'digital-signature' ||
    file.fieldname === 'uploaded-signature'
  ) {
    if (!imgType.includes(file.mimetype)) {
      return cb(new Error('Please upload file format as allowed(png, jpg or jpeg)'));
    }
  }

  cb(null, true);
};

exports.upload = multer({
  storage: multerStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, //20 MB
  fileFilter: multerFilter
}).single('file');
