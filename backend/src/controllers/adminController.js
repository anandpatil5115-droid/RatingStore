const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const adminService = require('../services/adminService');

const getDashboard = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  return success(res, { message: 'Dashboard stats fetched successfully.', data: stats });
});

module.exports = { getDashboard };