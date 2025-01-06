// const { Op } = require('sequelize');
// const { getPagination, getPagingData } = require('../../services/pagination');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../../services/pagination');
const { sendFailResponse, sendSuccessResponse } = require('../../services/response');
const { sequelize } = require('../../models');
// const { generateRandomCode } = require('../../services/common');
// const sendEmail = require('../../services/email');
const Client = require('../../models').clients;
const Agency = require('../../models').agencies;
const Wallet = require('../../models').wallets;
const Transactions = require('../../models').transactions;
const CashTransaction = require('../../models').cash_transactions;
const CountryCodes = require('../../models').country_codes;
const State = require('../../models').states;
// const Role = require('../../models').roles;
// const CashTransaction = require('../../models').cash_transactions;

exports.addToWalletFromBank = async (req, res) => {
  try {
    const user = req.user;
    const { amount, note } = req.body;
    if (user.roleId !== 5) {
      return sendFailResponse(res, 'Only Agency can perform this operation', 400);
    }
    let wallet;

    wallet = await Wallet.findOne({ where: { agencyId: user.id, isActive: true } });
    if (!wallet) {
      return sendFailResponse(res, 'Wallet not found', 404);
    }

    wallet.amount = wallet.amount + amount;
    await wallet.save();
    await Transactions.create({
      agencyId: user.id,
      cashTransactionBy: 'agency',
      cashTransactionByClientId: user.id,
      amount,
      type: '0',
      status: '1',
      isDeducted: false,
      note: note ?? undefined
    });
    return sendSuccessResponse(res, 'added sucessfully', wallet);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.addToBankFromWallet = async (req, res) => {
  try {
    const user = req.user;
    const { amount, note } = req.body;
    let wallet;
    if (user.roleId !== 5) {
      return sendFailResponse(res, 'Only Agency can perform this operation', 400);
    }
    wallet = await Wallet.findOne({ where: { agencyId: user.id, isActive: true } });
    if (!wallet) {
      return sendFailResponse(res, 'Wallet not found', 404);
    }
    if (wallet.amount < amount) {
      return sendFailResponse(res, 'Insufficient Balance', 400);
    }

    wallet.amount = wallet.amount - amount;
    await wallet.save();
    await Transactions.create({
      agencyId: user.id,
      amount,
      type: '1',
      status: '1',
      isDeducted: true,
      note: note ?? undefined
    });
    return sendSuccessResponse(res, 'Withdraw sucessfully.', wallet);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.getMyWalletDetails = async (req, res) => {
  try {
    const user = req.user;

    const wallet = await Wallet.findOne({ where: { agencyId: user.id, isActive: true } });
    if (!wallet) {
      res.status(404).send({
        message: 'Wallet not found'
      });
    }

    return sendSuccessResponse(res, 'fetched sucessfully.', wallet);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.rechargeClientWallet = async (req, res) => {
  try {
    const user = req.user;
    const { amount, note, clientId } = req.body;
    const client = await Client.findByPk(clientId);
    if (!client) {
      return sendFailResponse(res, 'Client not found', 404);
    }
    const fromWallet = await Wallet.findOne({ where: { agencyId: user.id, isActive: true } });
    if (!fromWallet) {
      return sendFailResponse(res, 'Wallet not found', 404);
    }
    if (fromWallet.amount < amount) {
      return sendFailResponse(res, 'Insufficient Balance', 400);
    }
    const clientWallet = await Wallet.findOne({ where: { clientId: clientId, isActive: true } });
    if (!clientWallet) {
      return sendFailResponse(res, 'Client Wallet not found', 404);
    }
    fromWallet.amount = fromWallet.amount - amount;
    await fromWallet.save();
    clientWallet.amount = clientWallet.amount + amount;
    await clientWallet.save();
    await Transactions.create({
      agencyId: user.id,
      clientId: clientId,
      amount,
      type: '5',
      status: '1',
      cashTransactionBy: 'agency',
      cashTransactionByClientId: user.id,
      isDeducted: false,
      note: note ?? undefined
    });
    return sendSuccessResponse(res, 'Recharged sucessfully.', clientWallet);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.rechargeTransactions = async (req, res) => {
  try {
    const { page, size, order } = req.query;
    const { limit, offset } = getPagination(page, size);
    const user = req.user;
    const searchFilter = { cashTransactionBy: 'agency', cashTransactionByClientId: user.id };
    if (req.query.transactionId) {
      searchFilter.id = req.query.transactionId;
    }
    if (req.query.status) {
      const statusMap = { failed: '0', completed: '1', pending: '2' };
      if (statusMap[req.query.status]) {
        searchFilter.status = statusMap[req.query.status];
      }
    }
    const query = {
      where: searchFilter,
      order: [['createdAt', order]],
      limit,
      offset
    };
    const transactions = await Transactions.findAll(query);
    return sendSuccessResponse(res, 'Recharged sucessfully.', transactions);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.validateCashTransaction = async (req, res) => {
  try {
    const user = req.user;
    const { id, uniqueCode } = req.body;
    const cashTransaction = await CashTransaction.findOne({
      where: { id, uniqueCode, status: '2' }
    });
    if (!cashTransaction) {
      return sendFailResponse(res, 'Invalid cash transaction', 400);
    }
    cashTransaction.status = '1';
    cashTransaction.agencyId = user.id;
    await cashTransaction.save();
    return sendSuccessResponse(res, 'Cash transaction validated and paid', cashTransaction);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};
exports.getTransactions = async (req, res) => {
  try {
    const user = req.user;
    let { search, size, page, status, order } = req.query;
    const { limit, offset } = getPagination(page, size);
    const searchFilter = { agencyId: user.id };

    // Search filter logic
    if (search) {
      delete searchFilter.agencyId;
      searchFilter[Op.or] = [
        { documentNumber: { [Op.eq]: search } },
        { uniqueCode: { [Op.eq]: search } }
      ];
    }

    // Status filter logic
    if (status) {
      status = status === 'completed' ? '1' : status === 'failed' ? '0' : '2';
      searchFilter.status = status;
    }

    // Additional filters
    if (req.query.id) searchFilter.id = req.query.id;
    if (req.query.documentNumber) searchFilter.documentNumber = req.query.documentNumber;
    if (req.query.type) {
      const statusMap = { sent: '3', received: '4' };
      if (statusMap[req.query.type]) {
        searchFilter.type = statusMap[req.query.type];
      }
    }

    const query = {
      where: searchFilter,
      order: [['createdAt', order || 'DESC']],
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
      include: [
        {
          model: Client,
          as: 'currentClient',
          required: false,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Agency,
          as: 'currentAgency',
          required: false,
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Wallet,
          required: false,
          attributes: ['id', 'agencyId', 'clientId'],
          as: 'fromWallet',
          include: [
            {
              model: Agency,
              required: false,
              attributes: ['id', 'name', 'email', 'address', 'countryCode'],
              as: 'agency'
            },
            {
              model: Client,
              required: false,
              attributes: ['id', 'firstName', 'lastName', 'email'],
              as: 'client'
            }
          ]
        },
        {
          model: Wallet,
          required: false,
          attributes: ['id', 'agencyId', 'clientId'],
          as: 'toWallet',
          include: [
            {
              model: Agency,
              required: false,
              attributes: ['id', 'name', 'email'],
              as: 'agency'
            },
            {
              model: Client,
              required: false,
              attributes: ['id', 'firstName', 'lastName', 'email'],
              as: 'client'
            }
          ]
        }
      ],
      limit,
      offset
    };

    const transactions = await Transactions.findAndCountAll(query);

    // Process the results to include only relevant wallet information
    const processedData = transactions.rows.map((transaction) => {
      const processed = transaction.toJSON();

      // Process fromWallet
      if (processed.fromWallet) {
        if (processed.fromWallet.agencyId && !processed.fromWallet.clientId) {
          delete processed.fromWallet.client;
        } else {
          delete processed.fromWallet.agency;
        }
      }

      // Process toWallet
      if (processed.toWallet) {
        if (processed.toWallet.agencyId && !processed.toWallet.clientId) {
          delete processed.toWallet.client;
        } else {
          delete processed.toWallet.agency;
        }
      }

      return processed;
    });

    const { totalCount, totalPages, currentPage } = getPagingData(transactions, page, limit);

    return sendSuccessResponse(res, 'fetched successfully.', {
      rows: processedData,
      totalCount,
      totalPages,
      currentPage
    });
  } catch (err) {
    return sendFailResponse(res, err, 500);
  }
};

exports.transactionDetailById = async (req, res) => {
  const { id } = req.params;
  try {
    const transactionDetail = await Transactions.findOne({
      where: { id: id },
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
      include: [
        {
          model: Client,
          as: 'currentClient',
          required: false,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'gender']
        },
        {
          model: Agency,
          as: 'currentAgency',
          required: false,
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Wallet,
          required: false,
          attributes: ['id', 'agencyId', 'clientId'],
          as: 'fromWallet',
          include: [
            {
              model: Agency,
              required: false,
              attributes: ['id', 'name', 'email', 'phone', 'address', 'countryCode'],
              as: 'agency'
            },
            {
              model: Client,
              required: false,
              attributes: [
                'id',
                'firstName',
                'lastName',
                'email',
                'gender',
                'phone',
                'countryId',
                'stateId',
                'cityId',
                'address',
                'countryCode'
              ],
              include: [
                {
                  model: State,
                  attributes: ['id', 'name'],
                  required: false,
                  as: 'state',
                  include: [
                    {
                      model: CountryCodes,
                      attributes: ['id', 'name'],
                      as: 'country'
                    }
                  ]
                }
              ],
              as: 'client'
            }
          ]
        },
        {
          model: Wallet,
          required: false,
          attributes: ['id', 'agencyId', 'clientId'],
          as: 'toWallet',
          include: [
            {
              model: Agency,
              required: false,
              attributes: ['id', 'name', 'email', 'phone'],
              as: 'agency'
            },
            {
              model: Client,
              required: false,
              attributes: [
                'id',
                'firstName',
                'lastName',
                'email',
                'gender',
                'phone',
                'countryId',
                'stateId',
                'cityId',
                'address',
                'countryCode'
              ],
              include: [
                {
                  model: State,
                  attributes: ['id', 'name'],
                  required: false,
                  as: 'state',
                  include: [
                    {
                      model: CountryCodes,
                      attributes: ['id', 'name'],
                      as: 'country'
                    }
                  ]
                }
              ],
              as: 'client'
            }
          ]
        }
      ]
    });

    if (!transactionDetail) {
      return sendFailResponse(res, 'No record found', 400);
    }

    // Process the result to include only relevant wallet information
    const processedDetail = transactionDetail.toJSON();

    // Process fromWallet
    if (processedDetail.fromWallet) {
      if (processedDetail.fromWallet.agencyId && !processedDetail.fromWallet.clientId) {
        delete processedDetail.fromWallet.client;
      } else {
        delete processedDetail.fromWallet.agency;
      }
    }

    // Process toWallet
    if (processedDetail.toWallet) {
      if (processedDetail.toWallet.agencyId && !processedDetail.toWallet.clientId) {
        delete processedDetail.toWallet.client;
      } else {
        delete processedDetail.toWallet.agency;
      }
    }

    return sendSuccessResponse(res, 'Transaction record found', processedDetail);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};
