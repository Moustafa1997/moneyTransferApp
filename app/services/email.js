const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const sendEmail = async (req, emailObj, email) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email ? email : req.body.email,
    subject: emailObj.subject,
    //text: `This is reset password mail link. Please click the link to verify email ${req.client_url}`,
    html: emailObj.html
  };

  try {
    const response = await transporter.sendMail(mailOptions);
    return { success: true, response };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail
};

module.exports = sendEmail;

/* const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (req, emailObj, email) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_MAIL_CLIENT_ID,
    process.env.GOOGLE_MAIL_CLIENT_SECRET,
    process.env.GOOGLE_MAIL_REDIRECT_URL
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_MAIL_REFRESH_TOKEN });

  const accessToken = await oauth2Client.getAccessToken();
  const myEmail = 'ashraf@capitalnumbers.com';
  const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: myEmail,
      clientId: process.env.GOOGLE_MAIL_CLIENT_ID,
      clientSecret: process.env.GOOGLE_MAIL_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_MAIL_REFRESH_TOKEN,
      accessToken
    }
  });

  const mailOptions = {
    // from: 'Sender Name <arjun@capitalnumbers.com>',
    from: 'ashraf@capitalnumbers.com',
    to: email ? email : req.body.email,
    subject: emailObj.subject,
    //text: `This is reset password mail link. Please click the link to verify email ${req.client_url}`,
    html: emailObj.html
  };

  try {
    //const response = await smtpTransport.sendMail(mailOptions);
    // console.log('mailOptions==>',mailOptions);
    return await smtpTransport.sendMail(mailOptions);
  } catch (err) {
    // console.log("error==>",err);
    return err;
  } finally {
    smtpTransport.close();
  }
};

module.exports = sendEmail;
 */
