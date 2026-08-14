const { validationResult } = require('express-validator');

const ApiError = require('../utils/ApiError');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({
      field: e.param,
      message: e.msg,
      location: e.location,
    }));
    return next(new ApiError(400, errors.array()[0].msg, details));
  }
  return next();
}

module.exports = { validate };