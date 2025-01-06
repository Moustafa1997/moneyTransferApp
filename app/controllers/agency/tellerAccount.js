// const { Op } = require('sequelize');
// const { getPagination, getPagingData } = require('../../services/pagination');
const { Op } = require('sequelize');
const { Sequelize } = require('../../models');
const sendEmail = require('../../services/email');
const { getEmailToken } = require('../../services/jwtSign');
const { getPagination, getPagingData } = require('../../services/pagination');
const { sendFailResponse, sendSuccessResponse } = require('../../services/response');
const { getSignedUrlFromFileKey } = require('../../services/common');
// const { sequelize } = require('../../models');
// const { generateRandomCode } = require('../../services/common');
// const sendEmail = require('../../services/email');

// const Agency = require('../../models').agencies;
const TellerAccount = require('../../models').teller_accounts;
const State = require('../../models').states;
const City = require('../../models').cities;
const Country = require('../../models').country_codes;

exports.createTellerAccount = async (req, res) => {
  try {
    const user = req.user;
    const {
      firstName,
      lastName,
      email,
      countryCode,
      phone,
      address,
      stateId,
      cityId,
      countryId,
      zipcode,
      cashCapacity,
      rechargeBudget,
      profileImage,
      idDocument,
      gender,
      birthDate,
      digitalSignature,
      uploadedSignature,
      companyName,
      yearSince
    } = req.body;

    const createObj = {
      firstName,
      lastName,
      email,
      phone,
      countryCode,
      cashCapacity,
      rechargeBudget,
      address,
      stateId,
      cityId,
      countryId,
      zipcode,
      profileImage,
      idDocument,
      gender,
      birthDate,
      digitalSignature,
      uploadedSignature,
      agencyId: user.id,
      companyName,
      yearSince
    };

    // Remove null or undefined values
    Object.keys(createObj).forEach((key) => createObj[key] == null && delete createObj[key]);

    const foundUser = await TellerAccount.findOne({
      where: { email }
    });
    if (foundUser) return sendFailResponse(res, 'Account with the same email already exists', 400);

    const createdUser = await TellerAccount.create(createObj);

    if (createdUser) {
      let accessToken = await getEmailToken(createdUser);
      let clientUrl = `${process.env.BACKEND_URL}/api/agency/verify?token=${accessToken}`;
      let emailObj = {
        subject: 'Money Transfer Verification Mail',
        html: `Hello <br> Welcome to Dual Transfer, your registration request was successfully sent. Please verify your account. <br> ${clientUrl}`
      };

      let sendMail = await sendEmail(req, emailObj);
      if (!sendMail)
        return res.status(400).send({
          status: false,
          message: 'Registration email not sent. Please try again.'
        });
    }

    return sendSuccessResponse(res, 'Teller account created successfully.', createdUser);
  } catch (e) {
    return sendFailResponse(res, e.message, 500);
  }
};
/* UPDATE USER PROFILE  */
exports.updateTellerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const teller = await TellerAccount.findOne({ where: { id: id, isDeleted: '0' } });
    if (!teller) return res.status(404).json({ status: 404, message: 'teller Not found' });

    await TellerAccount.update(req.body, { where: { id: id } });

    const updatedData = await TellerAccount.findOne({ where: { id: id, isDeleted: '0' } });

    return sendSuccessResponse(res, 'Teller Updated Successfully', updatedData);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};
exports.listTellerAccount = async (req, res) => {
  try {
    const user = req.user;
    const { size, page, search, status, order } = req.query;
    const { limit, offset } = getPagination(page, size);

    const query = {
      attributes: {
        exclude: ['password', 'digitalSignature', 'uploadedSignature', 'idDocument'],
        include: [
          [Sequelize.col('country.name'), 'country'],
          [Sequelize.col('state.name'), 'state'],
          [Sequelize.col('city.name'), 'city']
        ]
      },
      where: { agencyId: user.id },
      include: [
        {
          model: State,
          as: 'state'
        },
        {
          model: City,
          as: 'city'
        },
        {
          model: Country,
          as: 'country'
        }
      ],
      order: [['createdAt', order]],
      limit,
      offset,
      raw: true,
      nest: true
    };
    if (status) {
      if (status === 'blocked') {
        query.where.isSuspend = '1';
      } else if (status === 'unblocked') {
        query.where.isSuspend = '0';
      } else if (status === 'all') {
        // do nothing
      }
    }
    if (search) {
      query.where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    const tellerAccounts = await TellerAccount.findAndCountAll(query);

    const { data, totalCount, totalPages, currentPage } = getPagingData(
      tellerAccounts,
      page,
      limit
    );

    for (const tellerAccount of data) {
      tellerAccount.profileImage = await getSignedUrlFromFileKey(tellerAccount.profileImage);
    }
    return sendSuccessResponse(res, 'Teller accounts fetched successfully.', {
      rows: data,
      totalCount,
      totalPages,
      currentPage
    });
  } catch (e) {
    return sendFailResponse(res, e.message, 500);
  }
};

exports.viewTellerAccount = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const tellerAccount = await TellerAccount.findByPk(id, {
      attributes: {
        exclude: ['password', 'uploadedSignature'],
        include: [
          [Sequelize.col('country.name'), 'country'],
          [Sequelize.col('state.name'), 'state'],
          [Sequelize.col('city.name'), 'city']
        ]
      },
      include: [
        {
          model: State,
          as: 'state'
        },
        {
          model: City,
          as: 'city'
        },
        {
          model: Country,
          as: 'country'
        }
      ],
      where: { agencyId: user.id },
      raw: true,
      nest: true
    });
    tellerAccount.profileImage = await getSignedUrlFromFileKey(tellerAccount.profileImage);
    tellerAccount.idDocument = await getSignedUrlFromFileKey(tellerAccount.idDocument);
    tellerAccount.digitalSignature = await getSignedUrlFromFileKey(tellerAccount.digitalSignature);
    return sendSuccessResponse(res, 'Teller account fetched successfully.', tellerAccount);
  } catch (e) {
    return sendFailResponse(res, e.message, 500);
  }
};
