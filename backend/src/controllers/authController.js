const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/ApiResponse');
const authService = require('../services/authService');

const register = asyncHandler(async (req, res) => {
  const { name, email, address, password } = req.body;
  const result = await authService.register({ name, email, address, password });
  return created(res, 'Account created successfully. Welcome!', result);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  return success(res, {
    message: 'Logged in successfully.',
    data: result,
  });
});

const logout = asyncHandler(async (req, res) => {
  return success(res, {
    message: 'Logged out successfully.',
    data: { loggedOut: true },
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await authService.changePassword(req.user.id, { currentPassword, newPassword });
  return success(res, {
    message: 'Password updated successfully.',
    data: { user },
  });
});

module.exports = { register, login, logout, changePassword };