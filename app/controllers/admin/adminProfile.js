'use strict';
const { sendSuccessResponse, sendFailResponse } = require('../../services/response');
const bcrypt = require('bcrypt');
const Admin = require('../../models').admins;

//-------------------------------------- Super Admin API HERE ------------------------------------------

/* GET USER PROFILE  */
exports.getAdminProfile = async (req, res) => {
  try {
    const user = req.user;
    let getUser = await Admin.findOne({ where: { id: user.id } });

    if (!getUser) return sendFailResponse(res, 'user not found.', 404);

    delete getUser.dataValues.password;

    return sendSuccessResponse(res, 'fetched successfully.', getUser);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

/* UPDATE USER PROFILE  */
exports.updateAdminProfile = async (req, res) => {
  try {
    const user = req.user;

    let userExist = await Admin.findOne({ where: { id: user.id } });
    if (!userExist) return sendFailResponse(res, 'user not found.', 404);

    await Admin.update(req.body, { where: { id: user.id } });
    return sendSuccessResponse(res, 'Admin Updated Successfully');
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.updateAdminPassword = async (req, res) => {
  try {
    const user = req.user;
    const { password, newPassword, confirmPassword } = req.body;

    const userExist = await Admin.findOne({ where: { id: user.id } });
    if (!userExist) return sendFailResponse(res, 'user not found.', 404);

    if (newPassword != confirmPassword) {
      return sendFailResponse(res, 'New password and confirm password does not match', 400);
    }
    let passwordIsMatch = await bcrypt.compareSync(password, userExist.password);
    if (!passwordIsMatch) return sendFailResponse(res, 'Incorrect Password!', 401);

    await Admin.update(
      { password: bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10), null) },
      { where: { id: user.id } }
    );

    return sendSuccessResponse(res, 'Admin Password Updated Successfully');
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};
