'use strict';
const CurrencyExchanges = require('../../models').currency_exchanges;
const CountryCodes = require('../../models').country_codes;
const { sendSuccessResponse, sendFailResponse } = require('../../services/response');

exports.getCurrencyExchange = async (req, res) => {
  try {
    const currencyExchange = await CurrencyExchanges.findAll({
      include: [
        {
          model: CountryCodes,
          attributes: [['name', 'countryName'], 'currencyCode', 'currencyName'],
          as: 'countryCurrency'
        }
      ]
    });

    return sendSuccessResponse(res, 'Currency exchange fetched successfully.', currencyExchange);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.addNewCurrencyExchange = async (req, res) => {
  try {
    const { countryId, commissionInPercentage, exchangeRate } = req.body;
    const country = await CountryCodes.findOne({ where: { id: countryId } });
    if (!country) {
      return sendFailResponse(res, 'Country not found.', 404);
    }
    const currencyExchange = await CurrencyExchanges.create({
      countryId,
      commissionInPercentage,
      exchangeRate
    });
    return sendSuccessResponse(res, 'Currency exchange added successfully.', currencyExchange);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.updateCurrencyExchange = async (req, res) => {
  try {
    const { id, commissionInPercentage, exchangeRate } = req.body;
    const currencyExchange = await CurrencyExchanges.findByPk(id);
    if (!currencyExchange) {
      return sendFailResponse(res, 'Currency exchange not found.', 404);
    }
    if (commissionInPercentage) {
      currencyExchange.commissionInPercentage = commissionInPercentage;
    }
    if (exchangeRate) {
      currencyExchange.exchangeRate = exchangeRate;
    }
    await currencyExchange.save();
    return sendSuccessResponse(res, 'Currency exchange updated successfully.', currencyExchange);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.deleteCurrencyExchange = async (req, res) => {
  try {
    const { id } = req.body;
    const currencyExchange = await CurrencyExchanges.findByPk(id);
    if (!currencyExchange) {
      return sendFailResponse(res, 'Currency exchange not found.', 404);
    }
    await currencyExchange.destroy();
    return sendSuccessResponse(res, 'Currency exchange deleted successfully.', null);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};
