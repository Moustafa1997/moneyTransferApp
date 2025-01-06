const { Op } = require('sequelize');
const { sequelize } = require('../../models');
const userRepository = require('../../repositories/userRepository');
const { generateRandomCode, getSignedUrlFromFileKey } = require('../../services/common');
const sendEmail = require('../../services/email');
const { getPagination, getPagingData } = require('../../services/pagination');
const { sendFailResponse, sendSuccessResponse } = require('../../services/response');
const Invitation = require('../../models').invitations;
const Client = require('../../models').clients;
const Agency = require('../../models').agencies;
exports.sendInvitation = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;
    const inviteTo = await userRepository.getFrontendLoginUserByEmail(req.body.email);
    if (inviteTo) {
      return res.status(400).json({ message: 'User has already account' });
    }

    const invitation = await Invitation.findOne({ where: { email, invitedBy: userId } });
    if (invitation) {
      return res.status(400).json({ message: 'Invitation has been already created' });
    }
    const referCode = generateRandomCode();
    const newInvitation = await Invitation.create({
      email,
      code: referCode,
      invitedBy: userId,
      phone: req.body.phone
    });
    const invitationLink = `${process.env.FRONT_URL}/client/signup?refercode=${referCode}`;
    let emailObj = {
      subject: 'Money Transfer Invitation Mail',
      html: `Hi <br> You are invited to the money transfer app. <br> Invited link is ${invitationLink}`
    };

    let sendMail = await sendEmail(req, emailObj, email);
    if (!sendMail)
      return sendFailResponse(res, 'Invitation email not sent. Please try again.', 400);

    return sendSuccessResponse(res, 'Sent invitation successfully.', newInvitation);
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred on login.'
    });
  }
};

exports.getInvitedUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { size, page, search, status, order } = req.query;
    const { limit, offset } = getPagination(page, size);
    const query = {
      attributes: {
        include: [
          [
            sequelize.literal(`
          CASE
          WHEN status = '1' THEN 'accepted'
          WHEN status = '2' THEN 'pending'
          WHEN status = '0' THEN 'rejected'
            ELSE status
          END
        `),
            'status'
          ],
          [
            sequelize.literal(`
          CASE
          WHEN invited_to IS NOT NULL THEN 'client'
          WHEN invited_to_agency IS NOT NULL THEN 'agency'
            ELSE null
          END
        `),
            'invitedType'
          ]
        ]
      },
      order: [['createdAt', order]],
      include: [
        {
          model: Client,
          as: 'invitedClient',
          attributes: [
            'id',
            [sequelize.literal('CONCAT(first_name, " ", last_name)'), 'name'],
            'email',
            'phone',
            'countryCode',
            'profileImage'
          ]
        },
        {
          model: Agency,
          as: 'invitedAgency',
          attributes: ['id', 'name', 'email', 'phone', 'countryCode', 'profileImage']
        }
      ],
      where: { invitedBy: userId },
      limit,
      offset
    };
    if (search) {
      query.where[Op.or] = [
        { '$invitedClient.first_name$': { [Op.like]: `%${search}%` } },
        { '$invitedClient.last_name$': { [Op.like]: `%${search}%` } },
        { '$invitedClient.email$': { [Op.like]: `%${search}%` } },
        { '$invitedAgency.name$': { [Op.like]: `%${search}%` } },
        { '$invitedAgency.email$': { [Op.like]: `%${search}%` } },
        { '$invitedAgency.phone$': { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    if (status) {
      if (status === 'accepted') {
        query.where.status = '1';
      } else if (status === 'pending') {
        query.where.status = '2';
      } else if (status === 'rejected') {
        query.where.status = '0';
      }
    }
    const invitations = await Invitation.findAndCountAll(query);
    for (const invitation of invitations.rows) {
      if (invitation.invitedClient) {
        invitation.invitedClient.profileImage = await getSignedUrlFromFileKey(
          invitation.invitedClient.profileImage
        );
      }
      if (invitation.invitedAgency) {
        invitation.invitedAgency.profileImage = await getSignedUrlFromFileKey(
          invitation.invitedAgency.profileImage
        );
      }
    }
    const { data, totalCount, totalPages, currentPage } = getPagingData(invitations, page, limit);
    return sendSuccessResponse(res, 'Fetched invitations successfully.', {
      rows: data,
      totalCount,
      totalPages,
      currentPage
    });
  } catch (err) {
    res.status(500).send({
      message: err.message || 'Some error occurred on login.'
    });
  }
};
