'use strict';

const { getToken, getEmailToken, verifyEmailToken } = require('../../services/jwtSign');
var bcrypt = require('bcrypt');
const sendEmail = require('../../services/email');
const Invitation = require('../../models').invitations;
const userRepository = require('../../repositories/userRepository');
const roleRepository = require('../../repositories/roleRepository');
const { ValidationError, Op } = require('sequelize');
const { sendSuccessResponse, sendFailResponse } = require('../../services/response');
const User = require('../../models').clients;
const Wallet = require('../../models').wallets;
const Availability = require('../../models').availability_timings;

exports.registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      roleId,
      phone,
      password,
      gender,
      birthDate,
      profileImage,
      idDocument,
      address,
      state,
      city,
      country,
      zipcode,
      referCode,
      digitalSignature,
      countryCode,
      cashCapacity,
      companyName,
      yearSince,
      uploadedSignature,
      locationLatitude,
      locationLongitude
    } = req.body;

    let createObj = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      roleId: roleId,
      phone: phone,
      countryCode: countryCode ?? null,
      password: password,
      gender: gender,
      cashCapacity: cashCapacity ?? null,
      companyName: companyName ?? null,
      yearSince: yearSince ?? null,
      birthDate: birthDate ?? null,
      profileImage: profileImage ?? null,
      idDocument: idDocument ?? null,
      address: address ?? null,
      stateId: state ?? null,
      cityId: city ?? null,
      zipcode: zipcode ?? null,
      countryId: country ?? null,
      digitalSignature: digitalSignature ?? null,
      uploadedSignature: uploadedSignature ?? null,
      locationLatitude: locationLatitude ?? null,
      locationLongitude: locationLongitude ?? null
    };

    let foundUser = await userRepository.isEmailExist(email);
    if (foundUser && (!foundUser.password || foundUser.password == null)) {
      await userRepository.updateUser(
        {
          password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
        },
        foundUser.id
      );
    } else {
      if (foundUser) return sendFailResponse(res, 'User with the same email already exists', 400);
    }

    let invitation;
    if (referCode) {
      invitation = await Invitation.findOne({
        where: { code: referCode, email, status: { [Op.notIn]: [0, 1] } }
      });
      if (!invitation) {
        return sendFailResponse(res, 'Invitation not found', 400);
      }
    }
    if (!foundUser) {
      const createdUser = await userRepository.addUser(createObj);
      if (referCode && invitation) {
        invitation.status = '1';
        invitation.invitedTo = createdUser.id;
        await invitation.save();
      }

      if (createdUser) {
        await Wallet.create({ amount: 0, clientId: createdUser.id });
        if (roleId === 6) {
          await Availability.bulkCreate([
            {
              day: 'monday',
              startTime: '09:00',
              endTime: '18:00',
              clientId: createdUser.id,
              rank: 1
            },
            {
              day: 'tuesday',
              startTime: '09:00',
              endTime: '18:00',
              clientId: createdUser.id,
              rank: 2
            },
            {
              day: 'wednesday',
              startTime: '09:00',
              endTime: '18:00',
              clientId: createdUser.id,
              rank: 3
            },
            {
              day: 'thursday',
              startTime: '09:00',
              endTime: '18:00',
              clientId: createdUser.id,
              rank: 4
            },
            {
              day: 'friday',
              startTime: '09:00',
              endTime: '18:00',
              clientId: createdUser.id,
              rank: 5
            },
            { day: 'saturday', startTime: null, endTime: null, clientId: createdUser.id, rank: 6 },
            { day: 'sunday', startTime: null, endTime: null, clientId: createdUser.id, rank: 7 }
          ]);
        }
        let accessToken = await getEmailToken(createdUser);
        let clientUrl = `${process.env.BACKEND_URL}/api/client/verify-user-account?token=${accessToken}`;
        let emailObj = {
          subject: 'Money Transfer Verification Mail',
          html: `Hi ${firstName} ${lastName} <br> Welcome to Dual Transfer, your registration request was successfully sent. Please verify your account. <br> ${clientUrl}`
        };

        let sendMail = await sendEmail(req, emailObj);
        if (!sendMail)
          return res.status(400).send({
            status: false,
            message: 'Registration email not sent. Please try again.'
          });
      }
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

exports.frontendLogin = async (req, res) => {
  try {
    const user = await userRepository.getFrontendLoginUserByEmail(req.body.email);
    if (!user || !user.password || user.password == null) {
      return sendFailResponse(res, 'User not found.', 400);
    }

    const roleId = user.roleId;
    const role = await roleRepository.getRoleById(roleId);
    if (req.body.type !== role.role) {
      return sendFailResponse(res, 'User with same role not found.', 400);
    }

    if (user.isEmailVerified === '0') {
      return sendFailResponse(res, 'Registration request for this email ID is pending.', 400);
    }

    if (user.isSuspend === '1') {
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

    return sendSuccessResponse(res, 'Login successful.', {
      user: sanitizedUser,
      token: accessToken
    });
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};
exports.logout = (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        status: false,
        message: 'Logout failed',
        error: err.message
      });
    }

    // Optionally, clear the cookie storing the session ID
    // res.clearCookie('connect.sid');

    // Respond with a success message
    res.status(200).json({
      status: true,
      message: 'Logged out successfully'
    });
  });
};
exports.verifyFrontendUser = async (req, res) => {
  try {
    const { token } = req.query;
    let userToken = await verifyEmailToken(token);
    if (!userToken) return res.status(401).send({ message: 'Invalid Token!' });
    const user = await User.findOne({ where: { id: userToken._id, isDeleted: '0' } });
    if (user.isEmailVerified === '1') {
      return res
        .status(400)
        .send({ status: false, message: 'Email already verified. Please login to continue.' });
    }

    user.isEmailVerified = '1';
    await user.save();

    return sendSuccessResponse(res, 'Account Verified.');
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.frontendForgotPassword = async (req, res) => {
  try {
    let user = await userRepository.getFrontendLoginUserByEmail(req.body.email);

    if (!user || !user.password || user.password == null)
      return res.status(404).send({ message: 'User not found.' });

    let accessToken = await getEmailToken(user);

    if (!accessToken) return res.status(422).send({ message: 'Error! Please try again' });

    let clientUrl = `${process.env.FRONT_URL}/client/reset-password/${accessToken}`;

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

exports.frontendResetPassword = async (req, res) => {
  try {
    const { newPassword, token } = req.body;

    let userToken = await verifyEmailToken(token);

    if (!userToken) return sendFailResponse(res, 'Invalid Token!', 400);

    let oldPassword = await userRepository.getUserById(userToken._id);

    await oldPassword.comparePassword(newPassword, async (err, isMatch) => {
      if (isMatch)
        return sendFailResponse(res, 'New password cannot be the same as old password!', 400);

      let updated = await userRepository.updateUser(
        {
          password: bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10), null)
        },
        userToken._id
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
exports.internallyClientRegistration = async (userDetails, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      roleId,
      phone,
      gender,
      birthDate,
      profileImage,
      idDocument,
      address,
      state,
      city,
      country,
      zipcode,
      referCode,
      digitalSignature,
      countryCode,
      cashCapacity,
      companyName,
      yearSince,
      uploadedSignature,
      locationLatitude,
      locationLongitude
    } = userDetails;

    let createObj = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      roleId: roleId,
      phone: phone,
      countryCode: countryCode ?? null,
      password: null,
      gender: gender,
      cashCapacity: cashCapacity ?? null,
      companyName: companyName ?? null,
      yearSince: yearSince ?? null,
      birthDate: birthDate ?? null,
      profileImage: profileImage ?? null,
      idDocument: idDocument ?? null,
      address: address ? address : null,
      stateId: state ? state : null,
      cityId: city ? city : null,
      zipcode: zipcode ? zipcode : null,
      countryId: country ? country : null,
      digitalSignature: digitalSignature ? digitalSignature : null,
      uploadedSignature: uploadedSignature ? uploadedSignature : null,
      locationLatitude: locationLatitude ? locationLatitude : null,
      locationLongitude: locationLongitude ? locationLongitude : null
    };

    let foundUser = await userRepository.isEmailExist(email);
    if (foundUser && foundUser.password != null)
      return sendFailResponse(res, 'User with the same email already exists', 400);

    let invitation;
    if (referCode) {
      invitation = await Invitation.findOne({
        where: { code: referCode, email, status: { [Op.notIn]: [0, 1] } }
      });
      if (!invitation) {
        return sendFailResponse(res, 'Invitation not found', 400);
      }
    }
    if (!foundUser) {
      const createdUser = await userRepository.addUser(userDetails);
      if (referCode && invitation) {
        invitation.status = '1';
        invitation.invitedTo = createdUser.id;
        await invitation.save();
      }
      if (createdUser) {
        await Wallet.create({
          amount: userDetails?.isSender ? userDetails.amount : 0,
          clientId: createdUser.id
        });
        if (roleId === 6) {
          await Availability.bulkCreate([
            {
              day: 'monday',
              startTime: '09:00',
              endTime: '18:00',
              clientId: createdUser.id,
              rank: 1
            },
            {
              day: 'tuesday',
              startTime: '09:00',
              endTime: '18:00',
              clientId: createdUser.id,
              rank: 2
            },
            {
              day: 'wednesday',
              startTime: '09:00',
              endTime: '18:00',
              clientId: createdUser.id,
              rank: 3
            },
            {
              day: 'thursday',
              startTime: '09:00',
              endTime: '18:00',
              clientId: createdUser.id,
              rank: 4
            },
            {
              day: 'friday',
              startTime: '09:00',
              endTime: '18:00',
              clientId: createdUser.id,
              rank: 5
            },
            { day: 'saturday', startTime: null, endTime: null, clientId: createdUser.id, rank: 6 },
            { day: 'sunday', startTime: null, endTime: null, clientId: createdUser.id, rank: 7 }
          ]);
        }
      }
      return createdUser;
    } else {
      if (userDetails?.isSender) {
        const userWallet = await Wallet.findOne({
          where: { clientId: foundUser.id }
        });
        userWallet.amount = userWallet.amount + userDetails.amount;
        await userWallet.save();
      }
      return foundUser.dataValues;
    }
  } catch (e) {
    if (e instanceof ValidationError) {
      return res.status(500).send({ message: e.errors[0].message });
    }
    return res.status(500).json({ message: e.message });
  }
};
