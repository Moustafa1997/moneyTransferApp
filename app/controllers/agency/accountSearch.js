const { Op } = require('sequelize');
const { sendSuccessResponse } = require('../../services/response');
const client = require('../../models').clients;

exports.getSearchClientAccounts = async (req, res) => {
  try {
    const roleIds = [6, 7];
    const user = req.user;
    const { search } = req.query;
    const query = {
      attributes: { exclude: ['password', 'idDocument', 'digitalSignature', 'uploadedSignature'] },

      where: {
        roleId: { [Op.in]: roleIds },
        id: { [Op.notIn]: user.id }
      }
    };
    if (search) {
      query.where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }
    const clients = await client.findAll(query);

    return sendSuccessResponse(res, 'fetched successfully', clients);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
