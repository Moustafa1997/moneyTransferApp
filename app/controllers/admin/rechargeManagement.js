'use strict';

const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../../services/pagination');
const { sendSuccessResponse, sendFailResponse } = require('../../services/response');
const { sequelize } = require('../../models');
const Transactions = require('../../models').transactions;
const Client = require('../../models').clients;
const Agency = require('../../models').agencies;
const Role = require('../../models').roles;

exports.rechargesOfClients = async (req, res) => {
  try {
    let { search, size, page, status, order } = req.query;
    const { limit, offset } = getPagination(page, size);
    if (status === 'completed') {
      status = '1';
    } else if (status === 'pending') {
      status = '2';
    } else if (status === 'failed') {
      status = '0';
    } else if (status === 'all') {
      status = null;
    }
    const query = {
      where: { type: { [Op.in]: ['0', '1'] } },
      order: [['createdAt', order]],
      attributes: {
        include: [
          [
            sequelize.literal(`
              CASE
                WHEN type = '0' THEN 'bankToWallet'
                WHEN type = '1' THEN 'walletToBank'
                WHEN type = '5' THEN 'cashDeposit'
                WHEN type = '6' THEN 'cashWithdrawal'
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
          ],
          [
            sequelize.literal(`
              CASE
                WHEN client_id is null and agency_id is not null THEN 'byAgency'
                WHEN client_id is not null and agency_id is null THEN 'byClient'
              END
            `),
            'source'
          ]
        ]
      },
      include: [
        {
          model: Client,
          as: 'currentClient',
          attributes: ['id', 'firstName', 'lastName', 'countryCode', 'phone', 'email'],
          include: [
            {
              model: Role,
              as: 'role',
              attributes: ['id', 'roleTitle', 'role']
            }
          ]
        },
        {
          model: Agency,
          as: 'currentAgency',
          attributes: ['id', 'name', 'countryCode', 'phone', 'email'],
          include: [
            {
              model: Role,
              as: 'role',
              attributes: ['id', 'roleTitle', 'role']
            }
          ]
        }
      ],

      limit,
      offset
    };
    search = Number(search);
    if (search && typeof search === 'number') {
      query.where.id = Number(search);
    }
    if (status) {
      query.where.status = status;
    }
    const transactions = await Transactions.findAndCountAll(query);

    const { data, totalCount, totalPages, currentPage } = getPagingData(transactions, page, limit);

    return sendSuccessResponse(res, 'fetched sucessfully.', {
      rows: data,
      totalCount,
      totalPages,
      currentPage
    });
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};
