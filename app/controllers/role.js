'use strict';
const { ValidationError } = require('sequelize');
const { sendSuccessResponse } = require('../services/response');
const Role = require('../models').roles;

/* GET ROLES  */
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    await sendSuccessResponse(res, 'Roles fetched successfully', roles);
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(500).send({ message: err.errors[0].message });
    }
    res.status(500).send({
      message: err.message || 'Some error occurred while getting the roles.'
    });
  }
};

exports.getAdminRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({ where: { roleType: '2' } });
    await sendSuccessResponse(res, 'Roles fetched successfully', roles);
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(500).send({ message: err.errors[0].message });
    }
    res.status(500).send({
      message: err.message || 'Some error occurred while getting the roles.'
    });
  }
};

exports.getClientRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({ where: { roleType: '1' } });
    await sendSuccessResponse(res, 'Roles fetched successfully', roles);
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(500).send({ message: err.errors[0].message });
    }
    res.status(500).send({
      message: err.message || 'Some error occurred while getting the roles.'
    });
  }
};
