const jwt = require('jsonwebtoken');

const { jwtSecret } = require('../config/env');
const ApiError = require('../utils/ApiError');

function authenticateUser(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'Authentication required. Please log in.'));
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
    return next();
  } catch {
    return next(new ApiError(401, 'Invalid or expired token. Please log in again.'));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required. Please log in.'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden: You do not have permission to perform this action.'));
    }
    return next();
  };
}

module.exports = { authenticateUser, requireRole };