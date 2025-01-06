'use strict';
const { Op } = require('sequelize');
const { sequelize } = require('../../models');
const { sendSuccessResponse } = require('../../services/response');
const { getSignedUrlFromFileKey } = require('../../services/common');
const Transaction = require('../../models').transactions;
const Wallet = require('../../models').wallets;
const Availability = require('../../models').availability_timings;

exports.getDashboardData = async (req, res) => {
  try {
    const user = req.user;

    // past-12, past-6, past-3
    const { chartDuration } = req.body;

    const userId = req.user.id;
    const wallet = await Wallet.findOne({
      where: {
        agencyId: userId
      }
    });

    const condition = {
      agencyId: userId,
      type: { [Op.in]: ['0', '5', '2'] }
    };

    const monthWiseTransactions = await Transaction.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%m-%Y'), 'monthYear'],
        [sequelize.fn('YEAR', sequelize.col('created_at')), 'year'],
        [sequelize.fn('MONTH', sequelize.col('created_at')), 'month'],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal('CASE WHEN type IN ("0", "5") THEN amount ELSE 0 END')
          ),
          'totalAmountOfRecharge'
        ],
        [
          sequelize.fn('SUM', sequelize.literal('CASE WHEN type = "2" THEN amount ELSE 0 END')),
          'totalAmountOfSend'
        ]
      ],
      where: condition,
      group: ['monthYear', 'year', 'month'],
      order: [[sequelize.col('month'), 'ASC']]
    });

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - chartDuration.split('-')[1]);
    const chartData = await Transaction.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%m-%Y'), 'monthYear'],
        [sequelize.fn('YEAR', sequelize.col('created_at')), 'year'],
        [sequelize.fn('MONTH', sequelize.col('created_at')), 'month'],
        [
          sequelize.fn(
            'SUM',
            sequelize.literal('CASE WHEN type IN ("0", "5") THEN amount ELSE 0 END')
          ),
          'totalAmountOfRecharge'
        ]
      ],
      where: {
        agencyId: userId,
        type: { [Op.in]: ['0', '5', '2'] },
        createdAt: {
          [Op.gte]: startDate
        }
      },
      group: ['monthYear', 'year', 'month'],
      order: [[sequelize.col('month'), 'ASC']]
    });

    const totalAmountOfRecharge = await Transaction.sum('amount', {
      where: condition
    });

    const availability = await Availability.findOne({
      where: {
        agencyId: userId,
        day: new Date().getDay()
      },
      attributes: ['startTime', 'endTime', 'day', 'agencyId']
    });

    return sendSuccessResponse(res, 'Data fetched successfully', {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        countryCode: user.countryCode,
        phone: user.phone,
        role: user.role,
        profileImage: await getSignedUrlFromFileKey(user.profileImage),
        availability
      },
      wallet,
      monthWiseTransactions,
      chartData,
      totalAmountOfRecharge
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.getTransactionsForDashboard = async (req, res) => {
  try {
    let { order, status, search } = req.body;
    const userId = req.user.id;
    if (status) {
      if (status === 'completed') {
        status = '1';
      } else if (status === 'failed') {
        status = '0';
      } else {
        status = '2';
      }
    }
    search = Number(search);
    const query = {
      attributes: {
        include: [
          [
            sequelize.literal(`
                  CASE
                    WHEN type = '0' THEN 'bankToWallet'
                    WHEN type = '1' THEN 'walletToBank'
                    WHEN type = '2' THEN 'sent'
                    WHEN type = '3' THEN 'received'
                    WHEN type = '4' THEN 'charged'
                    WHEN type = '5' THEN 'addedByCash'
                    WHEN type = '6' THEN 'walletToCash'
                    WHEN type = '7' THEN 'sentToUnregisteredClient'
                    ELSE type
                  END
                `),
            'type'
          ],
          [
            sequelize.literal(`
                  CASE
                    WHEN status = '0' THEN 'failed'
                    WHEN status = '1' THEN 'completed'
                    WHEN status = '2' THEN 'pending'
                    ELSE status
                  END
                `),
            'status'
          ]
        ]
      },
      where: { agencyId: userId },
      order: [['createdAt', order]],
      limit: 10
    };
    search = Number(search);
    if (search && typeof search === 'number') {
      query.where.id = search;
    }
    if (status) {
      query.where.status = status;
    }
    const transactions = await Transaction.findAll(query);
    return sendSuccessResponse(res, 'Transactions fetched successfully', transactions);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
