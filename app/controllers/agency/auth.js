'use strict';

const { getToken, getEmailToken, verifyEmailToken } = require('../../services/jwtSign');
var bcrypt = require('bcrypt');
const sendEmail = require('../../services/email');
const Agency = require('../../models').agencies;
const roleRepository = require('../../repositories/roleRepository');
const { ValidationError, Op } = require('sequelize');
const { sendSuccessResponse, sendFailResponse } = require('../../services/response');
const Wallet = require('../../models').wallets;
const DefaultCommission = require('../../models').default_commissions;
const Commissions = require('../../models').commissions;
const Invitation = require('../../models').invitations;
const Availability = require('../../models').availability_timings;

exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      countryCode,
      phone,
      password,
      country,
      address,
      state,
      city,
      zipcode,
      cashCapacity,
      rechargeBudget,
      cashiers,
      representativeDetails,
      profileImage,
      idDocument,
      digitalSignature,
      uploadedSignature,
      referCode
    } = req.body;

    const createObj = {
      name,
      email,
      roleId: 5,
      phone: phone || 0,
      countryCode,
      password,
      cashCapacity,
      rechargeBudget,
      cashiers,
      address,
      stateId: state || null,
      cityId: city || null,
      countryId: country || null,
      zipcode,
      profileImage,
      idDocument,
      digitalSignature,
      uploadedSignature,
      ...(representativeDetails && {
        representativeFirstName: representativeDetails.firstName,
        representativeLastName: representativeDetails.lastName,
        representativeGender: representativeDetails.gender,
        representativeBirthDate: representativeDetails.birthDate,
        representativePhone: representativeDetails.phone,
        representativeEmail: representativeDetails.email,
        representativeIdDocument: representativeDetails.idNumber
      })
    };

    // Remove null or undefined values
    Object.keys(createObj).forEach((key) => createObj[key] == null && delete createObj[key]);

    const foundUser = await Agency.findOne({
      where: { email }
    });
    if (foundUser) return sendFailResponse(res, 'Agency with the same email already exists', 400);
    let invitation;
    if (referCode) {
      invitation = await Invitation.findOne({
        where: { code: referCode, email, status: { [Op.notIn]: [0, 1] } }
      });
      if (!invitation) {
        return sendFailResponse(res, 'Invitation not found', 400);
      }
    }
    const createdUser = await Agency.create(createObj);
    if (referCode && invitation) {
      invitation.status = '1';
      invitation.invitedToAgency = createdUser.id;
      await invitation.save();
    }
    if (createdUser) {
      await Wallet.create({ amount: 0, agencyId: createdUser.id });
      await Availability.bulkCreate([
        {
          day: 'monday',
          startTime: '09:00',
          endTime: '18:00',
          agencyId: createdUser.id,
          rank: 1
        },
        {
          day: 'tuesday',
          startTime: '09:00',
          endTime: '18:00',
          agencyId: createdUser.id,
          rank: 2
        },
        {
          day: 'wednesday',
          startTime: '09:00',
          endTime: '18:00',
          agencyId: createdUser.id,
          rank: 3
        },
        {
          day: 'thursday',
          startTime: '09:00',
          endTime: '18:00',
          agencyId: createdUser.id,
          rank: 4
        },
        {
          day: 'friday',
          startTime: '09:00',
          endTime: '18:00',
          agencyId: createdUser.id,
          rank: 5
        },
        { day: 'saturday', startTime: null, endTime: null, agencyId: createdUser.id, rank: 6 },
        { day: 'sunday', startTime: null, endTime: null, agencyId: createdUser.id, rank: 7 }
      ]);
      let defaultCommissions = await DefaultCommission.findAll();
      for (const commission of defaultCommissions) {
        await Commissions.create({
          agencyId: createdUser.id,
          commissionInPercentage: commission.commissionInPercentage,
          isDefault: true,
          type: commission.type
        });
      }

      let accessToken = await getEmailToken(createdUser);
      let clientUrl = `${process.env.BACKEND_URL}/api/agency/verify-user-account?token=${accessToken}`;
      let emailObj = {
        subject: 'Money Transfer Verification Mail',
        html: `Hello <br> Welcome to Dual Transfer, your registration request was successfully sent. Please verify your account. <br> ${clientUrl}`
      };

      let sendMail = await sendEmail(req, emailObj);
      if (!sendMail)
        return res.status(400).send({
          status: false,
          message: 'Registration email not sent. Please try again.'
        });
    }

    return sendSuccessResponse(
      res,
      'Registration submitted successfully. Please verify email and proceed to log in.'
    );
  } catch (e) {
    if (e instanceof ValidationError) {
      return res.status(500).send({ message: e.errors[0].message });
    }
    return res.status(500).json({ message: e.message });
  }
};

exports.agencyLogin = async (req, res) => {
  try {
    const user = await Agency.findOne({ where: { email: req.body.email, isDeleted: '0' } });
    console.log(user);
    if (!user) {
      return sendFailResponse(res, "Email ID and password didn't match.", 400);
    }

    const roleId = user.roleId;
    const role = await roleRepository.getRoleById(roleId);

    if (user.isEmailVerified === '0') {
      return sendFailResponse(res, 'Registration request for this email ID is pending.', 400);
    }

    if (user.isSuspended === '1') {
      return sendFailResponse(res, 'Your account has been suspended.', 400);
    }

    user.dataValues.role = role;

    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return sendFailResponse(res, "Email ID and password didn't match.", 400);
    }

    const accessToken = await getToken(user);

    const sanitizedUser = { ...user.dataValues };
    delete sanitizedUser.password;
    delete sanitizedUser.isOnline;
    delete sanitizedUser.isApproved;
    delete sanitizedUser.isDeleted;
    delete sanitizedUser.lastLogin;
    delete sanitizedUser.loginAttempt;
    delete sanitizedUser.emailVerifiedAt;
    delete sanitizedUser.createdAt;
    delete sanitizedUser.updatedAt;
    delete sanitizedUser.deletedAt;
    delete sanitizedUser.createdBy;
    delete sanitizedUser.updatedBy;
    delete sanitizedUser.rememberToken;
    delete sanitizedUser.streetAddress;
    delete sanitizedUser.state;
    delete sanitizedUser.city;
    delete sanitizedUser.zipcode;

    return sendSuccessResponse(res, 'Login successful', {
      user: sanitizedUser,
      token: accessToken
    });
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.verifyAgency = async (req, res) => {
  try {
    const { token } = req.query;
    let userToken = await verifyEmailToken(token);
    if (!userToken) return sendFailResponse(res, 'Invalid Token!', 400);
    const user = await Agency.findOne({ where: { id: userToken._id, isDeleted: '0' } });
    if (!user) {
      return sendFailResponse(res, 'Agency not found.', 400);
    }
    if (user.isEmailVerified === '1') {
      return sendFailResponse(res, 'Email already verified. Please login to continue.', 400);
    }

    user.isEmailVerified = '1';
    await user.save();

    return sendSuccessResponse(res, 'Account Verified.');
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.agencyForgotPassword = async (req, res) => {
  try {
    let user = await await Agency.findOne({ where: { email: req.body.email, isDeleted: '0' } });
    if (!user) return res.status(404).send({ message: 'Agency not found.' });

    let accessToken = await getEmailToken(user);

    if (!accessToken) return res.status(422).send({ message: 'Error! Please try again' });

    let clientUrl = `${process.env.FRONT_URL}/Resetpassword?token=${accessToken}`;

    let emailObj = {
      subject: 'Password Reset Link',
      html: `This is reset password mail link. Please click the link to verify email. <br>${clientUrl}`
    };

    // const { filePath, templateImageLink } = await getPath('resetEmailTemplate.ejs');
    // emailObj.html = await ejs.renderFile(filePath, {
    //   client_url: `${clientUrl}`,
    //   logo: `${templateImageLink}/emailer-logo.png`
    // });

    let sendMail = await sendEmail(req, emailObj);
    if (!sendMail) return sendFailResponse(res, 'Email not sent. Please try again.', 400);

    return sendSuccessResponse(
      res,
      'Password reset mail sent. Please access your mail to reset your password.'
    );
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.agencyResetPassword = async (req, res) => {
  try {
    const { newPassword, token } = req.body;

    let userToken = await verifyEmailToken(token);

    if (!userToken) return sendFailResponse(res, 'Invalid Token!', 400);

    let oldPassword = await Agency.findOne({ where: { id: userToken._id, isDeleted: '0' } });
    await oldPassword.comparePassword(newPassword, async (err, isMatch) => {
      if (isMatch)
        return sendFailResponse(res, 'New password cannot be the same as old password!', 400);

      let updated = await Agency.update(
        {
          password: bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10), null)
        },
        { where: { id: userToken._id } }
      );

      if (updated) {
        return sendSuccessResponse(
          res,
          'Password reset successfully. Please login with your new password.'
        );
      } else {
        return sendFailResponse(res, 'Password reset failed.', 400);
      }
    });
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};
