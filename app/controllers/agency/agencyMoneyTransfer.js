const CashTransaction = require('../../models').cash_transactions;
const { sequelize } = require('../../models');
const { generateRandomCode } = require('../../services/common');
const sendEmail = require('../../services/email');
const { sendFailResponse, sendSuccessResponse } = require('../../services/response');
const CountryCodes = require('../../models').country_codes;
const State = require('../../models').states;
const City = require('../../models').cities;
const Client = require('../../models').clients;
const Agency = require('../../models').agencies;
const Wallet = require('../../models').wallets;
const Transaction = require('../../models').transactions;
const ejs = require('ejs');
const path = require('path');
const { internallyClientRegistration } = require('../client/auth');
exports.sendMoneyFromUnRegisteredClientToUnregisteredClient = async (req, res) => {
  try {
    if (req.user.role.role !== 'agency') {
      return sendFailResponse(res, 'You are not authorized to perform this action', 403);
    }
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
      createdByType: '3',
      receiverClientIsRegistered: false
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
    if (req.user.role.role !== 'agency') {
      return sendFailResponse(res, 'You are not authorized to perform this action', 403);
    }
    const { amount, note, senderClientId, receiverDetails, pickupDetails } = req.body;
    const sender = await Client.findOne({
      where: { id: senderClientId },
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
        receiverClientIsRegistered: true,
        createdByType: '3'
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
    if (req.user.role.role !== 'agency') {
      return sendFailResponse(res, 'You are not authorized to perform this action', 403);
    }
    const { amount, note, senderClientId, receiverClientId } = req.body;
    const sender = await Client.findOne({
      where: { id: senderClientId }
    });
    if (!sender) {
      return sendFailResponse(res, 'Sender client not found', 404);
    }
    const receiver = await Client.findOne({
      where: { id: receiverClientId }
    });
    if (!receiver) {
      return sendFailResponse(res, 'Receiver client not found', 404);
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
      createdByType: '3',
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
      cashTransactionBy: 'agency',
      cashTransactionByClientId: req.user.id
    });

    toWallet.amount = toWallet.amount + amount;
    await toWallet.save();

    return sendSuccessResponse(res, 'cash transaction created successfully.', cashTransaction);
  } catch (error) {
    return sendFailResponse(res, error.message, 500);
  }
};

exports.sendMoneyFromRegisteredClientToRegisteredClientOffline = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    if (req.user.role.role !== 'agency') {
      return sendFailResponse(res, 'You are not authorized to perform this action', 403);
    }
    const { amount, note, senderClientId, receiverClientId, pickupDetails } = req.body;
    const sender = await Client.findOne({
      where: { id: senderClientId },
      transaction
    });
    if (!sender) {
      await transaction.rollback();
      return sendFailResponse(res, 'Sender client not found', 404);
    }
    const receiver = await Client.findOne({
      where: { id: receiverClientId },
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
        createdByType: '3'
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
exports.agencyTransaction = async (req, res) => {
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

    // Handle sender wallet check based on agency flag
    if (!senderClientId && senderDetails) {
      const myWallet = await Wallet.findOne({
        where: { agencyId: req.user.id }
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
      await myWallet.save();
    }

    if (!receiverClientId && receiverDetails) {
      isReceiverRegistered = false;
      const newReceiverClientDetails = await internallyClientRegistration(receiverDetails, res);
      receiverClientId = newReceiverClientDetails.id;
    }

    if (senderClientId === receiverClientId) {
      return sendFailResponse(res, 'Sender and receiver client cannot be the same', 400);
    }

    if (receiverClientId === req.user.id) {
      return sendFailResponse(res, 'You cannot receive money from yourself', 400);
    }

    // Find sender based on isSenderAgency flag
    let sender = null;
    if (isSenderAgency) {
      sender = await Agency.findOne({
        where: { id: senderClientId }
      });
      if (!sender) {
        return sendFailResponse(res, 'Sender agency not found', 404);
      }
    } else {
      sender = await Client.findOne({
        where: { id: senderClientId }
      });
      if (!sender) {
        return sendFailResponse(res, 'Sender client not found', 404);
      }
    }

    // Find receiver
    let receiver = null;
    if (isReceiverAgency) {
      receiver = await Agency.findOne({
        where: { id: receiverClientId, isSuspend: '0', isDeleted: '0' }
      });
      if (!receiver) {
        return sendFailResponse(res, 'Receiver agency not found', 404);
      }
    } else {
      receiver = await Client.findOne({
        where: { id: receiverClientId, isSuspend: '0', isDeleted: '0' }
      });
      if (!receiver) {
        return sendFailResponse(res, 'Receiver client not found', 404);
      }
    }

    // Find sender wallet based on isSenderAgency flag
    let fromWallet = await Wallet.findOne({
      where: isSenderAgency ? { agencyId: senderClientId } : { clientId: senderClientId }
    });
    if (!fromWallet) {
      return sendFailResponse(res, 'Sender wallet not found', 404);
    }

    if (fromWallet.amount < amount) {
      return sendFailResponse(res, 'Sender wallet has insufficiant balance', 404);
    }

    // Find receiver wallet based on isReceiverAgency flag
    let toWallet = await Wallet.findOne({
      where: isReceiverAgency ? { agencyId: receiverClientId } : { clientId: receiverClientId }
    });
    if (!toWallet) {
      return sendFailResponse(res, 'Receiver wallet not found', 404);
    }

    const uniqueCode = generateRandomCode(8);
    const transactionData = {
      amount,
      type: '2',
      status: isReceiverRegistered ? '1' : '2',
      note: note,
      isDeducted: true,
      isCashTransaction: false,
      isRegisteredClient: isSenderRegistered,
      unregisteredClientDetails: senderDetails,
      clientId: !isSenderAgency ? senderClientId : null,
      agencyId: isSenderAgency ? senderClientId : null,
      cashTransactionBy: isSenderAgency ? 'agency' : 'associateClient',
      fromWalletId: fromWallet.id,
      toWalletId: toWallet.id,
      documentTypeId: receiverDetails?.documentTypeId || null,
      documentNumber: receiverDetails?.documentNumber || null,
      uniqueCode: uniqueCode
    };

    const transactionResponse = await Transaction.create(transactionData);

    // Update wallets
    fromWallet.amount = fromWallet.amount - amount;
    if (isReceiverRegistered) {
      toWallet.amount = toWallet.amount + amount;

      //#region send mail to sender
      const emailBody = await ejs.renderFile(
        path.join(__dirname, '../../templates/money-transfer.ejs'),
        {
          userName: sender.firstName,
          recipientName: sender.firstName,
          transferAmount: amount,
          currency: '$',
          supportLink: '#',
          termsLink: '#',
          appName: 'DUAL MONEY',
          transferDate: new Date().toISOString().substring(0, 10),
          emailSignature: 'DUAL MONEY',
          transactionId: uniqueCode
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
          recipientName: receiver.firstName,
          receivedAmount: amount,
          currency: '$',
          senderName: sender.firstName,
          appName: 'DUAL MONEY',
          transferDate: new Date().toISOString().substring(0, 10),
          emailSignature: 'DUAL MONEY',
          transactionId: uniqueCode,
          helpCenterUrl: '#'
        }
      );
      let receiverEmailObj = {
        subject: 'You have Received Money',
        html: receiveremailBody
      };
      await sendEmail(req, receiverEmailObj, receiver.email);
      //#endregion
    } else {
      const receiveremailBody = await ejs.renderFile(
        path.join(__dirname, '../../templates/money-receive-code.ejs'),
        {
          recipientName: receiver.firstName,
          uniqueCode: uniqueCode,
          receivedAmount: amount,
          currency: '$',
          senderName: sender.firstName,
          appName: 'DUAL MONEY',
          transferDate: new Date().toISOString().substring(0, 10),
          emailSignature: 'DUAL MONEY',
          transactionId: uniqueCode
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
exports.withdraw = async (req, res) => {
  const user = req.user;
  const { documentTypeId, documentNumber, uniqueCode } = req.body;
  const isRecordExist = await Transaction.findOne({
    where: {
      documentTypeId: documentTypeId,
      documentNumber: documentNumber,
      uniqueCode: uniqueCode,
      status: '2'
    }
  });
  if (!isRecordExist) {
    return sendFailResponse(res, 'No record found', 400);
  }
  const receiverWalletDetails = await Wallet.findOne({
    where: { id: isRecordExist.toWalletId }
  });
  const receiverId = receiverWalletDetails.clientId;
  const myWallet = await Wallet.findOne({
    where: { agencyId: user.id }
  });
  if (!myWallet) {
    return sendFailResponse(res, 'Receiver Wallet not found', 400);
  }
  //#region transfer from client wallet to agency wallet
  const newuniqueCode = await generateRandomCode(8);
  const transactionData = {
    amount: isRecordExist.amount,
    type: '2',
    status: '1',
    isDeducted: true,
    isCashTransaction: true,
    isRegisteredClient: true,
    clientId: receiverId,
    cashTransactionBy: 'associateClient',
    cashTransactionByClientId: receiverId,
    fromWalletId: receiverWalletDetails.id,
    toWalletId: myWallet.id,
    uniqueCode: newuniqueCode
  };
  const transactionResponse = await Transaction.create(transactionData);
  //#endregion
  myWallet.amount = myWallet.amount + isRecordExist.amount;
  receiverWalletDetails.pendingAmount = receiverWalletDetails.pendingAmount - isRecordExist.amount;
  isRecordExist.status = '1';
  await isRecordExist.save();
  await receiverWalletDetails.save();
  await myWallet.save();
  return sendSuccessResponse(res, 'Amount Withdrawn successfully.', isRecordExist);
};
