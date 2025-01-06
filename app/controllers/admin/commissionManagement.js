'use strict';
const DefaultCommissions = require('../../models').default_commissions;
const Commissions = require('../../models').commissions;
const Agency = require('../../models').agencies;
const { sendSuccessResponse, sendFailResponse } = require('../../services/response');

exports.getDefaultCommissions = async (req, res) => {
  try {
    const defaultCommissions = await DefaultCommissions.findAll();

    return sendSuccessResponse(
      res,
      'Default commissions fetched successfully.',
      defaultCommissions
    );
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.updateDefaultCommissions = async (req, res) => {
  try {
    const { type, commissionInPercentage } = req.body;
    // const commission = await DefaultCommissions.bulkCreate([
    //   { type: 'cashDeposit', commissionInPercentage: 1 },
    //   { type: 'cashWithdrawal', commissionInPercentage: 1 }
    // ]);

    const commission = await DefaultCommissions.findOne({ where: { type } });
    commission.commissionInPercentage = commissionInPercentage;
    await commission.save();
    await Commissions.update(
      { commissionInPercentage: commissionInPercentage },
      { where: { isDefault: true, type } }
    );
    return sendSuccessResponse(res, 'Default commissions updated successfully.', commission);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.getCommissionsOfAgencies = async (req, res) => {
  try {
    const agencies = await Agency.findAll({
      where: { isDeleted: '0' },
      attributes: ['id', 'name', 'email', 'phone', 'countryCode'],
      include: [{ model: Commissions }]
    });
    // agencies.map(async (agency) => {
    //   await Commissions.create({
    //     agencyId: agency.id,
    //     commissionInPercentage: 1,
    //     isDefault: true,

    //     type: 'cashDeposit'
    //   });
    //   await Commissions.create({
    //     agencyId: agency.id,
    //     commissionInPercentage: 1,
    //     isDefault: true,
    //     type: 'cashWithdrawal'
    //   });
    // });
    return sendSuccessResponse(res, 'Commissions fetched successfully.', agencies);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.updateCommissions = async (req, res) => {
  try {
    const { agencyId, commissionInPercentage, type } = req.body;
    const commission = await Commissions.findOne({ where: { agencyId, type } });
    commission.commissionInPercentage = commissionInPercentage;
    commission.isDefault = false;
    await commission.save();
    return sendSuccessResponse(res, 'Commission updated successfully.', commission);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.changeDefaultCommission = async (req, res) => {
  try {
    const { agencyId, type } = req.body;
    const commission = await Commissions.findOne({ where: { agencyId, type } });
    const defaultCommission = await DefaultCommissions.findOne({ where: { type } });
    commission.isDefault = true;
    commission.commissionInPercentage = defaultCommission.commissionInPercentage;
    await commission.save();
    return sendSuccessResponse(res, 'Commission updated successfully.', commission);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};
