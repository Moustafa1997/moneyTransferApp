const userRepository = require('../../repositories/userRepository');
var bcrypt = require('bcrypt');
const { sendSuccessResponse, sendFailResponse } = require('../../services/response');
const { getSignedUrlFromFileKey } = require('../../services/common');
const User = require('../../models').clients;
const Agency = require('../../models').agencies;
/* UPDATE USER PROFILE  */
exports.updateUserProfile = async (req, res) => {
  try {
    const id = req.user.id;

    const userExist = await userRepository.getFrontendUserById(id);
    if (!userExist) return res.status(404).json({ status: 404, message: 'User Not found' });

    await userRepository.updateUser(req.body, id);

    const updatedData = await userRepository.getFrontendUserById(id);

    return sendSuccessResponse(res, 'User Updated Successfully', updatedData);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.changeRoleOfClient = async (req, res) => {
  try {
    const id = req.user.id;

    const userExist = await userRepository.getFrontendUserById(id);
    if (!userExist) return res.status(404).json({ status: 404, message: 'User Not found' });

    await userRepository.updateUser(
      { roleId: req.body.roleId, reasonForNormalToAssociate: req.body.reason },
      id
    );

    const updatedData = await userRepository.getFrontendUserById(id);

    return sendSuccessResponse(res, 'User Updated Successfully', updatedData);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

/* UPDATE USER PASSWORD  */
exports.userChangePassword = async (req, res) => {
  try {
    const id = req.user.id;
    const { password, newPassword, confirmPassword } = req.body;

    if (newPassword != confirmPassword) {
      return sendFailResponse(res, 'New password and confirm password does not match', 400);
    }

    const userExist = await userRepository.getUserById(id);
    if (!userExist) return sendFailResponse(res, 'User not found', 404);

    let passwordIsMatch = await bcrypt.compareSync(password, userExist.password);
    if (!passwordIsMatch) return sendFailResponse(res, 'Incorrect Password!', 401);
    if (password == newPassword)
      return sendFailResponse(res, 'New password can not be same as old password', 400);

    let _password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10), null);

    await userRepository.updateUser({ password: _password }, id);

    return sendSuccessResponse(res, 'Password Changed Successfully');
  } catch (err) {
    console.log('err: ', err);
    return sendFailResponse(res, err.message, 500);
  }
};

exports.getUserProfileById = async (req, res) => {
  try {
    const user_id = req.user.id;

    let data = await userRepository.getFrontendUserById(user_id);
    data.profileImage = await getSignedUrlFromFileKey(data.profileImage);
    data.idDocument = await getSignedUrlFromFileKey(data.idDocument);
    data.digitalSignature = await getSignedUrlFromFileKey(data.digitalSignature);
    data.uploadedSignature = await getSignedUrlFromFileKey(data.uploadedSignature);
    return sendSuccessResponse(res, 'User Found Successfully', data);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

// Controller function
exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return sendFailResponse(res, 'Email is required', 400);
    }

    // First check in clients table
    let user = await User.findOne({
      where: { email, isDeleted: '0' },
      attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage']
    });

    // If not found in clients, check in agencies table
    if (!user) {
      user = await Agency.findOne({
        where: { email, isDeleted: '0' },
        attributes: ['id', 'name', 'email', 'profileImage']
      });
    }

    // If not found in either table
    if (!user) {
      return sendFailResponse(res, 'No record found', 404);
    }

    return sendSuccessResponse(res, 'User Found Successfully', user);
  } catch (err) {
    console.error('Error in getUserByEmail:', err);
    return sendFailResponse(res, err.message, 500);
  }
};
//profile image update
exports.updateProfileImage = async (req, res) => {
  try {
    const id = req.user.id;
    const { profileImage } = req.body;

    const userExist = await userRepository.getFrontendUserById(id);
    if (!userExist) return sendFailResponse(res, 'User not found', 404);

    await userRepository.updateUser({ profileImage }, id);

    return sendSuccessResponse(res, 'Profile image updated successfully');
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};
