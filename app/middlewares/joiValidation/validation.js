function validateDto(validation) {
  return (req, res, next) => {
    const { error } = validation.validate(req.body);
    if (error) {
      return res.status(406).json({ message: error.message });
    } else {
      next();
    }
  };
}

function validateParam(validation) {
  return (req, res, next) => {
    const { error } = validation.validate(req.params);
    if (error) {
      return res.status(406).json({ message: error.message });
    } else {
      next();
    }
  };
}

function validateQuery(validation) {
  return (req, res, next) => {
    const { error } = validation.validate(req.query);
    if (error) {
      return res.status(406).json({ message: error.message });
    } else {
      next();
    }
  };
}

module.exports = {
  validateDto,
  validateParam,
  validateQuery
};
