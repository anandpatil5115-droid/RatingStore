const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/ApiResponse');
const userService = require('../services/userService');

const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  return success(res, { message: 'Users fetched successfully.', data: result });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(parseInt(req.params.id, 10));
  return success(res, { message: 'User fetched successfully.', data: { user } });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await userService.getCurrentUser(req.user.id);
  return success(res, { message: 'Profile fetched successfully.', data: { user } });
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, address, password, role } = req.body;
  const user = await userService.createUser({ name, email, address, password, role });
  return created(res, 'User created successfully.', { user });
});

module.exports = { listUsers, getUserById, getCurrentUser, createUser };