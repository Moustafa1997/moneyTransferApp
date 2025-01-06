'use strict';
const { Sequelize } = require('../../models');
const { getSignedUrlFromFileKey } = require('../../services/common');
// const { Op } = require('sequelize');
const { sendSuccessResponse, sendFailResponse } = require('../../services/response');
// const { Sequelize } = require('../../models');
const Client = require('../../models').clients;
const Agency = require('../../models').agencies;
const Country = require('../../models').country_codes;
const State = require('../../models').states;
const City = require('../../models').cities;

exports.getAssociateLocations = async (req, res) => {
  try {
    const query = {
      attributes: {
        exclude: ['password', 'idDocument', 'digitalSignature', 'uploadedSignature'],
        include: [
          [Sequelize.col('country.name'), 'country'],
          [Sequelize.col('state.name'), 'state'],
          [Sequelize.col('city.name'), 'city']
        ]
      },
      where: {
        roleId: 6,
        isApproved: '1',
        isSuspend: '0',
        isDeleted: '0'
      },
      include: [
        { model: Country, required: false, as: 'country' },
        { model: State, required: false, as: 'state' },
        { model: City, required: false, as: 'city' }
      ],
      order: [['createdAt', 'DESC']],
      raw: true,
      nest: true
    };

    const associates = await Client.findAndCountAll(query);
    for (let associate of associates.rows) {
      associate.profileImage = await getSignedUrlFromFileKey(associate.profileImage);
    }

    return sendSuccessResponse(res, 'fetched successfully', associates);
  } catch (e) {
    return sendFailResponse(res, e.message, 500);
  }
};

exports.getAgencyLocations = async (req, res) => {
  try {
    const query = {
      attributes: {
        exclude: ['password', 'idDocument', 'digitalSignature', 'uploadedSignature']
      },
      where: {
        isApproved: '1',
        isSuspend: '0',
        isDeleted: '0'
      },
      order: [['createdAt', 'DESC']]
    };

    const agencies = await Agency.findAndCountAll(query);
    for (let agency of agencies.rows) {
      agency.profileImage = await getSignedUrlFromFileKey(agency.profileImage);
    }

    return sendSuccessResponse(res, 'fetched successfully', {
      ...agencies
    });
  } catch (e) {
    return sendFailResponse(res, e.message, 500);
  }
};

exports.updateLocationOfAssociate = async (req, res) => {
  try {
    const associate = await Client.findOne({
      where: {
        id: req.params.id,
        roleId: 6,
        isDeleted: '0'
      }
    });

    if (!associate) {
      return sendFailResponse(res, 'Associate not found', null, 404);
    }

    const updatedAssociate = await Client.update(req.body, {
      where: {
        roleId: 6,
        id: req.params.id,
        isDeleted: '0'
      }
    });

    return sendSuccessResponse(res, 'Location updated successfully', {
      updatedAssociate
    });
  } catch (e) {
    return sendFailResponse(res, e.message, 500);
  }
};

exports.updateLocationOfAgency = async (req, res) => {
  try {
    const agency = await Agency.findOne({
      where: {
        id: req.params.id,
        isDeleted: '0'
      }
    });

    if (!agency) {
      return sendFailResponse(res, 'Agency not found', null, 404);
    }

    const updatedAgency = await Agency.update(req.body, {
      where: {
        id: req.params.id,
        isDeleted: '0'
      }
    });

    return sendSuccessResponse(res, 'Location updated successfully', {
      updatedAgency
    });
  } catch (e) {
    return sendFailResponse(res, e.message, 500);
  }
};
