const { sendFailResponse, sendSuccessResponse } = require('../../services/response');
const Availability = require('../../models').availability_timings;
// const Agency = require('../../models').clients;

exports.changeAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    const { availabilityArr } = req.body;
    for (let availability of availabilityArr) {
      const { day, startTime, endTime } = availability;
      const availabilityData = await Availability.findOne({
        where: { clientId: userId, day: day }
      });
      if (!availabilityData) {
        return sendFailResponse(res, 'Availability not found', 400);
      }
      availabilityData.startTime = startTime;
      availabilityData.endTime = endTime;
      await availabilityData.save();
    }
    const availability = await Availability.findAll({
      where: { clientId: userId },
      order: [['rank', 'ASC']]
    });
    return sendSuccessResponse(res, 'Availability set successfully', availability);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};

exports.getAvailability = async (req, res) => {
  try {
    const user = req.user;
    // const associatedClients = await Agency.findAll({ where: { roleId: 6 } });
    // for (let client of associatedClients) {
    //   await Availability.bulkCreate([
    //     { day: 'monday', startTime: '09:00', endTime: '18:00', clientId: client.id, rank: 1 },
    //     { day: 'tuesday', startTime: '09:00', endTime: '18:00', clientId: client.id, rank: 2 },
    //     { day: 'wednesday', startTime: '09:00', endTime: '18:00', clientId: client.id, rank: 3 },
    //     { day: 'thursday', startTime: '09:00', endTime: '18:00', clientId: client.id, rank: 4 },
    //     { day: 'friday', startTime: '09:00', endTime: '18:00', clientId: client.id, rank: 5 },
    //     { day: 'saturday', startTime: null, endTime: null, clientId: client.id, rank: 6 },
    //     { day: 'sunday', startTime: null, endTime: null, clientId: client.id, rank: 7 }
    //   ]);
    // }
    const availability = await Availability.findAll({
      where: { clientId: user.id },
      order: [['rank', 'ASC']]
    });

    return sendSuccessResponse(res, 'Availability fetched successfully', availability);
  } catch (err) {
    return sendFailResponse(res, err.message, 500);
  }
};
