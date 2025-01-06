const Transactions = require('../models').transactions;
const { sequelize } = require('../models');
const bankTransactions = require('../models').bankTransactions;
const Wallet = require('../models').wallets;
const { sendFailResponse, sendSuccessResponse } = require('../services/response');
const stripeService = require('../services/stripe');
const { Op } = require('sequelize');

// Controller for adding funds to wallet
exports.addToWalletFromBank = async (req, res) => {
  try {
    const user = req.user;
    let { description, purpose, amount, currency } = req.body;

    // Ensure the user has the correct role
    if (![6, 7, 5].includes(user.roleId)) {
      return sendFailResponse(
        res,
        'Only Associate or Normal Client or Agency can perform this operation',
        400
      );
    }

    // Validate agencyId and clientId based on user role
    const clientId = user.roleId === 6 || user.roleId === 7 ? user.id : null;
    const agencyId = user.roleId === 6 || user.roleId === 7 ? null : user.id;

    // Convert amount to cents for Stripe
    const amountInCents = Math.round(amount * 100);

    if (!user.stripeCustomerId) {
      const customer = await stripeService.createCustomer(user.email);
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    // Create a Stripe PaymentIntent
    const paymentIntent = await stripeService.createPayment(
      amountInCents,
      currency,
      user.stripeCustomerId
    );

    // Record the pending transaction in the bankTransactions table
    const transaction = await bankTransactions.create({
      clientId,
      agencyId,
      description,
      purpose,
      amount,
      currency,
      stripePaymentId: paymentIntent.id,
      status: '2' // Pending
    });

    // Return the client secret for frontend processing
    return sendSuccessResponse(res, 'Payment initiated', {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      transactionId: transaction.id
    });
  } catch (err) {
    console.error('Error in addToWalletFromBank:', err);
    return sendFailResponse(res, err.message, 500);
  }
};

// Verify payment and update wallet
exports.verifyAndConfirmWalletRecharge = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const user = req.user;
    // Validate agencyId and clientId based on user role
    const clientId = user.roleId === 6 || user.roleId === 7 ? user.id : null;
    const agencyId = user.roleId === 6 || user.roleId === 7 ? null : user.id;

    // Verify the payment with Stripe
    const paymentIntent = await stripeService.verifyPaymentIntent(paymentIntentId);
    console.log(paymentIntent);
    if (paymentIntent.status !== 'succeeded') {
      return sendFailResponse(res, 'Payment not successful', 400);
    }
    //  get net amount after  fees
    const { netAmount, fee } = await stripeService.getnetAmount(paymentIntent);

    // Find the corresponding transaction
    const transaction = await bankTransactions.findOne({
      where: {
        stripePaymentId: paymentIntentId,
        status: '2',
        [Op.or]: [{ clientId: user.id }, { agencyId: user.id }]
      }
    });

    if (!transaction) {
      return sendFailResponse(res, 'Transaction not found', 404);
    }

    // Check if the client's wallet exists
    const wallet = await Wallet.findOne({
      where: {
        [Op.or]: [{ clientId: user.id }, { agencyId: user.id }],
        isActive: true
      }
    });
    //decrease ammount from admin side
    const adminWallet = await Wallet.findOne({
      where: {
        roleType: 2,
        isActive: true
      }
    });
    if (!wallet) {
      return sendFailResponse(res, 'Wallet not found', 404);
    }

    // Update wallet balance and transaction atomically
    await sequelize.transaction(async (t) => {
      wallet.amount += netAmount;
      await wallet.save({ transaction: t });

      adminWallet.amount -= netAmount;
      await adminWallet.save({ transaction: t });

      transaction.status = '1'; // Completed
      transaction.amountReceived = netAmount;
      transaction.stripeFee = fee || 0;
      transaction.stripeStatus = paymentIntent.status;
      transaction.paymentMethodOption = paymentIntent.payment_method_options;
      await transaction.save({ transaction: t });

      // Create a new transaction record
      const x = await Transactions.create({
        clientId,
        agencyId,
        amount: netAmount,
        type: '0',
        status: '1',
        isDeducted: false,
        note: transaction.description ?? undefined,
        transaction: t,
        commissions: {
          fee: fee,
          purpose: 'wallet_recharge by bank '
        },
        uniqueCode: transaction.stripePaymentId
      });
      // console.log('Transaction===', x);
    });

    return sendSuccessResponse(res, 'Payment successful and wallet updated', wallet);
  } catch (err) {
    console.error('Error in verifyAndConfirmWalletRecharge:', err);
    return sendFailResponse(res, err.message, 500);
  }
};
