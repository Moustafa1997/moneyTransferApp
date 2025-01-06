const userRepository = require('../repositories/userRepository');
const commonService = require('../services/common');
const commonRepository = require('../repositories/commonRepository');
const { getPagingData } = require('../services/pagination');
const { ValidationError } = require('sequelize');
const creatorChecker = require('../middlewares/creatorValidationChecker/creatorChecker');

exports.inviteUserServices = async (req, res, role_id, userRole) => {
  try {
    let { email } = req.body;

    // let checkExist = await commonRepository.findInvitedByEmail(req);
    // if (checkExist) return res.status(409).send({ message: `${userRole} already invited.` });

    let checkExist = await userRepository.getUserByEmailDepoReq(email);
    if (checkExist) return res.status(409).send({ message: `This email alredy exist.` });

    let invited = await commonService.sendInvite(req, res, role_id);
    if (!invited.messageId)
      return res.status(500).send({
        status: false,
        message: `Some error occurred while inviting the ${userRole}. Please try agian!`
      });

    await commonRepository.addJoiningRequest(req);

    return res.status(200).send({ status: true, message: `${userRole} Invited Successfully` });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(500).send({ message: err.errors[0].message });
    }
    return res.status(500).send({
      message: err.message || `Some error occurred while creating the ${userRole}.`
    });
  }
};

exports.addUserServices = async (req, res, userData) => {
  try {
    let checkExist = await userRepository.getUserByEmail(userData.email);

    if (checkExist) return res.status(409).send({ message: 'Email already exist.' });

    let createUser = await userRepository.addUser(userData);
    delete createUser.dataValues.password;

    return createUser;
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(500).send({ message: err.errors[0].message });
    }
    return res.status(500).send({
      message: err.message || 'Some error occurred while creating the User.'
    });
  }
};

exports.updateUserServices = async (req, res, userData) => {
  try {
    const { id } = req.params;

    let checkExist = await userRepository.getUserById(id);

    if (!checkExist) {
      return res.status(404).send({ message: 'No user found' });
    }
    return await userRepository.updateUser(userData, id);
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(500).send({ message: err.errors[0].message });
    }
    return res.status(500).send({
      message: err.message || 'Some error occurred while updating the User.'
    });
  }
};

exports.deleteUserServices = async (req, res) => {
  try {
    const { id } = req.params;

    let checkExist = await userRepository.getUserById(id);

    if (!checkExist) return res.status(404).send({ message: 'No user found' });

    return await userRepository.deleteUser(id);
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(500).send({ message: err.errors[0].message });
    }
    return res.status(500).send({
      message: err.message || 'Some error occurred while deleting the User.'
    });
  }
};

exports.getAllUserServices = async (req, res, roleId) => {
  try {
    const { rows, offset, limit } = await userRepository.getUserByRoleId(req, roleId);

    if (rows.rows.length == 0)
      return res.status(200).send({
        message: 'Empty data',
        data: rows.rows,
        totalCount: 0,
        totalPages: 0,
        currentPage: 0
      });

    const { data, totalCount, totalPages, currentPage } = getPagingData(rows, offset, limit);

    return { data, totalCount, totalPages, currentPage };
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(500).send({ message: err.errors[0].message });
    }
    return res.status(500).send({
      message: err.message || 'Some error occurred while creating the User.'
    });
  }
};

exports.getByIdUserServices = async (req, res) => {
  try {
    const { id } = req.params;
    let checkExist = await userRepository.getUserById(id);

    if (!checkExist) return res.status(404).send({ message: 'No user found' });
    delete checkExist.dataValues.password;

    return checkExist;
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(500).send({ message: err.errors[0].message });
    }
    return res.status(500).send({
      message: err.message || 'Some error occurred while creating the User.'
    });
  }
};
