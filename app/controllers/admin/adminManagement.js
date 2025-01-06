'use strict';

const { getPagingData, getPagination } = require('../../services/pagination');
const sendEmail = require('../../services/email');
const bcrypt = require('bcrypt');
const User = require('../../models').admins;
const Role = require('../../models').roles;
const { sendSuccessResponse, sendFailResponse } = require('../../services/response');
const { Op } = require('sequelize');

/* GET USERS */
exports.adminListByRoleId = async (req, res) => {
  try {
    const userId = req.user.id;
    const roleId = req.params.roleId;

    const { sortName, sortOrder, search, size, page } = req.query;

    let condition;
    let query;

    const { limit, offset } = getPagination(page, size);

    condition = {
      roleId,
      id: {
        [Op.notIn]: userId ? [userId] : 0
      },
      isDeleted: '0'
    };

    if (search) {
      condition[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    const attributes = [
      'id',
      'firstName',
      'lastName',
      'email',
      'countryCode',
      'phone',
      'roleId',
      'isSuspend',
      'updatedAt'
    ];
    query =
      page !== undefined &&
      size !== undefined &&
      page !== null &&
      size !== null &&
      page !== '' &&
      size !== ''
        ? {
            where: condition,
            attributes,
            limit,
            offset
          }
        : {
            where: condition,
            attributes
          };
    query.include = [{ model: Role, required: false }];

    if (sortName && sortOrder) {
      // Changed sort_name and sort_order to camelCase
      query.order = [[sortName, sortOrder]];
    } else {
      query.order = [['updatedAt', 'DESC']];
    }

    const rows = await User.findAndCountAll(query);

    const { data, totalCount, totalPages, currentPage } = getPagingData(
      rows,
      req.query.page,
      limit
    );
    return sendSuccessResponse(res, 'Admins Found Successfully', {
      rows: data,
      totalCount,
      totalPages,
      currentPage
    });
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.allAdminList = async (req, res) => {
  try {
    const { sortName, sortOrder, search, size, page } = req.query;
    let condition;
    let query;
    const userId = req.user.id;

    const { limit, offset } = getPagination(page, size);

    condition = {
      id: {
        [Op.notIn]: userId ? [userId] : 0
      },
      isDeleted: '0'
    };

    if (search) {
      condition[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    const attributes = [
      'id',
      'firstName',
      'lastName',
      'email',
      'countryCode',
      'phone',
      'roleId',
      'isSuspend',
      'updatedAt'
    ];
    query =
      page !== undefined &&
      size !== undefined &&
      page !== null &&
      size !== null &&
      page !== '' &&
      size !== ''
        ? {
            where: condition,
            attributes,
            limit,
            offset
          }
        : {
            where: condition,
            attributes
          };
    query.include = [{ model: Role, required: false }];

    if (sortName && sortOrder) {
      // Changed sort_name and sort_order to camelCase
      query.order = [[sortName, sortOrder]];
    } else {
      query.order = [['updatedAt', 'DESC']];
    }

    const rows = await User.findAndCountAll(query);

    const { data, totalCount, totalPages, currentPage } = getPagingData(
      rows,
      req.query.page,
      limit
    );
    return sendSuccessResponse(res, 'Admins Found Successfully', {
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
exports.addAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, countryCode, roleId } = req.body;

    const userData = {
      firstName,
      lastName,
      email,
      countryCode,
      phone,
      roleId
    };

    const userExist = await User.findOne({
      where: { email }
    });
    if (userExist) return res.status(409).send({ message: 'Email already exists.' });

    // Auto generate password for Admin staff
    const randomPass = Math.random().toString(36).slice(-8);
    userData.password = randomPass;

    let emailObj = {
      subject: 'New Admin Account Created in Dual Transfer',
      html: `Your new user email: ${email} and password: ${userData.password}.<br>.`
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

    const createUser = await User.create(userData);
    delete createUser.dataValues.password;

    return sendSuccessResponse(res, 'Admin Added Successfully', createUser);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

/* UPDATE USER */
exports.updateAdmin = async (req, res) => {
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
      isSuspend
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
      isSuspend
    };

    const userExist = await User.findOne({
      where: { id, isDeleted: '0' },
      include: [{ model: Role, required: false }]
    });
    if (!userExist) return res.status(404).send({ message: 'No user found.' });

    await User.update(userData, { where: { id } });
    return sendSuccessResponse(res, 'Admin updated Successfully');
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

/* DELETE USER */
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const userExist = await User.findOne({
      where: { id, isDeleted: '0' },
      include: [{ model: Role, required: false }]
    });
    if (!userExist) return res.status(404).send({ message: 'No user found' });

    await User.update({ isDeleted: '1', deletedAt: new Date() }, { where: { id } });

    return sendSuccessResponse(res, 'Admin Deleted Successfully');
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

/* GET USER BY ID */
exports.getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({
      where: { id, isDeleted: '0' },
      include: [{ model: Role, required: false }]
    });

    if (!user) return sendFailResponse(res, 'Admin not found', 404);

    delete user.dataValues.password;
    return sendSuccessResponse(res, 'Admin Found Successfully', user);
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

    const user = await User.findOne({
      where: { email, isDeleted: '0' },
      include: [{ model: Role }]
    });
    if (!user) {
      return res.status(409).send({ message: 'Admin not found' });
    }
    await User.update(
      {
        password: bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10), null)
      },
      { where: { id: user.id } }
    );

    return sendSuccessResponse(res, 'Password reset Successfully');
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};
