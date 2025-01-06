const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const stripe2 = require('stripe')(process.env.STRIPE_PHY_SECRET_KEY);
const saveCardRepo = require('../repositories/savedCardRepo');
const savedBankRepo = require('../repositories/savedBankRepo');
const cardSaveService = require('./cardSaveService');

exports.createStripeSubscription = async (
  customerId,
  priceId,
  paymentMethodId,
  sourceId,
  isMonthly
) => {
  try {
    console.log('input for==', customerId, priceId, paymentMethodId, sourceId);
    var subscription;
    // for monthly subscription no trail days(0)
    let trial_days = isMonthly == '1' ? 0 : 30;
    // let customer = await stripe.customers.create({
    //   email: email,
    //   // payment_method: 'pm_card_test', //'pm_card_test' for test payments
    // });
    // console.log("customer===", customer.id);
    //payment method creation
    // let paymentMethod = await stripe.paymentMethods.create(
    //   {
    //     type: 'card', // Payment method type, e.g. 'card' for card payments
    //     card: {
    //       // Card details, e.g. number, expiration date, CVC, etc.
    //       number: '4242424242424242',
    //       exp_month: 12,
    //       exp_year: 2023,
    //       cvc: '123'
    //     }
    //   });

    // console.log("paymentMethod===", paymentMethod.id);

    //attach payment method to customer
    // await stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id });

    //update customer default payment option
    // await stripe.customers.update(
    //   customer.id,
    //   {
    //     invoice_settings: {
    //       default_payment_method: paymentMethod.id
    //     }
    //   });

    if (sourceId != null) {
      subscription = await stripe.subscriptions.create({
        customer: customerId,
        trial_period_days: trial_days,
        items: [{ price: priceId }],
        default_source: sourceId
      });
    } else if (paymentMethodId != null) {
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      subscription = await stripe.subscriptions.create({
        customer: customerId,
        trial_period_days: trial_days,
        items: [{ price: priceId }]
      });
    }

    // const product = await stripe.products.retrieve(
    //   'prod_NkUvhsWwbmcnX9'
    // );

    // console.log("Subscription", subscription, new Date(subscription.current_period_start * 1000));
    // console.log("product", subscription);

    if (subscription.id) {
      return {
        status: 1,
        stripeSubScriptionId: subscription.id,
        expiryNano: subscription.current_period_end
      };
    } else {
      return { status: 0, message: 'Error creating membership subscription.' };
    }
  } catch (e) {
    return { status: 0, message: e.message };
  }
};

// card payment
exports.stripePaymentWithCardDetails = async (
  user_id,
  email,
  payAmount,
  card_details,
  card_holder_name,
  payment_description,
  inviteeStripeAccount
) => {
  try {
    const card_last_4_digits = card_details.number.slice(-4);

    let isCardExist = await saveCardRepo.findCardByCardNumAndUserId(card_last_4_digits, user_id);

    if (isCardExist) {
      const { customer_id, payment_method_id } = isCardExist;
      const submitPayment = await stripePayment(
        email,
        payAmount,
        customer_id,
        payment_method_id,
        payment_description,
        inviteeStripeAccount
      );

      if (submitPayment.status == 0) {
        return { status: 0, message: submitPayment.message };
      }

      return { status: 1, stripePaymentId: submitPayment.id, tranId: submitPayment.tranId };
    }

    // save card in DB
    let saveCard = await cardSaveService.saveCardDetails(
      user_id,
      email,
      card_details,
      card_holder_name,
      '1'
    );

    if (saveCard.status == 0) {
      return { status: 0, message: saveCard.message };
    }

    const submitPayment = await stripePayment(
      email,
      payAmount,
      saveCard.data.customer_id,
      saveCard.data.payment_method_id,
      payment_description,
      inviteeStripeAccount
    );

    if (submitPayment.status == 0) {
      return { status: 0, message: submitPayment.message };
    }

    return { status: 1, stripePaymentId: submitPayment.id, tranId: submitPayment.tranId };

    // create new customer if card not exists
    // let customer = await stripe.customers.create({
    //   email: email,
    // });

    // let paymentMethod = await stripe.paymentMethods.create(
    //   {
    //     type: 'card',
    //     card: card_details
    //   });

    // await stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id });
    // const submitPayment = await stripePayment(email, payAmount, customer.id, paymentMethod.id)

    // if (submitPayment.status == 0) {
    //   return { status: 0, message: submitPayment.message }
    // }

    // const cardObj = {
    //   user_id,
    //   customer_id: customer.id,
    //   payment_method_id: paymentMethod.id,
    //   card_last_4_digits,
    //   is_primary: '1'
    // }
    // const saveCardInDb = await saveCardRepo.createCardDetails(cardObj);

    // if (saveCardInDb) {
    //   return { status: 1, stripePaymentId: submitPayment.id }
    // }
  } catch (e) {
    return { status: 0, message: e.message };
  }
};

exports.stripePaymentWithSaveCard = async (
  email,
  payAmount,
  card_id,
  payment_description,
  inviteeStripeAccount
) => {
  try {
    let isCardExist = await saveCardRepo.findSaveCardById(card_id);

    if (isCardExist) {
      const { customer_id, payment_method_id } = isCardExist;
      const submitPayment = await stripePayment(
        email,
        payAmount,
        customer_id,
        payment_method_id,
        payment_description,
        inviteeStripeAccount
      );

      if (submitPayment.status == 0) {
        return { status: 0, message: submitPayment.message };
      }

      return { status: 1, stripePaymentId: submitPayment.id, tranId: submitPayment.tranId };
    }

    return { status: 0, message: 'Card Not exist' };
  } catch (e) {
    return { status: 0, message: e.message };
  }
};

// bank Account payment
exports.stripePaymentWithSaveBank = async (
  payAmount,
  bank_id,
  payment_description,
  inviteeStripeAccount
) => {
  try {
    let isBankExist = await savedBankRepo.findBankDetailById(bank_id);

    if (isBankExist) {
      const { customer_id, source_id } = isBankExist;
      const submitPayment = await stripeBankPayment(
        payAmount,
        customer_id,
        source_id,
        payment_description,
        inviteeStripeAccount
      );

      if (submitPayment.status == 0) {
        return { status: 0, message: submitPayment.message };
      }

      return { status: 1, stripePaymentId: submitPayment.id, tranId: submitPayment.tranId };
    }

    return { status: 0, message: 'Bank Details Not exist' };
  } catch (e) {
    return { status: 0, message: e.message };
  }
};

exports.stripePaymentWithBankAccount = async (
  user_id,
  email,
  payAmount,
  bank_account_details,
  payment_description,
  inviteeStripeAccount
) => {
  try {
    const bank_acc_last_4_digits = bank_account_details.account_number.slice(-4);

    let isBankExist = await savedBankRepo.findByAccNumAndUserId(bank_acc_last_4_digits, user_id);

    if (isBankExist) {
      const { customer_id, source_id } = isBankExist;
      const submitPayment = await stripeBankPayment(
        payAmount,
        customer_id,
        source_id,
        payment_description,
        inviteeStripeAccount
      );

      if (submitPayment.status == 0) {
        return { status: 0, message: submitPayment.message };
      }

      return { status: 1, stripePaymentId: submitPayment.id, tranId: submitPayment.tranId };
    }

    // save Bank Details in DB
    let saveBankDetails = await cardSaveService.saveBankDetails(
      user_id,
      email,
      bank_account_details,
      '1'
    );

    if (saveBankDetails.status == 0) {
      return { status: 0, message: saveBankDetails.message };
    }

    const submitPayment = await stripeBankPayment(
      payAmount,
      saveBankDetails.data.customer_id,
      saveBankDetails.data.source_id,
      payment_description,
      inviteeStripeAccount
    );
    console.log('submitPayment', submitPayment, saveBankDetails.data.customer_id);

    if (submitPayment.status == 0) {
      return { status: 0, message: submitPayment.message };
    }

    return { status: 1, stripePaymentId: submitPayment.id, tranId: submitPayment.tranId };
  } catch (e) {
    return { status: 0, message: e.message };
  }
};

async function stripePayment(
  email,
  amount,
  customer_id,
  paymentMethod_id,
  payment_description,
  inviteeStripeAccount
) {
  try {
    const amountFix = amount * 100;
    amount = amountFix.toFixed();

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: amount,
        currency: 'usd',
        description: payment_description,
        receipt_email: email,
        customer: customer_id,
        payment_method: paymentMethod_id,
        transfer_data: {
          // destination: 'acct_1NLlZgQlhs0Fc4yb'
          destination: inviteeStripeAccount
        }
      }
      // {
      //   stripeAccount: 'acct_1NLlZgQlhs0Fc4yb'
      // }
    );

    // create confirm payment method
    const paymentIntentConfirm = await stripe.paymentIntents.confirm(paymentIntent.id, {
      payment_method: paymentMethod_id
    });

    const charge = await stripe.charges.retrieve(paymentIntentConfirm.latest_charge);

    if (paymentIntentConfirm) {
      return {
        status: 1,
        id: paymentIntentConfirm.latest_charge,
        tranId: charge.balance_transaction
      };
    } else {
      return { status: 0, message: 'Error in payment.' };
    }
  } catch (e) {
    return { status: 0, message: e.message };
  }
}

async function stripeBankPayment(
  amount,
  customer_id,
  source_id,
  payment_description,
  inviteeStripeAccount
) {
  try {
    const amountFix = amount * 100;
    amount = amountFix.toFixed();

    const charge = await stripe.charges.create({
      amount: amount,
      currency: 'usd',
      customer: customer_id,
      source: source_id,
      destination: inviteeStripeAccount, // ex: 'acct_1NLlZgQlhs0Fc4yb',
      description: payment_description
    });

    // const transfer = await stripe.transfers.create({
    //   amount: 1000,
    //   currency: 'usd',
    //   destination: '{{PLATFORM_STRIPE_ACCOUNT_ID}}'
    // }, {
    //   stripeAccount: '{{CONNECTED_STRIPE_ACCOUNT_ID}}',
    // });

    // const transfer = await stripe.transfers.create({
    //   amount: amount * 100, // Amount in cents
    //   currency: 'usd',
    //   source_transaction: charge.id, // The charge ID from your original charge
    //   destination: 'acct_1NLlZgQlhs0Fc4yb', // The verified bank account ID
    //   description: 'Transfer description',
    // });

    if (charge) {
      return { status: 1, id: charge.id, tranId: charge.balance_transaction };
    } else {
      return { status: 0, message: 'Error in ACH payment.' };
    }
  } catch (e) {
    return { status: 0, message: e.message };
  }
}

exports.createACHPayment = async (email, amount) => {
  try {
    const source = await stripe.customers.createSource('cus_NkqXShMyhQFMtv', {
      source: {
        object: 'bank_account',
        account_number: '000123456789',
        routing_number: '110000000',
        country: 'US',
        currency: 'usd',
        account_holder_name: 'John Doe',
        account_holder_type: 'individual'
      }
    });

    const bankAccount = await stripe.customers.verifySource('cus_NkqXShMyhQFMtv', source.id, {
      amounts: [32, 45]
    });

    const charge = await stripe.charges.create({
      amount: amount,
      currency: 'usd',
      customer: 'cus_NkqXShMyhQFMtv',
      source: source.id
    });

    if (charge) {
      return { status: 1, stripePaymentId: charge };
    } else {
      return { status: 0, message: 'Error in ach payment.' };
    }
  } catch (e) {
    return { status: 0, message: e.message };
  }
};

// exports.stripeSubscriptionPriceUpdate = async(stripe_product_id, stripe_month_price_id, stripe_year_price_id, monthly_price, yearly_price)=>{

// try{

//   // const price = await stripe.prices.retrieve(stripe_year_price_id);

//   var updatedMonthlyStripeId = stripe_month_price_id;
//   var updatedYearlyStripeId = stripe_year_price_id;

//   if(monthly_price){

//     let createdMonthly = await stripe.prices.create({
//       unit_amount: monthly_price*100,
//       currency: 'usd',
//       recurring: {interval: 'month'},
//       product: stripe_product_id,
//     });

//     updatedMonthlyStripeId = await createdMonthly.id;

//     await stripe.products.update(stripe_product_id, {
//       default_price: updatedMonthlyStripeId
//     });

//     await stripe.plans.del(stripe_month_price_id);
//   }

//   if(yearly_price){

//     await stripe.plans.del(stripe_year_price_id);

//     let createdYearly = await stripe.prices.create({
//       unit_amount: yearly_price*100,
//       currency: 'usd',
//       recurring: {interval: 'year'},
//       product: stripe_product_id,
//     });

//     updatedYearlyStripeId = await createdYearly.id;
//   }

//     // const prod = await stripe.products.retrieve(
//     //   'prod_NkV9z1BIumUS71'
//     // );
//     // const subscription = await stripe.subscriptions.retrieve(
//     //   'sub_1NDOzAHit3Wm7peASuxgCBta'
//     // );

//   return { updatedMonthlyStripeId: updatedMonthlyStripeId, updatedYearlyStripeId: updatedYearlyStripeId}

// }catch(e){

//   return {status: 500, message: e.message}
// }
// }

exports.stripeSubscriptionPriceUpdate = async (
  product_name,
  stripe_product_id,
  stripe_month_price_id,
  stripe_year_price_id,
  monthly_price,
  yearly_price
) => {
  try {
    // const subscriptions = await stripe.subscriptions.list({ price: stripe_month_price_id });
    // console.log('111111111', subscriptions);

    const newProduct = await stripe.products.create({
      name: product_name,
      type: 'service'
    });

    let createdNewMonthlyPrice = await stripe.prices.create({
      unit_amount: monthly_price * 100,
      currency: 'usd',
      recurring: { interval: 'month' },
      product: newProduct.id
    });

    let createdNewYearlyPrice = await stripe.prices.create({
      unit_amount: yearly_price * 100,
      currency: 'usd',
      recurring: { interval: 'year' },
      product: newProduct.id
    });

    // console.log('createdMonthly', newProduct, createdNewMonthlyPrice);

    const oldProduct = await stripe.products.update(stripe_product_id, {
      active: false // Deactivate the old product
    });

    //   const monthSubscriptionUser = await stripe.subscriptions.list({ price: stripe_month_price_id });
    //   let arrOfMonthSubData = monthSubscriptionUser.data;

    //   const yearSubscriptionUser = await stripe.subscriptions.list({ price: stripe_year_price_id });
    //   let arrOfYearSubData = yearSubscriptionUser.data;

    //   if(arrOfMonthSubData.length > 0){

    //   for (const sub of arrOfMonthSubData) {
    //     console.log('month', arrOfMonthSubData.length);
    //     await stripe.subscriptions.update(sub.id, {
    //       items: [{
    //         id: sub.items.data[0].id,
    //         price: createdNewMonthlyPrice.id, // Update to the new month price
    //       }],
    //     });
    //   }

    // }

    // if(arrOfYearSubData.length > 0){

    //   for (const sub of arrOfYearSubData) {
    //     console.log('year', arrOfYearSubData.length);
    //     await stripe.subscriptions.update(sub.id, {
    //       items: [{
    //         id: sub.items.data[0].id,
    //         price: createdNewYearlyPrice.id, // Update to the new year price
    //       }],
    //     });
    //   }

    // }

    return {
      updatedProductId: newProduct.id,
      updatedMonthlyStripeId: createdNewMonthlyPrice.id,
      updatedYearlyStripeId: createdNewYearlyPrice.id
    };
  } catch (e) {
    return { status: 500, message: e.message };
  }
};

// price_1NFZj8Hit3Wm7peABPaXgPaR

// exports.getBankDetailsBySourceId = async(sourceId) => {

//   try{

//     const source = await stripe.sources.retrieve(sourceId);

//     return { bankData: source}

//   }catch(e){

//     return {status: 500, message: e.message}
//   }
// }

exports.webHookCreation = async () => {
  const webhookEndpoint = await stripe.webhookEndpoints.create({
    url: 'https://cnp1837-api.developer24x7.com/api/webHookHandler',
    enabled_events: ['customer.subscription.trial_end']
  });
};

exports.retrievePaymentMethodDetails = async (stripePaymentMethodId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(stripePaymentMethodId);

    return { detail: paymentMethod };
  } catch (e) {
    return { status: 500, message: e.message };
  }
};
