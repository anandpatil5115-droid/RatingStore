const router = require('express').Router();

const storeOwnerController = require('../controllers/storeOwnerController');
const { authenticateUser, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { ratingListQuerySchema } = require('../validators/ratingValidators');

router.use(authenticateUser, requireRole('STORE_OWNER'));

router.get('/dashboard', storeOwnerController.getDashboard);
router.get('/ratings', ratingListQuerySchema, validate, storeOwnerController.getMyRatings);

module.exports = router;