// var bcrypt = require('bcrypt');
const { Sequelize } = require('../../models');
const { getSignedUrlFromFileKey } = require('../../services/common');
const { sendSuccessResponse, sendFailResponse } = require('../../services/response');
const Agency = require('../../models').agencies;
const Country = require('../../models').country_codes;
const State = require('../../models').states;
const City = require('../../models').cities;
const bcrypt = require('bcrypt');

/* UPDATE USER PROFILE  */
exports.updateAgencyProfile = async (req, res) => {
  try {
    const id = req.user.id;

    const agency = await Agency.findOne({ where: { id: id, isDeleted: '0' } });
    if (!agency) return res.status(404).json({ status: 404, message: 'Agency Not found' });

    await Agency.update(req.body, { where: { id: id } });

    const updatedData = await Agency.findOne({ where: { id: id, isDeleted: '0' } });

    return sendSuccessResponse(res, 'Agency Updated Successfully', updatedData);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.getAgencyProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const agency = await Agency.findOne({
      where: { id: id, isDeleted: '0' },
      attributes: {
        exclude: ['password'],
        include: [
          [Sequelize.col('country.name'), 'country'],
          [Sequelize.col('state.name'), 'state'],
          [Sequelize.col('city.name'), 'city']
        ]
      },
      include: [
        { model: Country, required: true, as: 'country' },
        { model: State, required: false, as: 'state' },
        { model: City, required: false, as: 'city' }
      ],
      raw: true,
      nest: true
    });
    agency.profileImage = await getSignedUrlFromFileKey(agency.profileImage);
    agency.idDocument = await getSignedUrlFromFileKey(agency.idDocument);
    agency.digitalSignature = await getSignedUrlFromFileKey(agency.digitalSignature);
    agency.uploadedSignature = await getSignedUrlFromFileKey(agency.uploadedSignature);
    return sendSuccessResponse(res, 'Agency Profile Fetched Successfully', agency);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.agencyChangePassword = async (req, res) => {
  try {
    console.log('req.body: ', req.user);
    const id = req.user.id;
    const { password, newPassword, confirmPassword } = req.body;

    if (newPassword != confirmPassword) {
      return sendFailResponse(res, 'New password and confirm password does not match', 400);
    }

    const agency = await Agency.findOne({ where: { id: id, isDeleted: '0' } });
    if (!agency) return sendFailResponse(res, 'User not found', 404);

    let passwordIsMatch = await bcrypt.compareSync(password, agency.password);
    if (!passwordIsMatch) return sendFailResponse(res, 'Incorrect Password!', 401);
    if (password == newPassword)
      return sendFailResponse(res, 'New password can not be same as old password', 400);

    let _password = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10), null);

    await Agency.update({ password: _password }, { where: { id: id } });
    return sendSuccessResponse(res, 'Password Changed Successfully');
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

//profile image update
exports.updateAgencyProfileImage = async (req, res) => {
  try {
    const id = req.user.id;
    const { profileImage } = req.body;

    const agency = await Agency.findOne({ where: { id: id, isDeleted: '0' } });
    if (!agency) return sendFailResponse(res, 'User not found', 404);

    await Agency.update({ profileImage }, { where: { id: id } });

    return sendSuccessResponse(res, 'Profile image updated successfully');
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};
