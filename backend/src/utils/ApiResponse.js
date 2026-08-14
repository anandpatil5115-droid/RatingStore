function success(res, { statusCode = 200, message, data } = {}) {
  const body = { success: true, statusCode };
  if (message !== undefined) body.message = message;
  if (data !== undefined) body.data = data;
  return res.status(statusCode).json(body);
}

function created(res, message, data) {
  return success(res, { statusCode: 201, message, data });
}

module.exports = { success, created };