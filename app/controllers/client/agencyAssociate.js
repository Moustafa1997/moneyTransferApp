'use strict';
const { Op } = require('sequelize');
const userRepository = require('../../repositories/userRepository');
const { sendSuccessResponse } = require('../../services/response');
const { Sequelize } = require('../../models');
const { getSignedUrlFromFileKey } = require('../../services/common');
const client = require('../../models').clients;
const Agency = require('../../models').agencies;
const City = require('../../models').cities;
const State = require('../../models').states;
const Country = require('../../models').country_codes;

exports.getNearbyAssociate = async (req, res) => {
  try {
    const currentUserId = [req.user.id];
    const roleIds = [6];
    // const user = req.user;

    const associates = await userRepository.getAllAssociateNearby(roleIds, currentUserId, null, {
      latitude: req.body.locationLatitude,
      longitude: req.body.locationLongitude
    });

    return sendSuccessResponse(res, 'fetched successfully', {
      ...associates
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.getNearbyAgency = async (req, res) => {
  try {
    // const user = req.user;
    const { search } = req.query;

    const query = {
      attributes: {
        exclude: ['password', 'idDocument', 'digitalSignature', 'uploadedSignature'],
        include: [
          [
            Sequelize.literal(`
                6371 * acos(
                    cos(radians(${req.body.locationLatitude})) * cos(radians(location_latitude)) * 
                    cos(radians(location_longitude) - radians(${req.body.locationLongitude})) + 
                    sin(radians(${req.body.locationLatitude})) * sin(radians(location_latitude)) 
                )
            `),
            'distance'
          ]
        ]
      },
      include: [
        {
          model: City,
          attributes: ['name'],
          as: 'city'
        },
        {
          model: State,
          attributes: ['name'],
          as: 'state'
        },
        {
          model: Country,
          attributes: ['name'],
          as: 'country'
        }
      ],
      where: {
        isApproved: '1',
        isSuspend: '0',
        isDeleted: '0',
        locationLatitude: { [Op.ne]: null },
        locationLongitude: { [Op.ne]: null }
      },
      order: Sequelize.literal('distance ASC')
    };

    if (search) {
      query.where.email = { [Op.like]: `%${search}%` };
    }

    const agencies = await Agency.findAndCountAll(query);

    return sendSuccessResponse(res, 'fetched successfully', {
      ...agencies
    });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.getSearchClientAccounts = async (req, res) => {
  try {
    const roleIds = [6, 7];
    const user = req.user;
    const { search } = req.query;
    const query = {
      attributes: { exclude: ['password', 'idDocument', 'digitalSignature', 'uploadedSignature'] },

      where: {
        roleId: { [Op.in]: roleIds },
        id: { [Op.notIn]: user.id }
      }
    };
    if (search) {
      query.where[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }
    const clients = await client.findAll(query);

    for (let client of clients) {
      client.profileImage = await getSignedUrlFromFileKey(client.profileImage);
    }
    return sendSuccessResponse(res, 'fetched successfully', clients);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
