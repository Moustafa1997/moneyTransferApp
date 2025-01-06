'use strict';
require('dotenv').config();
const twilio = require('twilio');
const { ValidationError, Op } = require('sequelize');
const { getSignedUrlFromFileKey, generateOtpInNumber } = require('../services/common');
const { sendSuccessResponse, sendFailResponse } = require('../services/response');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const CountryCode = require('../models').country_codes;
const State = require('../models').states;
const Cities = require('../models').cities;
const CurrencyExchanges = require('../models').currency_exchanges;
const PhoneOtpVerifications = require('../models').phone_otp_verifications;
const DocumentType = require('../models').document_types;
const sendEmail = require('../services/email');
const { ACCOUNT_SID, AUTH_TOKEN, FROM_PHONE } = process.env;
const twilioClient = twilio(ACCOUNT_SID, AUTH_TOKEN);
exports.fileUploadApi = async (req, res) => {
  try {
    const file = req.file;

    if (file) {
      return res.status(200).send({
        message: 'Upload Successfully',
        signedFileUrl: await getSignedUrlFromFileKey(file.location),
        fileUrl: file.location
      });
    }
    if (!file && !req.body.imageBase64) {
      return res.status(400).send({ status: 400, message: 'Please upload file' });
    }
    if (!file && req.body.imageBase64) {
      const s3 = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });
      const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const fileBuffer = Buffer.from(base64Data, 'base64');
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `uploaded-signature/base64_${Date.now()}.png`,
        Body: fileBuffer,
        ContentType: 'image/png'
      };
      const command = new PutObjectCommand(params);
      await s3.send(command);
      const fileUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
      return res.status(200).send({
        message: 'Upload Successfully',
        signedFileUrl: await getSignedUrlFromFileKey(fileUrl),
        fileUrl: fileUrl
      });
    }
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(500).send({ message: err.errors[0].message });
    }
    res.status(500).send({
      message: err.message || 'Some error occurred while updating the commission setting.'
    });
  }
};
exports.createDocumentType = async (req, res) => {
  const data = req.body;
  try {
    const document = await DocumentType.create(data);
    return res.status(200).send({
      message: 'Created Successfully',
      data: document
    });
  } catch (error) {
    throw new Error(`Error creating document: ${error.message}`);
  }
};
exports.getAllDocumentType = async (req, res) => {
  try {
    const allDocumentsType = await DocumentType.findAll();
    return res.status(200).send({
      data: allDocumentsType
    });
  } catch (error) {
    throw new Error(`Error fetching documents: ${error.message}`);
  }
};
exports.getDetailDocumentType = async (req, res) => {
  const { id } = req.params;
  try {
    const document = await DocumentType.findOne({ where: { id } });
    if (!document) {
      throw new Error('Document not found');
    }
    return res.status(200).send({
      data: document
    });
  } catch (error) {
    throw new Error(`Error fetching document: ${error.message}`);
  }
};
exports.updateDocumentType = async (req, res) => {
  const data = req.body;
  try {
    const [updated] = await DocumentType.update(data, {
      where: { id }
    });

    if (!updated) {
      throw new Error('Document not found or no changes made');
    }

    const updatedDocument = await DocumentType.findOne({ where: { id } });
    return res.status(200).send({
      data: updatedDocument
    });
  } catch (error) {
    throw new Error(`Error updating document: ${error.message}`);
  }
};
exports.deleteDocumentType = async (req, res) => {
  const { id } = req.body;
  try {
    const deleted = await DocumentType.destroy({
      where: { id }
    });

    if (!deleted) {
      throw new Error('Document not found');
    }
    return res.status(200).send({
      message: 'Document deleted successfully'
    });
  } catch (error) {
    throw new Error(`Error deleting document: ${error.message}`);
  }
};

exports.getCountryCode = async (req, res) => {
  try {
    // let countries = require('../../config/country.json');
    // countries = countries.map((country) => ({
    //   name: country.name,
    //   shortName: country.code,
    //   dialCode: country.dialling_code,
    //   currencyName: country.currency.name,
    //   currencyCode: country.currency.code
    // }));

    // countries = countries.sort((a, b) => a.name.localeCompare(b.name));
    // console.log(countries);
    // await CountryCode.bulkCreate(countries);
    const { search } = req.query;
    const query = {
      where: {},
      order: [['name', 'ASC']]
    };
    if (search) {
      query.where.name = {
        [Op.like]: `%${search}%`
      };
    }
    const countryCode = await CountryCode.findAndCountAll(query);
    return sendSuccessResponse(res, 'Get Country Code Successfully', {
      ...countryCode
    });
  } catch (err) {
    return sendFailResponse(
      res,
      err.message || 'Some error occurred while getting the country code.',
      500
    );
  }
};

exports.getStates = async (req, res) => {
  try {
    const { search } = req.query;
    const { countryId } = req.params;
    const query = {
      where: {
        countryId: countryId
      },
      order: [['name', 'ASC']]
    };
    if (search) {
      query.where.name = {
        [Op.like]: `%${search}%`
      };
    }
    const states = await State.findAndCountAll(query);
    return sendSuccessResponse(res, 'Get State City Successfully', {
      ...states
    });
  } catch (err) {
    return sendFailResponse(
      res,
      err.message || 'Some error occurred while getting the state city.',
      500
    );
  }
};

exports.getCities = async (req, res) => {
  try {
    const { search } = req.query;
    const { stateId } = req.params;
    const query = {
      where: {
        stateId: stateId
      },
      order: [['name', 'ASC']]
    };
    if (search) {
      query.where.name = {
        [Op.like]: `%${search}%`
      };
    }
    const cities = await Cities.findAndCountAll(query);

    return sendSuccessResponse(res, 'Get City Successfully', {
      ...cities
    });
  } catch (err) {
    return sendFailResponse(res, err.message || 'Some error occurred while getting the city.', 500);
  }
};

exports.searchCityStateCountry = async (req, res) => {
  try {
    const { search } = req.query;
    if (!search) {
      return sendFailResponse(res, 'Search query is required', 400);
    }
    const query = {
      where: {},
      attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      order: [['name', 'ASC']],
      include: [
        {
          model: State,
          attributes: ['id', 'name'],
          required: false,
          as: 'state',
          include: [
            {
              model: CountryCode,
              attributes: ['id', 'name'],
              as: 'country'
            }
          ]
        }
      ]
    };
    if (search) {
      query.where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { '$state.name$': { [Op.like]: `%${search}%` } },
        { '$state.country.name$': { [Op.like]: `%${search}%` } }
      ];
    }
    const cities = await Cities.findAndCountAll(query);

    return sendSuccessResponse(res, 'Get City Successfully', {
      ...cities
    });
  } catch (err) {
    return sendFailResponse(res, err.message || 'Some error occurred while getting the city.', 500);
  }
};

exports.getCurrencyExchange = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {
      where: {},
      attributes: { exclude: ['commissionInPercentage'] },
      include: [
        {
          model: CountryCode,
          as: 'countryCurrency',
          attributes: [['name', 'countryName'], 'currencyCode', 'currencyName']
        }
      ]
    };
    if (search) {
      query.where[Op.or] = [
        {
          '$countryCurrency.name$': {
            [Op.like]: `%${search}%`
          }
        },
        {
          '$countryCurrency.currency_code$': {
            [Op.like]: `%${search}%`
          }
        },
        {
          '$countryCurrency.currency_name$': {
            [Op.like]: `%${search}%`
          }
        }
      ];
    }
    const currencyExchange = await CurrencyExchanges.findAndCountAll(query);
    return sendSuccessResponse(res, 'Get Currency Exchange Successfully', currencyExchange);
  } catch (err) {
    return sendFailResponse(
      res,
      err.message || 'Some error occurred while getting the currency exchange.',
      500
    );
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { phone, countryCode } = req.body;
    const otp = generateOtpInNumber();
    // Regular expression to check if input is a valid email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(phone)) {
      req.body.email = phone;
      let emailObj = {
        subject: 'Verify OTP',
        html: `Dear User, <br>Your OTP is ${otp}<br>`
      };
      // Send email if `phone` is an email
      await sendEmail(req, emailObj, phone);
      // await this.sendSms(req, emailObj, phone);
    }
    const phoneOtpVerification = await PhoneOtpVerifications.create({ phone, countryCode, otp });
    //send otp in sms (pending)
    return sendSuccessResponse(res, 'Otp sent successfully', phoneOtpVerification);
  } catch (err) {
    return sendFailResponse(res, err.message || 'Some error occurred while sending otp.', 500);
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { otp, id } = req.body;
    const phoneOtpVerification = await PhoneOtpVerifications.findOne({
      where: { id, isVerified: false }
    });
    if (!phoneOtpVerification || phoneOtpVerification.isVerified) {
      return sendFailResponse(res, 'Invalid otp', 400);
    }
    if (phoneOtpVerification.otp !== otp) {
      return sendFailResponse(res, 'Invalid otp', 400);
    }
    const updatedPhoneOtpVerification = await phoneOtpVerification.update({ isVerified: true });
    return sendSuccessResponse(res, 'Otp verified successfully', updatedPhoneOtpVerification);
  } catch (err) {
    return sendFailResponse(res, err.message || 'Some error occurred while verifying otp.', 500);
  }
};
exports.sendSms = async (body, to) => {
  twilioClient.messages
    .create({
      body: body,
      from: FROM_PHONE, // Replace with your Twilio phone number
      to: to
    })
    .then((message) => console.log(`SMS sent: ${message.sid}`))
    .catch((error) => console.error(`Failed to send SMS: ${error.message}`));
};
