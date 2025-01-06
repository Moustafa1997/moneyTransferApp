'use strict';

const userRepository = require('../../repositories/userRepository');
const agencyProfileRepository = require('../../repositories/agencyProfileRepository');
const { getPagingData, getPagination } = require('../../services/pagination');
const sendEmail = require('../../services/email');
const bcrypt = require('bcrypt');
const User = require('../../models').clients;
const Role = require('../../models').roles;
const Wallet = require('../../models').wallets;
const { sendSuccessResponse, sendFailResponse } = require('../../services/response');
const { Sequelize, sequelize } = require('../../models');
const { getSignedUrlFromFileKey } = require('../../services/common');
const Country = require('../../models').country_codes;
const State = require('../../models').states;
const City = require('../../models').cities;
const Transactions = require('../../models').transactions;
const Client = require('../../models').clients;

/* GET USERS */
exports.userList = async (req, res) => {
  try {
    const roleId = req.params.roleId;

    const { rows, limit } = await userRepository.getUserByRoleId(req, roleId);

    const { data, totalCount, totalPages, currentPage } = getPagingData(
      rows,
      req.query.page,
      limit
    );
    return sendSuccessResponse(res, 'Users Found Successfully', {
      rows: data,
      totalCount,
      totalPages,
      currentPage
    });
  } catch (err) {
    console.log('err: ', err);
    return sendFailResponse(res, err.message, 500);
  }
};

exports.allUserList = async (req, res) => {
  try {
    const userId = req.user.id;

    const { rows, limit } = await userRepository.getAllUser(req, userId);

    const { data, totalCount, totalPages, currentPage } = getPagingData(
      rows,
      req.query.page,
      limit
    );

    for (const user of data) {
      user.profileImage = await getSignedUrlFromFileKey(user.profileImage);
    }

    return sendSuccessResponse(res, 'Users Found Successfully', {
      rows: data,
      totalCount,
      totalPages,
      currentPage
    });
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

/* ADD USER */
exports.addUser = async (req, res) => {
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
      stateId,
      cityId,
      countryId,
      zipcode,
      digitalSignature,
      countryCode,
      cashCapacity,
      companyName,
      yearSince,
      uploadedSignature
    } = req.body;

    let userData = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      roleId: roleId,
      phone: phone ? phone : 0,
      countryCode: countryCode ?? null,
      gender: gender,
      cashCapacity: cashCapacity ?? null,
      birthDate: birthDate ?? null,
      profileImage: profileImage ?? null,
      idDocument: idDocument ?? null,
      address: address ?? null,
      stateId: stateId ?? null,
      cityId: cityId ?? null,
      zipcode: zipcode ?? null,
      countryId: countryId ?? null,
      digitalSignature: digitalSignature ?? null,
      uploadedSignature: uploadedSignature ?? null,
      companyName: companyName ?? null,
      yearSince: yearSince ?? null,
      isEmailVerified: '1'
    };

    let userExist = await userRepository.isEmailExist(email);
    if (userExist) return res.status(409).send({ message: 'Email already exists.' });

    // Auto generate password for Admin staff
    const randomPass = Math.random().toString(36).slice(-8);
    userData.password = randomPass;

    let emailObj = {
      subject: 'New User Account Created in Dual Transfer',
      html: `Your new user email: ${email} and password: ${userData.password}.<br>Thanks for registering.`
    };

    // const { filePath, templateImageLink } = await getPath('adminLoginEmailTemplate.ejs');
    // emailObj.html = await ejs.renderFile(filePath, {
    //   userName: `${firstName} ${lastName}`,
    //   email: `${email}`,
    //   password: `${userData.password}`,
    //   logo: `${templateImageLink}/emailer-logo.png`
    // });

    let sendMail = await sendEmail(req, emailObj);
    if (!sendMail.messageId)
      return res.status(400).send({ status: false, message: 'Email not sent. Please try again.' });

    let createUser = await userRepository.addUser(userData);
    await Wallet.create({ amount: 0, clientId: createUser.id });
    delete createUser.dataValues.password;

    return sendSuccessResponse(res, 'User Added Successfully', createUser);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

/* UPDATE USER */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      firstName,
      lastName,
      phone,
      roleId,
      countryCode,
      address,
      state,
      city,
      zipcode,
      gender,
      birthDate,
      isSuspend,
      profileImage,
      idDocument,
      digitalSignature,
      uploadedSignature
    } = req.body;

    const userData = {
      firstName,
      lastName,
      phone,
      roleId,
      address,
      state,
      city,
      zipcode,
      countryCode,
      isSuspend,
      gender,
      birthDate,
      profileImage,
      idDocument,
      digitalSignature,
      uploadedSignature
    };

    let userExist = await userRepository.getUserById(id);
    if (!userExist) return res.status(404).send({ message: 'No user found.' });
    let agencyProfile;
    if (roleId === 5 && userExist.roleId !== roleId) {
      agencyProfile = await agencyProfileRepository.addProfile({});
      userData.agencyProfileId = agencyProfile.dataValues.id;
    }

    await userRepository.updateUser(userData, id);
    return sendSuccessResponse(res, 'User updated Successfully');
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

/* DELETE USER */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    let userExist = await userRepository.getUserById(id);

    if (!userExist) return res.status(404).send({ message: 'No user found' });

    await userRepository.deleteUser(id);

    return sendSuccessResponse(res, 'User Deleted Successfully');
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

/* GET USER BY ID */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({
      attributes: {
        exclude: ['password'],
        include: [
          [Sequelize.col('country.name'), 'country'],
          [Sequelize.col('state.name'), 'state'],
          [Sequelize.col('city.name'), 'city']
        ]
      },
      where: { id, isDeleted: '0' },
      include: [
        { model: Role, required: true },
        { model: Wallet, required: true },
        { model: Country, required: false, as: 'country' },
        { model: State, required: false, as: 'state' },
        { model: City, required: false, as: 'city' }
      ],
      raw: true,
      nest: true
    });

    user.profileImage = await getSignedUrlFromFileKey(user.profileImage);
    user.idDocument = await getSignedUrlFromFileKey(user.idDocument);
    user.digitalSignature = await getSignedUrlFromFileKey(user.digitalSignature);
    user.uploadedSignature = await getSignedUrlFromFileKey(user.uploadedSignature);

    if (!user) return sendFailResponse(res, 'User not found', 404);

    return sendSuccessResponse(res, 'User Found Successfully', user);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

/* RESET PASSWORD*/
exports.updatePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword, email } = req.body;

    if (newPassword !== confirmPassword)
      return res.status(409).send({ message: 'Password and confirm password do not match!' });

    let user = await userRepository.getUserByEmail(email);
    if (!user) {
      return res.status(409).send({ message: 'User not found' });
    }
    await userRepository.updateUser(
      {
        password: bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10), null)
      },
      user.id
    );
    return sendSuccessResponse(res, 'Password reset Successfully');
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

/* GET TRANSACTIONS OF USER*/
exports.getTransactionByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    let { page, size, search, status, order } = req.query;
    const { limit, offset } = getPagination(page, size);
    if (status) {
      if (status === 'completed') {
        status = '1';
      } else if (status === 'failed') {
        status = '0';
      } else {
        status = '2';
      }
    }
    const query = {
      where: { clientId: userId },
      order: [['createdAt', order]],
      attributes: {
        include: [
          [
            sequelize.literal(`
              CASE
                WHEN type = '0' THEN 'bankToWallet'
                WHEN type = '1' THEN 'walletToBank'
                WHEN type = '2' THEN 'sent'
                WHEN type = '3' THEN 'received'
                WHEN type = '4' THEN 'charged'
                WHEN type = '5' THEN 'addedByCash'
                WHEN type = '6' THEN 'walletToCash'
                WHEN type = '7' THEN 'sentToUnregisteredClient'
                ELSE type
              END
            `),
            'type'
          ],
          [
            sequelize.literal(`
                  CASE
                    WHEN status = '0' THEN 'failed'
                    WHEN status = '1' THEN 'completed'
                    WHEN status = '2' THEN 'pending'
                    ELSE status
                  END
                `),
            'status'
          ]
        ]
      },
      include: [
        {
          model: Wallet,
          required: false,
          attributes: ['id'],
          as: 'fromWallet',
          include: {
            model: Client,
            required: false,
            attributes: ['id', 'firstName', 'lastName', 'email'],
            as: 'client'
          }
        },
        {
          model: Wallet,
          required: false,
          attributes: ['id'],
          as: 'toWallet',
          include: {
            model: Client,
            required: false,
            attributes: ['id', 'firstName', 'lastName', 'email'],
            as: 'client'
          }
        }
      ],
      limit,
      offset
    };
    if (status) {
      query.where.status = status;
    }
    search = Number(search);
    if (search && typeof search === 'number') {
      query.where.id = search;
    }
    const transactions = await Transactions.findAndCountAll(query);
    const { data, totalCount, totalPages, currentPage } = getPagingData(transactions, page, limit);
    return sendSuccessResponse(res, 'Transactions Found Successfully', {
      rows: data,
      totalCount,
      totalPages,
      currentPage
    });
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};
