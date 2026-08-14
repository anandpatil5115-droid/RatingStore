const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/ApiResponse');
const storeService = require('../services/storeService');

const listStores = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'SYSTEM_ADMIN';
  const result = await storeService.listStores({
    ...req.query,
    searchFields: isAdmin ? ['name', 'email', 'address'] : ['name', 'address'],
    userId: isAdmin ? null : req.user.id,
  });
  return success(res, { message: 'Stores fetched successfully.', data: result });
});

const getStoreById = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'SYSTEM_ADMIN';
  const store = await storeService.getStoreById(parseInt(req.params.id, 10), isAdmin ? null : req.user.id);
  return success(res, { message: 'Store fetched successfully.', data: { store } });
});

const createStore = asyncHandler(async (req, res) => {
  const { name, email, address, ownerId } = req.body;
  const store = await storeService.createStore({ name, email, address, ownerId });
  return created(res, 'Store created successfully.', { store });
});

module.exports = { listStores, getStoreById, createStore };