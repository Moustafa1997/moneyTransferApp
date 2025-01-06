'use strict';

const Admin = require('../../models').admins;
const Role = require('../../models').roles;
const { getToken, verifyEmailToken } = require('../../services/jwtSign');
var bcrypt = require('bcrypt');
const sendEmail = require('../../services/email');
const ejs = require('ejs');
const Wallet = require('../../models').wallets;
const { getPath } = require('../../services/emailTemplate');
const { sendSuccessResponse, sendFailResponse } = require('../../services/response');
require('dotenv').config();

/* REGISTER USER */
exports.signupUser = async (req, res) => {
  try {
    const { firstName, lastName, roleId, email, phone, password, gender, birthDate } = req.body;

    // Check if user already exists
    let userExist = await Admin.findOne({ where: { email: req.body.email, isDeleted: '0' } });
    if (userExist) return res.status(409).send({ message: 'Admin already exists.' });

    // Create new admin user
    const userData = {
      firstName,
      lastName,
      roleId,
      email,
      phone,
      password,
      gender,
      birthDate
    };
    let createUser = await Admin.create(userData);

    // Check if wallet already exists for any role (1, 2, 3, 4)
    let existingWallet = await Wallet.findOne({ where: { roleType: 2, isActive: true } });

    if (!existingWallet) {
      // Create a new wallet if it doesn't exist
      existingWallet = await Wallet.create({
        adminId: createUser.id,
        amount: 999999999999,
        roleType: 2
      });
    }

    delete createUser.dataValues.password;

    return sendSuccessResponse(res, 'Admin registered successfully.', createUser);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

/* LOGIN USER */
exports.login = async (req, res) => {
  try {
    let user = await Admin.findOne({
      where: { email: req.body.email, isDeleted: '0' },
      include: [
        {
          model: Role,
          required: true
        }
      ]
    });

    if (!user) {
      return res.status(404).send({ message: 'Admin Not found.' });
    }

    if (user.role.roleType === '1')
      return res.status(400).send({ message: "Email Id and password didn't match." });

    let passwordIsValid = await bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        token: null,
        message: 'Invalid Password!'
      });
    }

    let accessToken = await getToken(user);
    delete user.dataValues.password;
    return sendSuccessResponse(res, 'Login successfully.', {
      user,
      token: accessToken
    });
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

/* FORGOT PASSWORD */
exports.forgotPassword = async (req, res) => {
  try {
    let user = await Admin.findOne({ where: { email: req.body.email, isDeleted: '0' } });

    if (!user) return res.status(404).send({ message: 'User Not found.' });

    let accessToken = await getToken(user);

    if (!accessToken) return res.status(422).send({ message: 'Error! Please try again' });

    let clientUrl = `${process.env.FRONT_URL}/admin/resetpassword/${accessToken}`;

    let emailObj = {
      subject: 'Password Reset Link',
      html: `This is reset password mail link. Please click the link to verify email <a href="${clientUrl}" style="font-weight:bold; color: blue">Click Here!</a>`
    };

    const { filePath, templateImageLink } = await getPath('resetEmailTemplate.ejs');
    emailObj.html = await ejs.renderFile(filePath, {
      client_url: `${clientUrl}`,
      logo: `${templateImageLink}/emailer-logo.png`
    });

    let sendMail = await sendEmail(req, emailObj);
    if (!sendMail)
      return res.status(400).send({ status: false, message: 'Email not sent. Please try again.' });
    return sendSuccessResponse(res, 'Password reset mail sent', {
      token: accessToken
    });
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

/* RESET PASSWORD */
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword, token } = req.body;

    if (newPassword !== confirmPassword)
      return res.status(409).send({ message: 'Password and confirm password do not match!' });

    let userToken = await verifyEmailToken(token);

    if (!userToken) return res.status(401).send({ message: 'Invalid Token!' });

    let oldPassword = await Admin.findOne({ where: { id: userToken._id, isDeleted: '0' } });

    await oldPassword.comparePassword(newPassword, async (err, isMatch) => {
      if (isMatch)
        return res
          .status(401)
          .send({ message: 'New password cannot be the same as old password!' });
      await Admin.update(
        {
          password: bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10), null)
        },
        {
          where: {
            id: userToken._id
          }
        }
      );
      return sendSuccessResponse(res, 'Password reset successfully');
    });
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};
