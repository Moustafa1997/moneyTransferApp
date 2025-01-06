const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../../services/pagination');
const { sendFailResponse, sendSuccessResponse } = require('../../services/response');
const { sequelize } = require('../../models');
const { generateRandomCode } = require('../../services/common');
const sendEmail = require('../../services/email');

const Wallet = require('../../models').wallets;
const Transactions = require('../../models').transactions;
const Client = require('../../models').clients;
const Agency = require('../../models').agencies;
const Role = require('../../models').roles;
const CashTransaction = require('../../models').cash_transactions;
const CountryCodes = require('../../models').country_codes;
const State = require('../../models').states;
const City = require('../../models').cities;

exports.addToWalletFromBank = async (req, res) => {
  try {
    const user = req.user;
    const { amount, note } = req.body;
    if (![6, 7].includes(user.roleId)) {
      return sendFailResponse(
        res,
        'Only Associate or Normal Client can perform this operation',
        400
      );
    }
    let wallet;

    wallet = await Wallet.findOne({ where: { clientId: user.id, isActive: true } });
    if (!wallet) {
      return sendFailResponse(res, 'Wallet not found', 404);
    }

    wallet.amount = wallet.amount + amount;
    await wallet.save();
    await Transactions.create({
      clientId: user.id,
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
    if (![6, 7].includes(user.roleId)) {
      return sendFailResponse(
        res,
        'Only Associate or Normal Client can perform this operation',
        400
      );
    }
    wallet = await Wallet.findOne({ where: { clientId: user.id, isActive: true } });
    if (!wallet) {
      return sendFailResponse(res, 'Wallet not found', 404);
    }
    if (wallet.amount < amount) {
      return sendFailResponse(res, 'Insufficient Balance', 400);
    }

    wallet.amount = wallet.amount - amount;
    await wallet.save();
    await Transactions.create({
      clientId: user.id,
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

exports.sendMoney = async (req, res) => {
  try {
    const currentUser = req.user;
    const { amount, receiverId, note } = req.body;
    if (receiverId === currentUser.id) {
      return sendFailResponse(res, "Can't send to the same account.", 400);
    }

    const receiver = await Client.findOne({
      where: { id: receiverId, isDeleted: '0', isSuspend: '0', isEmailVerified: '1' }
    });
    if (!receiver) {
      return sendFailResponse(res, 'Receiver not found', 404);
    }

    const result = await sequelize.transaction(async (t) => {
      const fromWallet = await Wallet.findOne({
        where: { clientId: currentUser.id, isActive: true },
        transaction: t,
        lock: t.LOCK.UPDATE
      });
      if (!fromWallet) {
        throw new Error('Sender Wallet not found');
      }

      const toWallet = await Wallet.findOne({
        where: { clientId: receiverId, isActive: true },
        transaction: t,
        lock: t.LOCK.UPDATE
      });
      if (!toWallet) {
        throw new Error('Receiver Wallet not found');
      }

      if (fromWallet.amount < amount) {
        throw new Error('Insufficient Balance');
      }

      fromWallet.amount = fromWallet.amount - amount;
      await fromWallet.save({ transaction: t });

      toWallet.amount = toWallet.amount + amount;
      await toWallet.save({ transaction: t });

      await Transactions.create(
        {
          clientId: currentUser.id,
          amount,
          type: '2',
          status: '1',
          isDeducted: true,
          note: note ?? undefined,
          fromWalletId: fromWallet.id,
          toWalletId: toWallet.id
        },
        { transaction: t }
      );

      await Transactions.create(
        {
          clientId: receiverId,
          amount,
          type: '3',
          status: '1',
          isDeducted: false,
          note: note ?? undefined,
          fromWalletId: fromWallet.id,
          toWalletId: toWallet.id
        },
        { transaction: t }
      );

      return fromWallet;
    });
    return sendSuccessResponse(res, 'sent successfully.', result);
  } catch (err) {
    if (err.message === 'Sender Wallet not found' || err.message === 'Receiver Wallet not found') {
      return sendFailResponse(res, err.message, 404);
    }
    if (err.message === 'Insufficient Balance') {
      return sendFailResponse(res, err.message, 400);
    }
    return sendFailResponse(res, err.message, 500);
  }
};

exports.getMyWalletDetails = async (req, res) => {
  try {
    const user = req.user;

    const wallet = await Wallet.findOne({ where: { clientId: user.id, isActive: true } });
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

exports.getTransactions = async (req, res) => {
  try {
    const user = req.user;
    let { search, size, page, status, order } = req.query;
    const { limit, offset } = getPagination(page, size);
    const searchFilter = { clientId: user.id };
    if (search) {
      delete searchFilter.clientId;
      searchFilter[Op.or] = [
        { documentNumber: { [Op.eq]: search } }, // Exact match for documentNumber
        { uniqueCode: { [Op.eq]: search } } // Exact match for uniqueCode
      ];
    }
    if (status) {
      if (status === 'completed') {
        status = '1';
      } else if (status === 'failed') {
        status = '0';
      } else {
        status = '2';
      }
      searchFilter.status = status;
    }

    if (req.query.id) {
      searchFilter.id = req.query.id;
    }
    if (req.query.documentNumber) {
      searchFilter.documentNumber = req.query.documentNumber;
    }
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
          attributes: ['id'],
          as: 'fromWallet',
          include: {
            model: Client,
            required: false,
            attributes: ['id', 'firstName', 'lastName', 'email'],
            as: 'client'
          }
        },
        {
          model: Wallet,
          required: false,
          attributes: ['id'],
          as: 'toWallet',
          include: {
            model: Client,
            required: false,
            attributes: ['id', 'firstName', 'lastName', 'email'],
            as: 'client'
          }
        }
      ],
      limit,
      offset
    };
    // if (req.query.status) {
    //   const statusMap = { failed: '0', completed: '1', pending: '2' };
    //   if (statusMap[req.query.status]) {
    //     query.where.status = statusMap[req.query.status];
    //   }
    // }
    // if (req.query.type) {
    //   const statusMap = { sent: '3', received: '4' };
    //   if (statusMap[req.query.type]) {
    //     query.where.type = statusMap[req.query.type];
    //   }
    // }
    // if (search) {
    //   query.where[Op.or] = [
    //     { documentNumber: { [Op.like]: `%${search}%` } },
    //     { uniqueCode: { [Op.like]: `%${search}%` } }
    //   ];
    // }
    const transactions = await Transactions.findAndCountAll(query);

    const { data, totalCount, totalPages, currentPage } = getPagingData(transactions, page, limit);

    return sendSuccessResponse(res, 'fetched sucessfully.', {
      rows: data,
      totalCount,
      totalPages,
      currentPage
    });
  } catch (err) {
    console.log('err: ', err);
    return sendFailResponse(res, err.message, 500);
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
          attributes: ['id'],
          as: 'fromWallet',
          include: {
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
        },
        {
          model: Wallet,
          required: false,
          attributes: ['id'],
          as: 'toWallet',
          include: {
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
        }
      ]
    });
    if (!transactionDetail) {
      return sendFailResponse(res, 'No record found', 400);
    }
    return sendSuccessResponse(res, 'Transaction record found', transactionDetail);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};
exports.rechargeTransactions = async (req, res) => {
  try {
    const user = req.user;
    let { search, size, page, order, status } = req.query;
    if (status) {
      if (status === 'completed') {
        status = '1';
      } else if (status === 'failed') {
        status = '0';
      } else if (status === 'pending') {
        status = '2';
      } else if (status === 'all') {
        status = null;
      }
    }
    const { limit, offset } = getPagination(page, size);
    const query = {
      where: { clientId: user.id, type: { [Op.in]: ['0', '1', '5', '6'] } },
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
          ]
        ],
        exclude: ['fromWalletId', 'toWalletId']
      },
      limit,
      offset
    };
    if (status) {
      query.where.status = status;
    }
    search = Number(search);
    if (search && typeof search === 'number') {
      query.where.id = search;
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

exports.transferTransactions = async (req, res) => {
  try {
    const user = req.user;
    let { search, size, page, order, status, type } = req.query;
    if (status) {
      if (status === 'completed') {
        status = '1';
      } else if (status === 'failed') {
        status = '0';
      } else if (status === 'pending') {
        status = '2';
      } else if (status === 'all') {
        status = null;
      }
    }
    const { limit, offset } = getPagination(page, size);
    const query = {
      where: { clientId: user.id },
      order: [['createdAt', order]],
      attributes: {
        include: [
          [
            sequelize.literal(`
              CASE
              WHEN type = '2' THEN 'sent'
              WHEN type = '3' THEN 'received'
              WHEN type = '7' THEN 'sentToUnregisteredClient'
                ELSE type
              END
            `),
            'transactionType'
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
          model: Wallet,
          required: false,
          attributes: ['id'],
          as: 'fromWallet',
          include: {
            model: Client,
            required: false,
            attributes: ['id', 'firstName', 'lastName', 'email'],
            as: 'client',
            include: {
              model: Role,
              required: true,
              attributes: ['id', 'roleTitle', 'role'],
              as: 'role'
            }
          }
        },
        {
          model: Wallet,
          required: false,
          attributes: ['id'],
          as: 'toWallet',
          include: {
            model: Client,
            required: false,
            attributes: ['id', 'firstName', 'lastName', 'email'],
            as: 'client',
            include: {
              model: Role,
              required: true,
              attributes: ['id', 'roleTitle', 'role'],
              as: 'role'
            }
          }
        }
      ],
      offset,
      limit
    };
    if (status) {
      query.where.status = status;
    }
    if (type) {
      if (type === 'sent') {
        query.where.type = { [Op.in]: ['2', '7'] };
      } else if (type === 'received') {
        query.where.type = { [Op.in]: ['3'] };
      }
    } else {
      query.where.type = { [Op.in]: ['2', '3', '7'] };
    }
    search = Number(search);
    if (search && typeof search === 'number') {
      query.where.id = search;
    }
    const transactions = await Transactions.findAndCountAll(query);
    if (transactions.rows.length === 0)
      return res.status(200).send({ message: 'Empty result', data: transactions.rows });

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

exports.sendMoneyToUnregisteredClient = async (req, res) => {
  try {
    const user = req.user;
    const params = req.body;
    const fromWallet = await Wallet.findOne({
      where: { clientId: user.id, isActive: true }
    });
    if (!fromWallet) {
      return res.status(404).send({
        message: 'Sender Wallet not found'
      });
    }
    if (fromWallet.amount < params.amount) {
      return sendFailResponse(res, 'Insufficient Balance', 400);
    }
    const pickupCountry = await CountryCodes.findOne({
      where: { id: params.pickupDetails.countryId }
    });
    if (!pickupCountry) {
      return sendFailResponse(res, 'Pickup country not found', 404);
    }
    const pickupState = await State.findOne({
      where: { id: params.pickupDetails.stateId }
    });
    if (!pickupState) {
      return sendFailResponse(res, 'Pickup state not found', 404);
    }
    const pickupCity = await City.findOne({
      where: { id: params.pickupDetails.cityId }
    });
    if (!pickupCity) {
      return sendFailResponse(res, 'Pickup city not found', 404);
    }
    fromWallet.amount = fromWallet.amount - params.amount;
    await fromWallet.save();
    await Transactions.create({
      clientId: user.id,
      amount: params.amount,
      type: '2',
      status: '1',
      isDeducted: true,
      note: params.note ?? undefined,
      fromWalletId: fromWallet.id,
      isRegisteredClient: false,
      unregisteredClientDetails: params.unRegisteredClientDetails
    });
    const uniqueCode = generateRandomCode(8);
    const cashTransaction = await CashTransaction.create({
      senderClientId: user.id,
      createdById: user.id,
      createdByType: user.roleId === 6 ? '2' : '1',
      amount: params.amount,
      type: '2',
      status: '2',
      uniqueCode,
      sentByRegisteredClient: true,
      unRegisteredClientDetails: params.unRegisteredClientDetails,
      pickupDetails: params.pickupDetails,
      note: params.note ?? undefined
    });

    let emailObj = {
      subject: 'Need to pickup cash',
      html: `You need to pickup cash from respected ${params.pickupDetails.type} at ${params.pickupDetails.address}, ${pickupCity.name}, ${pickupState.name}, ${pickupCountry.name} with id is ${cashTransaction.id} security code ${uniqueCode}.`
    };
    let sendMail = await sendEmail(req, emailObj, params.unRegisteredClientDetails.email);
    if (!sendMail) return sendFailResponse(res, 'Email not sent. Please try again.', 400);

    return sendSuccessResponse(res, 'sent sucessfully.', fromWallet);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};
