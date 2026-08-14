const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const storeOwnerService = require('../services/storeOwnerService');

const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await storeOwnerService.getDashboard(req.user.id);
  return success(res, { message: 'Dashboard fetched successfully.', data: dashboard });
});

const getMyRatings = asyncHandler(async (req, res) => {
  const result = await storeOwnerService.listMyStoreRatings(req.user.id, req.query);
  return success(res, { message: 'Ratings fetched successfully.', data: result });
});

module.exports = { getDashboard, getMyRatings };