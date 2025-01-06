const AgencyProfile = require('../models').agencies;

exports.addProfile = async (data) => {
  let create = await AgencyProfile.create(data);
  return create;
};

/* UPDATE USER */
exports.updateProfile = async (data, id) => {
  let updateUser = await AgencyProfile.update(data, { where: { id } });
  return updateUser;
};

/* DELETE USER */
exports.deleteProfile = async (id) => {
  let deleteProfile = await AgencyProfile.update({ is_deleted: '1' }, { where: { id } });
  return deleteProfile;
};

/* DELETE USER */
exports.getProfileById = async (id) => {
  let profile = await AgencyProfile.findOne({ where: { id, deleted_at: null } });
  return profile;
};
