const ApiError = require('../utils/ApiError');
const { nodeEnv } = require('../config/env');

function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function normalizePrismaError(err) {
  const normalized = err;

  if (err.code === 'P2002') {
    normalized.statusCode = 409;
    const target = Array.isArray(err.meta && err.meta.target) ? err.meta.target : [err.meta && err.meta.target];
    normalized.message = target.some((t) => String(t).includes('email'))
      ? 'Email already exists.'
      : 'A record with the same unique value already exists.';
    return normalized;
  }
  if (err.code === 'P2025') {
    normalized.statusCode = 404;
    normalized.message = 'Record not found.';
    return normalized;
  }
  if (err.code === 'P2003') {
    normalized.statusCode = 400;
    normalized.message = 'Invalid reference: the related record does not exist.';
    return normalized;
  }
  return normalized;
}

function errorHandler(err, req, res, next) {
  const normalized = normalizePrismaError(err);

  const statusCode = normalized.statusCode || 500;
  const message = normalized.message || 'Something went wrong. Please try again.';

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('[Unhandled error]', err);
  }

  const body = { success: false, statusCode, message };
  if (normalized.details) body.details = normalized.details;
  if (nodeEnv === 'development' && statusCode >= 500 && err.stack) body.stack = err.stack;

  return res.status(statusCode).json(body);
}

module.exports = { notFound, errorHandler };