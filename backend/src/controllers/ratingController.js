const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/ApiResponse');
const ratingService = require('../services/ratingService');
const storeService = require('../services/storeService');

const submitRating = asyncHandler(async (req, res) => {
  const storeId = parseInt(req.params.storeId, 10);
  const { rating } = req.body;
  const result = await ratingService.submitRating(storeId, req.user.id, rating);
  const store = await storeService.getStoreById(storeId, req.user.id);

  return success(res, {
    statusCode: result.created ? 201 : 200,
    message: result.created ? 'Rating submitted successfully.' : 'Your rating has been updated.',
    data: { rating: result.rating, store },
  });
});

const updateRating = asyncHandler(async (req, res) => {
  const storeId = parseInt(req.params.storeId, 10);
  const { rating } = req.body;
  const result = await ratingService.updateRating(storeId, req.user.id, rating);
  const store = await storeService.getStoreById(storeId, req.user.id);

  return success(res, {
    message: 'Your rating has been updated.',
    data: { rating: result.rating, store },
  });
});

/* Owner: only for their own store (403 otherwise). Admin: any store. */
const getStoreRatings = asyncHandler(async (req, res) => {
  const storeId = parseInt(req.params.storeId, 10);
  const result = await ratingService.listStoreRatings(storeId, req.query, {
    ownerId: req.user.role === 'STORE_OWNER' ? req.user.id : null,
  });
  return success(res, { message: 'Ratings fetched successfully.', data: result });
});

module.exports = { submitRating, updateRating, getStoreRatings };