const CashTransaction = require('../../models').cash_transactions;
const { Op } = require('sequelize');
const ejs = require('ejs');
const path = require('path');
const moment = require('moment');
const { sequelize } = require('../../models');
const { generateRandomCode } = require('../../services/common');
const sendEmail = require('../../services/email');
const { getPagination, getPagingData } = require('../../services/pagination');
const { sendFailResponse, sendSuccessResponse } = require('../../services/response');
const CountryCodes = require('../../models').country_codes;
const State = require('../../models').states;
const City = require('../../models').cities;
const Client = require('../../models').clients;
const Agency = require('../../models').agencies;
const Wallet = require('../../models').wallets;
const Transaction = require('../../models').transactions;
const { internallyClientRegistration } = require('../client/auth');
exports.sendMoneyFromUnRegisteredClientToUnregisteredClient = async (req, res) => {
  try {
    const { amount, note, senderDetails, receiverDetails, pickupDetails } = req.body;
    const uniqueCode = generateRandomCode(8);

    const pickupCountry = await CountryCodes.findOne({
      where: { id: pickupDetails.countryId }
    });
    if (!pickupCountry) {
      return sendFailResponse(res, 'Pickup country not found', 404);
    }
    const pickupState = await State.findOne({
      where: { id: pickupDetails.stateId }
    });
    if (!pickupState) {
      return sendFailResponse(res, 'Pickup state not found', 404);
    }
    const pickupCity = await City.findOne({
      where: { id: pickupDetails.cityId }
    });
    if (!pickupCity) {
      return sendFailResponse(res, 'Pickup city not found', 404);
    }

    const cashTransaction = await CashTransaction.create({
      amount,
      note,
      type: '3',
      status: '2',
      sentByRegisteredClient: false,
      unRegisteredClientDetails: receiverDetails,
      unRegisteredSenderClientDetails: senderDetails,
      pickupDetails,
      uniqueCode,
      createdById: req.user.id,
      createdByType: '2'
    });
    let emailObj = {
      subject: 'Need to pickup cash',
      html: `You need to pickup cash from respected ${pickupDetails.type} at ${pickupDetails.address}, ${pickupCity.name}, ${pickupState.name}, ${pickupCountry.name} with id is ${cashTransaction.id} security code ${uniqueCode}.`
    };
    let sendMail = await sendEmail(req, emailObj, receiverDetails.email);
    if (!sendMail) {
      return sendFailResponse(res, 'Email not sent. Please try again.', 400);
    }

    return sendSuccessResponse(res, 'cash transaction created successfully.', cashTransaction);
  } catch (error) {
    return sendFailResponse(res, error.message, 500);
  }
};

exports.sendMoneyFromRegisteredClientToUnregisteredClient = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    if (req.user.role.role !== 'associate') {
      return sendFailResponse(res, 'You are not authorized to perform this action', 403);
    }
    const { amount, note, senderClientId, receiverDetails, pickupDetails } = req.body;
    if (senderClientId === req.user.id) {
      return sendFailResponse(res, 'You cannot send money to yourself', 400);
    }
    const sender = await Client.findOne({
      where: { id: senderClientId, isSuspend: '0', isDeleted: '0' },
      transaction
    });
    if (!sender) {
      await transaction.rollback();
      return sendFailResponse(res, 'Sender client not found', 404);
    }
    const pickupCountry = await CountryCodes.findOne({
      where: { id: pickupDetails.countryId },
      transaction
    });
    if (!pickupCountry) {
      await transaction.rollback();
      return sendFailResponse(res, 'Pickup country not found', 404);
    }
    const pickupState = await State.findOne({
      where: { id: pickupDetails.stateId },
      transaction
    });
    if (!pickupState) {
      await transaction.rollback();
      return sendFailResponse(res, 'Pickup state not found', 404);
    }
    const pickupCity = await City.findOne({
      where: { id: pickupDetails.cityId },
      transaction
    });
    if (!pickupCity) {
      await transaction.rollback();
      return sendFailResponse(res, 'Pickup city not found', 404);
    }
    const uniqueCode = generateRandomCode(8);
    // const fromWallet = await Wallet.findOne({
    //   where: { clientId: senderClientId, isActive: true },
    //   transaction
    // });
    // if (!fromWallet) {
    //   await transaction.rollback();
    //   return sendFailResponse(res, 'Sender Wallet not found', 404);
    // }
    // if (fromWallet.amount < amount) {
    //   await transaction.rollback();
    //   return sendFailResponse(res, 'Insufficient Balance', 400);
    // }
    // fromWallet.amount = fromWallet.amount - amount;
    // await fromWallet.save({ transaction });

    // await Transactions.create({
    //   amount,
    //   type: '1',
    //   status: '2',
    //   senderClientId,
    //   receiverClientId: null,
    //   createdById: req.user.id,
    //   createdByType: '2'
    // });

    const cashTransaction = await CashTransaction.create(
      {
        amount,
        note,
        type: '1',
        status: '2',
        sentByRegisteredClient: true,
        senderClientId,
        unRegisteredClientDetails: receiverDetails,
        pickupDetails,
        uniqueCode,
        createdById: req.user.id,
        createdByType: '2'
      },
      { transaction }
    );
    let emailObj = {
      subject: 'Need to pickup cash',
      html: `You need to pickup cash from respected ${pickupDetails.type} at ${pickupDetails.address}, ${pickupCity.name}, ${pickupState.name}, ${pickupCountry.name} with id is ${cashTransaction.id} security code ${uniqueCode}.`
    };
    let sendMail = await sendEmail(req, emailObj, receiverDetails.email);
    if (!sendMail) {
      await transaction.rollback();
      return sendFailResponse(res, 'Email not sent. Please try again.', 400);
    }

    await transaction.commit();
    return sendSuccessResponse(res, 'cash transaction created successfully.', cashTransaction);
  } catch (error) {
    await transaction.rollback();
    return sendFailResponse(res, error.message, 500);
  }
};

exports.sendMoneyFromRegisteredClientToRegisteredClientOnline = async (req, res) => {
  try {
    const { amount, note, senderClientId, receiverClientId } = req.body;
    if (senderClientId === receiverClientId) {
      return sendFailResponse(res, 'Sender and receiver client cannot be the same', 400);
    }
    // if (senderClientId === req.user.id) {
    //   return sendFailResponse(res, 'You cannot send money to yourself', 400);
    // }
    if (receiverClientId === req.user.id) {
      return sendFailResponse(res, 'You cannot receive money from yourself', 400);
    }

    const sender = await Client.findOne({
      where: { id: senderClientId }
    });
    if (!sender) {
      return sendFailResponse(res, 'Sender client not found', 404);
    }
    const receiver = await Client.findOne({
      where: { id: receiverClientId, isSuspend: '0', isDeleted: '0' }
    });
    if (!receiver) {
      return sendFailResponse(res, 'Receiver client not found', 404);
    }
    const fromWallet = await Wallet.findOne({
      where: { clientId: senderClientId }
    });
    if (!fromWallet) {
      return sendFailResponse(res, 'Sender wallet not found', 404);
    }
    if (fromWallet.amount < amount) {
      return sendFailResponse(res, 'Sender wallet has insufficiant balane', 404);
    }
    const toWallet = await Wallet.findOne({
      where: { clientId: receiverClientId }
    });
    if (!toWallet) {
      return sendFailResponse(res, 'Receiver wallet not found', 404);
    }
    const uniqueCode = generateRandomCode(8);

    const cashTransaction = await CashTransaction.create({
      amount,
      note,
      type: '4',
      status: '1',
      sentByRegisteredClient: true,
      senderClientId,
      receiverClientId,
      receiverClientIsRegistered: true,
      createdByType: '2',
      createdById: req.user.id,
      uniqueCode
    });

    await Transaction.create({
      amount,
      type: '3',
      status: '1',
      isDeducted: false,
      isCashTransaction: true,
      clientId: receiverClientId,
      cashTransactionBy: 'associateClient',
      cashTransactionByClientId: req.user.id,
      fromWalletId: fromWallet.id,
      toWalletId: toWallet.id
    });
    await Transaction.create({
      amount,
      type: '2',
      status: '1',
      isDeducted: true,
      isCashTransaction: false,
      clientId: senderClientId,
      cashTransactionBy: 'associateClient',
      cashTransactionByClientId: req.user.id,
      fromWalletId: fromWallet.id,
      toWalletId: toWallet.id
    });

    fromWallet.amount = fromWallet.amount - amount;
    toWallet.amount = toWallet.amount + amount;
    await fromWallet.save();
    await toWallet.save();

    return sendSuccessResponse(res, 'cash transaction created successfully.', cashTransaction);
  } catch (error) {
    return sendFailResponse(res, error.message, 500);
  }
};

exports.sendMoneyFromRegisteredClientToRegisteredClientOffline = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    if (req.user.role.role !== 'associate') {
      return sendFailResponse(res, 'You are not authorized to perform this action', 403);
    }

    const { amount, note, senderClientId, receiverClientId, pickupDetails } = req.body;

    if (senderClientId === receiverClientId) {
      return sendFailResponse(res, 'Sender and receiver client cannot be the same', 400);
    }
    if (senderClientId === req.user.id) {
      return sendFailResponse(res, 'You cannot send money to yourself', 400);
    }
    if (receiverClientId === req.user.id) {
      return sendFailResponse(res, 'You cannot receive money from yourself', 400);
    }
    const sender = await Client.findOne({
      where: { id: senderClientId, isSuspend: '0', isDeleted: '0' },
      transaction
    });
    if (!sender) {
      await transaction.rollback();
      return sendFailResponse(res, 'Sender client not found', 404);
    }
    const receiver = await Client.findOne({
      where: { id: receiverClientId, isSuspend: '0', isDeleted: '0' },
      transaction
    });
    if (!receiver) {
      await transaction.rollback();
      return sendFailResponse(res, 'Receiver client not found', 404);
    }
    const pickupCountry = await CountryCodes.findOne({
      where: { id: pickupDetails.countryId },
      transaction
    });
    if (!pickupCountry) {
      await transaction.rollback();
      return sendFailResponse(res, 'Pickup country not found', 404);
    }
    const pickupState = await State.findOne({
      where: { id: pickupDetails.stateId },
      transaction
    });
    if (!pickupState) {
      await transaction.rollback();
      return sendFailResponse(res, 'Pickup state not found', 404);
    }
    const pickupCity = await City.findOne({
      where: { id: pickupDetails.cityId },
      transaction
    });
    if (!pickupCity) {
      await transaction.rollback();
      return sendFailResponse(res, 'Pickup city not found', 404);
    }
    const uniqueCode = generateRandomCode(8);

    const cashTransaction = await CashTransaction.create(
      {
        amount,
        note,
        type: '5',
        status: '2',
        sentByRegisteredClient: true,
        senderClientId,
        receiverClientId,
        receiverClientIsRegistered: true,
        pickupDetails,
        uniqueCode,
        createdById: req.user.id,
        createdByType: '2'
      },
      { transaction }
    );
    let emailObj = {
      subject: 'Need to pickup cash',
      html: `You need to pickup cash from respected ${pickupDetails.type} at ${pickupDetails.address}, ${pickupCity.name}, ${pickupState.name}, ${pickupCountry.name} with id is ${cashTransaction.id} security code ${uniqueCode}.`
    };
    let sendMail = await sendEmail(req, emailObj, receiver.email);
    if (!sendMail) {
      await transaction.rollback();
      return sendFailResponse(res, 'Email not sent. Please try again.', 400);
    }

    await transaction.commit();
    return sendSuccessResponse(res, 'cash transaction created successfully.', cashTransaction);
  } catch (error) {
    await transaction.rollback();
    return sendFailResponse(res, error.message, 500);
  }
};
exports.clientTransaction = async (req, res) => {
  try {
    let {
      amount,
      note,
      senderClientId,
      receiverClientId,
      senderDetails,
      receiverDetails,
      isSenderAgency,
      isReceiverAgency
    } = req.body;

    //#region Validation
    if (!senderClientId && !senderDetails) {
      return sendFailResponse(res, 'Sender Id or sender details required', 400);
    }
    if (senderClientId && senderDetails) {
      return sendFailResponse(res, 'Either Sender Id or sender details required', 400);
    }
    if (!receiverClientId && !receiverDetails) {
      return sendFailResponse(res, 'Receiver Id or receiver details required', 400);
    }
    if (receiverClientId && receiverDetails) {
      return sendFailResponse(res, 'Either Receiver Id or receiver details required', 400);
    }
    //#endregion

    let isSenderRegistered = true;
    let isReceiverRegistered = true;
    if (senderDetails && receiverDetails) {
      if (senderDetails.email == receiverDetails.email) {
        return res.status(400).send({ message: 'Sender and receiver email can not be same' });
      }
    }
    if (!senderClientId && senderDetails) {
      const myWallet = await Wallet.findOne({
        where: { clientId: req.user.id }
      });
      const myWalletAmount = myWallet.amount;
      if (myWalletAmount < amount) {
        return res.send({
          message: 'Your wallet has insufficiant balance'
        });
      }
      isSenderRegistered = false;
      senderDetails.isSender = true;
      senderDetails.amount = amount;
      const newSenderClientDetails = await internallyClientRegistration(senderDetails, res);
      senderDetails.isSender = false;
      senderClientId = newSenderClientDetails.id;
      myWallet.amount = myWallet.amount - amount;
      const toWallet = await Wallet.findOne({
        where: { clientId: senderClientId }
      });
      const uniqueCode = await generateRandomCode(8);
      const transactionData = {
        amount,
        type: '2',
        status: '1',
        note: note,
        isDeducted: true,
        isCashTransaction: false,
        isRegisteredClient: true,
        clientId: req.user.id,
        cashTransactionBy: 'associateClient',
        cashTransactionByClientId: req.user.id,
        fromWalletId: myWallet.id,
        toWalletId: toWallet.id,
        uniqueCode: uniqueCode
      };
      const transactionResponse = await Transaction.create(transactionData);
      await myWallet.save();
    }
    if (!receiverClientId && receiverDetails) {
      isReceiverRegistered = false;
      if (!receiverClientId && receiverDetails) {
        const newReceiverClientDetails = await internallyClientRegistration(receiverDetails, res);
        receiverClientId = newReceiverClientDetails.id;
      }
    }
    if (senderClientId === receiverClientId) {
      return sendFailResponse(res, 'Sender and receiver client cannot be the same', 400);
    }
    // if (senderClientId === req.user.id) {
    //   return sendFailResponse(res, 'You cannot send money to yourself', 400);
    // }
    if (receiverClientId === req.user.id) {
      return sendFailResponse(res, 'You cannot receive money from yourself', 400);
    }

    const sender = await Client.findOne({
      where: { id: senderClientId }
    });
    if (!sender) {
      return sendFailResponse(res, 'Sender client not found', 404);
    }
    const receiver = await Client.findOne({
      where: { id: receiverClientId, isSuspend: '0', isDeleted: '0' }
    });
    if (!receiver) {
      return sendFailResponse(res, 'Receiver client not found', 404);
    }
    const fromWallet = await Wallet.findOne({
      where: { clientId: senderClientId }
    });
    if (!fromWallet) {
      return sendFailResponse(res, 'Sender wallet not found', 404);
    }
    if (fromWallet.amount < amount) {
      return sendFailResponse(res, 'Sender wallet has insufficiant balane', 404);
    }
    const toWallet = await Wallet.findOne({
      where: { clientId: receiverClientId }
    });
    if (!toWallet) {
      return sendFailResponse(res, 'Receiver wallet not found', 404);
    }
    const uniqueCode = await generateRandomCode(8);
    const transactionData = {
      amount,
      type: '2',
      status: isReceiverRegistered ? '1' : '2',
      note: note,
      isDeducted: true,
      isCashTransaction: false,
      isRegisteredClient: isSenderRegistered,
      unregisteredClientDetails: senderDetails,
      clientId: senderClientId,
      cashTransactionBy: 'associateClient',
      cashTransactionByClientId: req.user.id,
      fromWalletId: fromWallet.id,
      toWalletId: toWallet.id,
      documentTypeId:
        receiverDetails && receiverDetails.documentTypeId ? receiverDetails.documentTypeId : null,
      documentNumber:
        receiverDetails && receiverDetails.documentNumber ? receiverDetails.documentNumber : null,
      uniqueCode: uniqueCode
    };
    const transactionResponse = await Transaction.create(transactionData);

    fromWallet.amount = fromWallet.amount - amount;
    if (isReceiverRegistered) {
      toWallet.amount = toWallet.amount + amount;
      //#region send mail to sender
      const emailBody = await ejs.renderFile(
        path.join(__dirname, '../../templates/money-transfer.ejs'),
        {
          userName: senderDetails?.firstName,
          recipientName: senderDetails?.firstName,
          transferAmount: amount,
          currency: '$',
          supportLink: '#',
          termsLink: '#',
          appName: 'DUAL MONEY',
          transferDate: new Date().toISOString().substring(0, 10),
          emailSignature: 'DUAL MONEY',
          transactionId: uniqueCode
          // appLogo: config.appLogoWhite
        }
      );
      let emailObj = {
        subject: 'Your Money Transfer was Completed',
        html: emailBody
      };
      await sendEmail(req, emailObj, sender.email);
      //#endregion

      //#region send mail to Receiver
      const receiveremailBody = await ejs.renderFile(
        path.join(__dirname, '../../templates/money-receive.ejs'),
        {
          recipientName: receiver?.firstName,
          receivedAmount: amount,
          currency: '$',
          senderName: sender?.firstName,
          appName: 'DUAL MONEY',
          transferDate: new Date().toISOString().substring(0, 10),
          emailSignature: 'DUAL MONEY',
          transactionId: uniqueCode,
          helpCenterUrl: '#'
          // appLogo: config.appLogoWhite
        }
      );
      let receiverEmailObj = {
        subject: 'You have Received Money',
        html: receiveremailBody
      };
      await sendEmail(req, receiverEmailObj, receiver.email);
      //#endregion
    } else {
      toWallet.pendingAmount = toWallet.pendingAmount + amount;
      const receiveremailBody = await ejs.renderFile(
        path.join(__dirname, '../../templates/money-receive-code.ejs'),
        {
          recipientName: receiver?.firstName,
          uniqueCode: uniqueCode,
          receivedAmount: amount,
          currency: '$',
          senderName: sender?.firstName,
          appName: 'DUAL MONEY',
          transferDate: new Date().toISOString().substring(0, 10),
          emailSignature: 'DUAL MONEY',
          transactionId: uniqueCode
          // appLogo: config.appLogoWhite
        }
      );
      let receiverEmailObj = {
        subject: 'You have Received Money',
        html: receiveremailBody
      };
      await sendEmail(req, receiverEmailObj, receiver.email);
    }
    await fromWallet.save();
    await toWallet.save();

    return sendSuccessResponse(res, 'Transaction created successfully.', transactionResponse);
  } catch (error) {
    return sendFailResponse(res, error.message, 500);
  }
};
exports.transactionsForAssociate = async (req, res) => {
  try {
    const { page, size, order, search, cityId, status, date, type } = req.query;
    const { limit, offset } = getPagination(page, size);
    const query = {
      where: {
        // createdByType: '2',
        // createdById: req.user.id
      },
      order: [['createdAt', order]],
      attributes: {
        include: [
          [
            sequelize.literal(`
              CASE
                WHEN type = '1' THEN 'takeCash'
                WHEN type = '2' THEN 'registeredClientToUnregisteredClient'
                WHEN type = '3' THEN 'unregisteredClientToUnregisteredClient'
                WHEN type = '4' THEN 'registeredClientToRegisteredClientOnline'
                WHEN type = '5' THEN 'registeredClientToRegisteredClientOffline'
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
          required: false,
          as: 'senderClient',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Client,
          required: false,
          as: 'senderAssociate',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          on: sequelize.literal('cash_transactions.created_by_id = senderAssociate.id')
        },
        {
          model: Client,
          required: false,
          as: 'receiverAssociate',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          on: sequelize.literal('cash_transactions.associate_id = receiverAssociate.id')
        },
        {
          model: Agency,
          required: false,
          as: 'receiverAgency',
          attributes: ['id', 'name']
        }
      ],
      limit,
      offset
    };
    if (type === 'all') {
      query.where[Op.or] = [
        { createdByType: '2', createdById: req.user.id },
        { associateId: req.user.id }
      ];
    } else if (type === 'sent') {
      query.where.createdByType = '2';
      query.where.createdById = req.user.id;
    } else if (type === 'received') {
      query.where.associateId = req.user.id;
    }
    if (search) {
      query.where[Op.or] = [
        { '$senderClient.first_name$': { [Op.like]: `%${search}%` } },
        { '$senderClient.last_name$': { [Op.like]: `%${search}%` } },
        { '$senderClient.email$': { [Op.like]: `%${search}%` } },
        { '$receiverAssociate.first_name$': { [Op.like]: `%${search}%` } },
        { '$receiverAssociate.last_name$': { [Op.like]: `%${search}%` } },
        { '$receiverAssociate.email$': { [Op.like]: `%${search}%` } },
        { '$receiverAgency.name$': { [Op.like]: `%${search}%` } },
        { '$receiverAgency.email$': { [Op.like]: `%${search}%` } }
      ];
    }
    if (cityId) {
      query.where = {
        ...query.where,
        [Op.and]: [
          sequelize.where(
            sequelize.literal(`JSON_EXTRACT(pickup_details, '$.cityId')`),
            Number(cityId)
          )
        ]
      };
    }

    if (status) {
      if (status === 'failed') {
        query.where.status = '0';
      } else if (status === 'completed') {
        query.where.status = '1';
      } else if (status === 'pending') {
        query.where.status = '2';
      }
    }
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.where.createdAt = { [Op.between]: [startDate, endDate] };
    }
    const transactions = await CashTransaction.findAndCountAll(query);
    const { data, totalCount, totalPages, currentPage } = getPagingData(transactions, page, limit);
    return sendSuccessResponse(res, 'Transactions fetched successfully.', {
      rows: data,
      totalCount,
      totalPages,
      currentPage
    });
  } catch (error) {
    return sendFailResponse(res, error.message, 500);
  }
};

exports.verifyCashTransaction = async (req, res) => {
  try {
    if (req.user.role.role !== 'associate') {
      return sendFailResponse(res, 'You are not authorized to perform this action', 403);
    }
    const { id, uniqueCode } = req.body;
    const cashTransaction = await CashTransaction.findOne({
      where: { id, uniqueCode }
    });
    if (!cashTransaction) {
      return sendFailResponse(res, 'Cash transaction not found', 404);
    }
    if (cashTransaction.status === '1') {
      return sendFailResponse(res, 'Cash transaction is already verified', 400);
    }
    if (cashTransaction.status === '0') {
      return sendFailResponse(res, 'Cash transaction is failed', 400);
    }
    cashTransaction.status = '1';
    cashTransaction.associateId = req.user.id;
    await cashTransaction.save();

    return sendSuccessResponse(res, 'Cash transaction verified successfully.', cashTransaction);
  } catch (error) {
    return sendFailResponse(res, error.message, 500);
  }
};

exports.rechargeClientWallet = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    if (req.user.role.role !== 'associate') {
      return sendFailResponse(res, 'You are not authorized to perform this action', 403);
    }
    const { amount, note, clientId } = req.body;
    if (clientId === req.user.id) {
      return sendFailResponse(res, 'You cannot recharge your own wallet', 400);
    }
    const client = await Client.findOne({
      where: { id: clientId, isSuspend: '0', isDeleted: '0' },
      transaction
    });
    if (!client) {
      await transaction.rollback();
      return sendFailResponse(res, 'Client not found', 404);
    }

    const associateClientWallet = await Wallet.findOne({
      where: { clientId: req.user.id },
      transaction
    });
    if (!associateClientWallet) {
      await transaction.rollback();
      return sendFailResponse(res, 'Associate client wallet not found', 404);
    }
    if (associateClientWallet.amount < amount) {
      await transaction.rollback();
      return sendFailResponse(res, 'Insufficient balance', 400);
    }
    associateClientWallet.amount = associateClientWallet.amount - amount;
    await associateClientWallet.save({ transaction });
    const wallet = await Wallet.findOne({ where: { clientId }, transaction });
    if (!wallet) {
      await transaction.rollback();
      return sendFailResponse(res, 'Wallet not found', 404);
    }
    wallet.amount = wallet.amount + amount;
    await wallet.save({ transaction });
    await Transaction.create(
      {
        amount,
        type: '5',
        status: '1',
        isDeducted: false,
        clientId,
        note,
        cashTransactionBy: 'associateClient',
        cashTransactionByClientId: req.user.id
      },
      { transaction }
    );

    await CashTransaction.create(
      {
        amount,
        type: '6',
        status: '1',
        createdByType: '2',
        uniqueCode: generateRandomCode(8),
        sentByRegisteredClient: true,
        senderClientId: req.user.id,
        createdById: req.user.id,
        receiverClientId: clientId,
        receiverClientIsRegistered: true
      },
      { transaction }
    );

    await transaction.commit();
    return sendSuccessResponse(res, 'Wallet recharged successfully.', wallet);
  } catch (error) {
    await transaction.rollback();
    return sendFailResponse(res, error.message, 500);
  }
};
