const router = require('express').Router();

const ratingController = require('../controllers/ratingController');
const { authenticateUser, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  ratingBodySchema,
  storeIdParamSchema,
  ratingListQuerySchema,
} = require('../validators/ratingValidators');

router.get(
  '/:storeId/ratings',
  authenticateUser,
  requireRole('SYSTEM_ADMIN', 'STORE_OWNER'),
  storeIdParamSchema,
  ratingListQuerySchema,
  validate,
  ratingController.getStoreRatings
);

router.post(
  '/:storeId/ratings',
  authenticateUser,
  requireRole('NORMAL_USER'),
  storeIdParamSchema,
  ratingBodySchema,
  validate,
  ratingController.submitRating
);

router.put(
  '/:storeId/ratings',
  authenticateUser,
  requireRole('NORMAL_USER'),
  storeIdParamSchema,
  ratingBodySchema,
  validate,
  ratingController.updateRating
);

module.exports = router;