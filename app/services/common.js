'use strict';

const sendEmail = require('./email');
const { getNewInviteToken } = require('./jwtSign');
const roleRepository = require('../repositories/roleRepository');
const ejs = require('ejs');
const { getPath } = require('../services/emailTemplate');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand, S3Client } = require('@aws-sdk/client-s3');

var sendInvite = async (req, res, role) => {
  try {
    let accessToken = await getNewInviteToken();
    if (!accessToken) return res.status(422).send({ message: 'Error! Please try again' });

    req.body.token = accessToken;
    req.body.role_id = role;
    let userObj;
    var client_url;

    let roleData = await roleRepository.getRoleById(role);

    if (roleData.role_type == '2') {
      client_url = `${process.env.FRONT_URL}/register?token=${accessToken}`;
    } else {
      client_url = `${process.env.FRONT_URL}/Signup?token=${accessToken}`;
    }
    let name = `${req.body.first_name} ${req.body.last_name ? req.body.last_name : ''}`;

    userObj = {
      subject: 'Invite Link',
      html: `Hi ${name} <br> Welcome to Easy Depo <a href="${client_url}" style="font-weight:bold; color: blue">Click Here To Register!</a>`
    };

    const { filePath, templateImageLink } = await getPath('registerInviteEmailTemplate.ejs');
    userObj.html = await ejs.renderFile(filePath, {
      userName: `${name}`,
      joining_link: `${client_url}`,
      logo: `${templateImageLink}/emailer-logo.png`
    });

    req.body.joining_link = client_url;

    return await sendEmail(req, userObj);
  } catch (err) {
    return err;
  }
};

var createJoiningLinkAndToken = async () => {
  try {
    var accessToken = await getNewInviteToken();

    if (!accessToken)
      return {
        status: 0,
        message: 'Error generating registration token for new user! Please try again.'
      };

    let joining_link = `${process.env.FRONT_URL}/Signup?token=${accessToken}`;

    return { status: 1, accessToken: accessToken, joining_link: joining_link };
  } catch (e) {
    return { status: 0, message: e.message };
  }
};

//takes sequelize dateTime as input and gives year, month, date, hours and minutes in response
var getYearMonthDateTime = async (input) => {
  try {
    let dateTime = new Date(input);

    let year = dateTime.getFullYear();
    let month = dateTime.getMonth();
    let date = dateTime.getDate();
    let hour = dateTime.getHours();
    var minutes = dateTime.getMinutes();

    if (minutes < 10) {
      minutes = `0${minutes}`;
    }

    return { year: year, month: month + 1, date: date, hour: hour, minutes: minutes };
  } catch (e) {
    return { status: 0, message: e.message };
  }
};

function generateRandomCode(length = 6) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function generateOtpInNumber(length = 6) {
  return Math.floor(100000 + Math.random() * 900000)
    .toString()
    .substring(0, length);
}

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const getSignedUrlFromFileKey = async (fileUrl) => {
  try {
    if (!fileUrl) return null;
    const fileKey = getFileKeyFromUrl(fileUrl);
    if (!fileKey) return null;
    const bucketName = process.env.BUCKET_NAME;

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 * 24 }); // URL expires in 24 hour

    return signedUrl;
  } catch (error) {
    console.log('error: ', error);
    return error;
  }
};

function getFileKeyFromUrl(url) {
  const baseUrl = process.env.BUCKET_BASE_URL;
  if (url.startsWith(baseUrl)) {
    return url.substring(baseUrl.length);
  }
  return null;
}

module.exports = {
  createJoiningLinkAndToken,
  sendInvite,
  getYearMonthDateTime,
  generateRandomCode,
  getSignedUrlFromFileKey,
  generateOtpInNumber
};
