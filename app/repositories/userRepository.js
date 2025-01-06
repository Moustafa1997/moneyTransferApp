'use strict';
/** DB Query configuration file **/

const User = require('../models').clients;
const Role = require('../models').roles;
const { Op, Sequelize } = require('sequelize');
const { getPagination } = require('../services/pagination');
const Country = require('../models').country_codes;
const State = require('../models').states;
const City = require('../models').cities;

exports.getAllUserEmails = async (email, userId) => {
  // Changed user_id to userId
  const condition = { isApproved: '1', isDeleted: '0' };

  if (email && userId) {
    // Changed user_id to userId
    condition.id = {
      [Op.notIn]: [userId] // Changed user_id to userId
    };
  }

  const users = await User.findAll({
    where: condition,
    attributes: ['email']
  });

  const userList = await JSON.parse(JSON.stringify(users));

  const userEmailArr = [];

  for (const user of userList) {
    userEmailArr.push(user.email);
  }

  return userEmailArr;
};

//Get all usersList with pagination and search
exports.getAllUserListAddl = async (arrRoleId, arrOfUserId, search, page, size) => {
  const { limit, offset } = getPagination(page, size);

  const query = {
    attributes: { exclude: ['password', 'idDocument'] },
    where: {
      id: {
        [Op.notIn]: arrOfUserId
      },
      roleId: {
        [Op.in]: arrRoleId
      },
      isApproved: '1',
      isSuspend: '0',
      isDeleted: '0'
    },
    limit,
    offset
  };

  if (search) {
    query.where.email = { [Op.like]: `%${search}%` };
  }

  const { rows } = await User.findAndCountAll(query);

  return { rows, limit, offset };
};

exports.getAllAssociateNearby = async (arrRoleId, arrOfUserId, search, userLocation) => {
  const query = {
    attributes: {
      exclude: ['password', 'idDocument'],
      include: [
        [
          Sequelize.literal(`
              6371 * acos(
                  cos(radians(${userLocation.latitude})) * cos(radians(location_latitude)) * 
                  cos(radians(location_longitude) - radians(${userLocation.longitude})) + 
                  sin(radians(${userLocation.latitude})) * sin(radians(location_latitude)) 
              )
          `),
          'distance'
        ]
      ]
    },
    where: {
      id: {
        [Op.notIn]: arrOfUserId
      },
      roleId: {
        [Op.in]: arrRoleId
      },
      isApproved: '1',
      isSuspend: '0',
      isDeleted: '0',
      locationLatitude: { [Op.ne]: null },
      locationLongitude: { [Op.ne]: null }
    },
    include: [
      {
        model: City,
        attributes: ['name'],
        as: 'city'
      },
      {
        model: State,
        attributes: ['name'],
        as: 'state'
      },
      {
        model: Country,
        attributes: ['name'],
        as: 'country'
      }
    ],
    order: Sequelize.literal('distance ASC')
  };

  if (search) {
    query.where.email = { [Op.like]: `%${search}%` };
  }

  const users = await User.findAndCountAll(query);

  return users;
};

/* GET USERS ATTENDEE PENDING LIST */
exports.getAllPendingUserList = async (req, arrId) => {
  const { sortName, sortOrder, search, size, page } = req.query; // Changed sort_name and sort_order to camelCase
  let condition;
  let query;

  const { limit, offset } = getPagination(page, size);

  condition = {
    roleId: {
      [Op.notIn]: arrId
    },
    isApproved: '2',
    isDeleted: '0'
  };

  if (search) {
    condition = {
      roleId: {
        [Op.notIn]: arrId
      },
      isApproved: '2',
      isDeleted: '0',
      [Op.or]: [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ]
    };
  }

  query = {
    where: condition,
    include: { model: Role, attributes: ['role'] },
    limit,
    offset
  };

  if (sortName && sortOrder) {
    // Changed sort_name and sort_order to camelCase
    query.order = [[sortName, sortOrder]];
  } else {
    query.order = [['updatedAt', 'DESC']];
  }

  const { rows } = await User.findAndCountAll(query);

  return { rows, limit, offset };
};

/* ADD USER */
exports.addUser = async (userData) => {
  // Changed user_data to userData
  const createUser = await User.create(userData); // Changed user_data to userData
  return createUser;
};

/* UPDATE USER */
exports.updateUser = async (userData, id) => {
  // Changed user_data to userData
  const updateUser = await User.update(userData, { where: { id } }); // Changed user_data to userData
  return updateUser;
};

/* DELETE USER */
exports.deleteUser = async (id) => {
  const deleteUser = await User.update(
    { isDeleted: '1', deletedAt: new Date() },
    { where: { id } }
  );
  return deleteUser;
};

/* GET ALL USER FOR SPECIFIC ROLE ID */
exports.getUserByRoleId = async (req, roleId) => {
  // Changed role_id and user_id to roleId and userId
  const { sortName, sortOrder, search, size, page } = req.query; // Changed sort_name and sort_order to camelCase

  let condition;
  let query;

  const { limit, offset } = getPagination(page, size);

  condition = {
    roleId,
    isApproved: '1',
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
    'isApproved',
    'isSuspend',
    'stateId',
    'cityId',
    'countryId',
    'zipcode',
    'updatedAt',
    [Sequelize.col('country.name'), 'country'],
    [Sequelize.col('state.name'), 'state'],
    [Sequelize.col('city.name'), 'city']
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
  query.include = [
    { model: Role, required: false },
    { model: Country, required: false, as: 'country' },
    { model: State, required: false, as: 'state' },
    { model: City, required: false, as: 'city' }
  ];
  query.raw = true;
  query.nest = true;
  if (sortName && sortOrder) {
    query.order = [[sortName, sortOrder]];
  } else {
    query.order = [['updatedAt', 'DESC']];
  }

  const rows = await User.findAndCountAll(query);

  return { rows, limit: limit || null, offset: offset || null };
};

exports.getAllUser = async (req) => {
  // Changed role_id and user_id to roleId and userId
  const { order, search, status, size, page } = req.query; // Changed sort_name and sort_order to camelCase

  let condition;
  let query;

  const { limit, offset } = getPagination(page, size);

  condition = {
    isApproved: '1',
    isDeleted: '0'
  };
  if (status) {
    if (status === 'active') {
      condition.isSuspend = '0';
    } else if (status === 'suspended') {
      condition.isSuspend = '1';
    }
  }

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
    'isApproved',
    'isEmailVerified',
    'isSuspend',
    'stateId',
    'cityId',
    'countryId',
    'zipcode',
    'profileImage',
    'updatedAt',
    [Sequelize.col('country.name'), 'country'],
    [Sequelize.col('state.name'), 'state'],
    [Sequelize.col('city.name'), 'city']
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
  query.include = [
    { model: Role, required: false },
    { model: Country, required: false, as: 'country' },
    { model: State, required: false, as: 'state' },
    { model: City, required: false, as: 'city' }
  ];
  query.raw = true;
  query.nest = true;
  if (order) {
    query.order = [['createdAt', order]];
  }

  const rows = await User.findAndCountAll(query);

  return { rows, limit: limit || null, offset: offset || null };
};

exports.getByRoleId = async (req, roleId) => {
  // Changed role_id to roleId
  const getUserByRoleId = await User.findAll({
    where: { roleId, isDeleted: '0', isApproved: '1' }
  });
  return getUserByRoleId;
};

/* GET ALL USER BY ID */
exports.getUserById = async (id) => {
  const getUserById = await User.findOne({
    where: { id, isDeleted: '0' },
    include: [{ model: Role, required: false }]
  });
  return getUserById;
};

/* GET ALL USER BY EMAIL */
exports.getUserByEmail = async (email) => {
  const getUserByEmail = await User.findOne({
    where: { email, isDeleted: '0', isApproved: '1' },
    include: [{ model: Role }]
  });
  return getUserByEmail;
};

//Get User By Email according to depo request module requirement
exports.getUserByEmailDepoReq = async (email) => {
  const user = await User.findOne({
    where: {
      email,
      isDeleted: '0',
      isApproved: '1'
    },
    attributes: ['id', 'email', 'firstName', 'lastName']
  });

  return user;
};

exports.getFrontendLoginUserByEmail = async (email) => {
  const getUserByEmail = await User.findOne({
    where: { email, isDeleted: '0' }
  });
  return getUserByEmail;
};

exports.isEmailExist = async (email) => {
  const getUserByEmail = await User.findOne({
    where: { email }
  });
  return getUserByEmail;
};

/* GET USER BY ROLE AND ID EMAIL */
exports.getUserById = async (id) => {
  // Changed role_id to roleId
  const getUserByIdAndRole = await User.findOne({
    where: { id, isDeleted: '0', isApproved: '1' }
  });
  return getUserByIdAndRole;
};

exports.getFrontendUserById = async (id) => {
  const getUserById = await User.findOne({
    attributes: {
      exclude: ['createdAt', 'updatedAt', 'password'],
      include: [
        [Sequelize.col('country.name'), 'country'],
        [Sequelize.col('state.name'), 'state'],
        [Sequelize.col('city.name'), 'city']
      ]
    },
    where: { id, isDeleted: '0', isApproved: '1' },
    include: [
      { model: Role, required: true },
      { model: Country, required: false, as: 'country' },
      { model: State, required: false, as: 'state' },
      { model: City, required: false, as: 'city' }
    ],
    raw: true,
    nest: true
  });
  return getUserById;
};
