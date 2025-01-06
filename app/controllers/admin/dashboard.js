'use strict';
const Agency = require('../../models').agencies;
const Client = require('../../models').clients;
const Role = require('../../models').roles;
const Transaction = require('../../models').transactions;
const { Op } = require('sequelize');
const { sendSuccessResponse, sendFailResponse } = require('../../services/response');
const { Sequelize } = require('../../models');
const { getSignedUrlFromFileKey } = require('../../services/common');
const Wallet = require('../../models').wallets;
exports.getData = async (req, res) => {
  try {
    const user = req.user;

    const agencyUsersCount = await Agency.count({ where: { isSuspend: '0' } });
    const totalAmountOfRecharge = await Transaction.sum('amount', {
      where: { type: { [Op.in]: ['0', '5'] } }
    });
    const clientsCount = await Client.findAll({
      attributes: ['roleId', [Sequelize.fn('COUNT', Sequelize.col('clients.id')), 'count']],
      include: [
        {
          model: Role,
          required: true,
          attributes: ['roleTitle']
        }
      ],
      where: { isSuspend: '0' },
      group: ['roleId']
    });

    const wallet = await Wallet.findOne({
      where: {
        roleType: 2,
        isActive: true
      }
    });

    return sendSuccessResponse(res, 'Admin Dashboard data fetched successfully.', {
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        countryCode: user.countryCode,
        phone: user.phone,
        role: user.role,
        profileImage: await getSignedUrlFromFileKey(user.profileImage)
      },
      agencyUsersCount,
      clientsCount,
      totalAmountOfRecharge,
      wallet
    });
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};
