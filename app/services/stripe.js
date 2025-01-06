require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  async createCustomer(email) {
    return await stripe.customers.create({ email });
  }

  /**
   * Creates a Stripe Payment Intent
   * @param {number} amount - Amount of the payment
   * @param {string} [currency='usd'] - Currency of the payment
   * @param {string} customerId - Stripe Customer Id
   * @returns {Promise<Stripe.PaymentIntent>} Stripe Payment Intent Object
   */
  async createPayment(amount, currency = 'usd', customerId) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        automatic_payment_methods: {
          enabled: true
        }
      });
      console.log('paymentIntent', paymentIntent);

      return paymentIntent;
    } catch (error) {
      throw new Error(`Error creating payment: ${error.message}`);
    }
  }

  /**
   * Calculates the net amount received by the application after
   * subtracting stripe fees from a payment intent
   * @param {Stripe.PaymentIntent} paymentIntent
   * @returns {Promise<{netAmount: number, fee: number}>} Object with netAmount and fee
   */
  async getnetAmount(paymentIntent) {
    const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
    const balanceTransaction = await stripe.balanceTransactions.retrieve(
      charge.balance_transaction
    );
    console.log('bankTransaction', 'balanceTransaction', balanceTransaction);

    const netAmount = balanceTransaction.net / 100; //  convert  from cents to dollar
    const fee = balanceTransaction.fee / 100;
    return {
      netAmount,
      fee
    };
  }

  /* async createTransfer(amount, bankAccount, currency = 'usd') {
    try {
      // First create a payout to connected bank account
      const transfer = await stripe.transfers.create({
        amount,
        currency,
        destination: bankAccount.id,
        transfer_group: 'WALLET_WITHDRAWAL'
      });

      await Payment.create({
        stripePaymentId: transfer.id,
        amount,
        currency,
        status: transfer.status
      });

      return transfer;
    } catch (error) {
      throw new Error(`Error creating transfer: ${error.message}`);
    }
  }
 */
  async verifyPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      throw new Error(`Error verifying payment: ${error.message}`);
    }
  }

  /*  async refundPayment(paymentIntentId) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId
      });

      await Payment.update({ status: 'refunded' }, { where: { stripePaymentId: paymentIntentId } });

      return refund;
    } catch (error) {
      throw new Error(`Error processing refund: ${error.message}`);
    }
  } */
}

module.exports = new StripeService();
