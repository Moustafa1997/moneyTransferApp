'use strict';
/** DB Query configuration file **/

const Role = require('../models').roles;
const JoiningRequest = require('../models').joining_requests;
const CaseInvitee = require('../models').case_invitees;
const CaseDeposition = require('../models').case_depositions;
const Case = require('../models').cases;
const CaseUser = require('../models').case_users;
const { getPagination } = require('../services/pagination');
const { Op } = require('sequelize');

exports.addJoiningRequest = async (req) => {
  const { first_name, last_name, email, token, role_id, joining_link, created_by } = req.body;

  let createJoinee = await JoiningRequest.create({
    first_name,
    last_name,
    email,
    token,
    role_id,
    joining_link,
    created_by,
    is_invitation_active: '1'
  });
  return createJoinee;
};

exports.getInvitees = async (req) => {
  let { sort_name, sort_order, search, size, page } = req.query;

  let condition;
  let query;

  const { limit, offset } = getPagination(page, size);

  // by default query
  condition = {
    status: '0'
  };

  if (search) {
    condition = {
      status: '0',
      [Op.or]: [
        { '$role.role$': { [Op.like]: `%${search}%` } },
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ]
    };

    // joinQuery = {
    //     [Op.or]: [
    //         { role: { [Op.like]: `%${search}%` } }
    //     ]
    // }
  }

  query = {
    where: condition,
    include: [
      {
        model: Role,
        as: 'role',
        attributes: ['role'],
        required: true
      }
    ],
    limit,
    offset
  };

  if (sort_name && sort_order) {
    query.order = [[sort_name, sort_order]];
  } else {
    query.order = [['updated_at', 'DESC']];
  }

  console.log(query);
  let rows = await JoiningRequest.findAndCountAll(query);

  return { rows, limit, offset };
};

exports.findInvitedByEmail = async (req) => {
  const { email } = req.body;
  var invited = await JoiningRequest.findOne({ where: { email: email } });
  if (invited) {
    return invited;
  } else {
    return 0;
  }
};

exports.findInvitationByEmail = async (email, token, flag, user_id) => {
  let condition = {
    email,
    deleted_at: null,
    status: '0',
    token: { [Op.ne]: null },
    is_invitation_active: '1'
  };

  if (token) {
    condition.token = token;
    delete condition.email;
  }

  if (flag == 'EmailCheckInInvitation') {
    delete condition.is_invitation_active;
  }

  // for user update scenarios
  if (flag == 'EmailCheckInInviForUpdate' && user_id) {
    condition[Op.or] = [
      {
        user_id: {
          [Op.notIn]: [user_id]
        }
      },
      {
        user_id: null
      }
    ];
    delete condition.is_invitation_active;
  }

  let invited = await JoiningRequest.findOne({
    where: condition,
    attributes: ['email', 'joining_link']
  });

  return invited;
};

exports.findInvitationForBulkEmail = async (email) => {
  let condition = {
    email,
    deleted_at: null,
    status: '0',
    token: { [Op.ne]: null },
    is_invitation_active: '1'
  };

  let users = await JoiningRequest.findAll({
    where: condition,
    attributes: ['id', 'first_name', 'role_id', 'email', 'joining_link', 'token']
  });

  let userList = await JSON.parse(JSON.stringify(users));

  return userList;
};

exports.bulkJoiningRequestUpdate = async (updateObjArray) => {
  return await JoiningRequest.bulkCreate(updateObjArray, {
    updateOnDuplicate: ['is_invitation_active']
  });
};

exports.updateJoiningRequest = async (req, userData) => {
  const { email } = req.body;
  const update = await JoiningRequest.update(userData, { where: { email } });
  return update;
};

exports.updateCaseInvitee = async (updateObj, whereCondition) => {
  let update = await CaseInvitee.update(updateObj, { where: whereCondition });
  return update;
};

exports.updateCaseAttorneyUser = async (updateObj, whereCondition) => {
  let update = await CaseUser.update(updateObj, { where: whereCondition });
  return update;
};

exports.findJoiningRequestCaseInviteeByToken = async (token) => {
  var found = await JoiningRequest.findOne({
    where: {
      token: token
    }
  });

  if (found) {
    return { status: 0, data: found };
  } else {
    var invitee = await CaseInvitee.findOne({
      where: {
        token: token
      }
    });

    if (invitee) {
      return { status: 1, data: invitee };
    } else {
      var attorney = await CaseUser.findOne({
        where: {
          token: token
        }
      });

      if (attorney) {
        return { status: 2, data: attorney };
      } else {
        return { status: 3 };
      }
    }
  }
};

exports.getdepoIdsArrayByUserId = async (userId) => {
  try {
    let caseInvitees = await CaseInvitee.findAll({
      where: {
        user_id: userId,
        status: { [Op.ne]: '0' }
      },
      include: [
        {
          model: CaseDeposition,
          attributes: ['status']
        }
      ],
      attributes: ['deposition_id']
    });

    if (!caseInvitees) return { status: 0, message: 'Error finding Case Invitees' };

    var depoIdObjList = await JSON.parse(JSON.stringify(caseInvitees));

    var depoIdArray = [];

    if (depoIdObjList.length > 0) {
      await depoIdObjList.forEach((eachObj) => {
        if (
          eachObj.case_deposition.status == '2' ||
          eachObj.case_deposition.status == '3' ||
          eachObj.case_deposition.status == '5' ||
          eachObj.case_deposition.status == '6'
        ) {
          depoIdArray.push(eachObj.deposition_id);
        }
      });
    }

    var cases = await CaseUser.findAll({
      where: {
        user_id: userId,
        deleted_at: null
      },
      attributes: ['case_id']
    });

    let caseIds = await JSON.parse(JSON.stringify(cases));

    var caseIdArr = [];
    for (let i in caseIds) {
      caseIdArr.push(caseIds[i].case_id);
    }

    let depoList = await CaseDeposition.findAll({
      where: {
        case_id: { [Op.in]: caseIdArr },
        status: ['2', '3', '5', '6']
      },
      attributes: ['id']
    });

    let depos = await JSON.parse(JSON.stringify(depoList));

    var depoArray = [];
    for (let i in depos) {
      depoArray.push(depos[i].id);
    }

    let depoCreator = await CaseDeposition.findAll({
      where: {
        status: ['2', '3', '5', '6'],
        created_by: userId
      },
      attributes: ['id']
    });

    let creatorsList = await JSON.parse(JSON.stringify(depoCreator));

    let creatorDepoArray = [];

    for (let i in creatorsList) {
      creatorDepoArray.push(creatorsList[i].id);
    }

    let totalArray = [...depoIdArray, ...depoArray, ...creatorDepoArray];

    let uniqueSet = new Set(totalArray);

    const uniqueArray = [...uniqueSet];

    return { status: 1, depoIdArray: uniqueArray };
  } catch (e) {
    return { status: 0, message: e.message };
  }
};

exports.findDepositionEventDetailsForMonth = async (depoIdArray, startMonthDate, endMOnthDate) => {
  try {
    let list = await CaseDeposition.findAll({
      where: {
        id: { [Op.in]: depoIdArray },

        [Op.and]: [
          { start_time: { [Op.gte]: startMonthDate } },
          { start_time: { [Op.lte]: endMOnthDate } }
        ],
        status: ['2', '5']
      },
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['case_number', 'case_name']
        }
      ],
      attributes: [
        'id',
        'deposition_number',
        'deponent_name',
        'case_id',
        'start_time',
        'end_time',
        'created_by'
      ],
      order: [['start_time', 'ASC']]
    });

    if (!list) return { status: 0, message: 'Error finding deposition event list.' };

    let eventList = await JSON.parse(JSON.stringify(list));

    return { status: 1, depolist: eventList };
  } catch (e) {
    return { status: 0, message: e.message };
  }
};

exports.findDepositionEventDetailsForUpcoming = async (depoIdArray, dateNow) => {
  try {
    let list = await CaseDeposition.findAll({
      where: {
        id: { [Op.in]: depoIdArray },
        [Op.and]: [{ start_time: { [Op.gte]: dateNow } }, { start_time: { [Op.ne]: null } }]
        // status: '2'
      },
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['case_number']
        }
      ],
      attributes: ['id', 'deposition_number', 'case_id', 'start_time', 'end_time', 'created_by'],
      order: [['start_time', 'ASC']]
    });

    if (!list) return { status: 0, message: 'Error finding deposition event list.' };

    let eventList = await JSON.parse(JSON.stringify(list));

    return { status: 1, depolist: eventList };
  } catch (e) {
    return { status: 0, message: e.message };
  }
};

exports.findDepositionEventAvailabilityByDepoIds = async (depoIdArray, eventTime) => {
  try {
    console.log(eventTime);

    let list = await CaseDeposition.findAll({
      where: {
        id: { [Op.in]: depoIdArray },

        start_time: {
          [Op.lte]: eventTime
        },

        end_time: {
          [Op.gte]: eventTime
        },

        status: '2'
      },
      attributes: ['id']
    });

    if (!list) return { status: 0, message: 'Error finding depositions' };

    let userEventPresentList = await JSON.parse(JSON.stringify(list));

    if (userEventPresentList.length > 0) {
      return { status: 2, message: 'Event present for user' };
    } else {
      return { status: 1, message: 'no other event for selected user' };
    }
  } catch (e) {
    return { status: 0, message: e.message };
  }
};

exports.getAllPendingInvitation = async (status, role_id) => {
  let count = await JoiningRequest.count({ where: { status, role_id } });
  return count;
};
