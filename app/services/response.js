exports.sendSuccessResponse = (res, message, data) => {
  return res.status(200).send({ status: true, message, data });
};

exports.sendFailResponse = (res, message, errorCode) => {
  return res.status(errorCode).send({ status: false, message });
};
