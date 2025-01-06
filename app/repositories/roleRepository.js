'use strict';
/** DB Query configuration file **/

const Role = require('../models').roles;
const { Op } = require('sequelize');

const getRoles = async (arrId) => {
  const getRoles = await Role.findAll({
    where: {
      id: {
        [Op.notIn]: arrId
      }
    }
  });
  return getRoles;
};

const getRoleById = async (roleId) => {
  let role = await Role.findOne({
    where: {
      id: roleId
    }
  });

  return role;
};

module.exports = {
  getRoles,
  getRoleById
};
