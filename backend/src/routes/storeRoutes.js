const router = require('express').Router();

const storeController = require('../controllers/storeController');
const { authenticateUser, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createStoreSchema, storeIdParamSchema, storeListQuerySchema } = require('../validators/storeValidators');

router.get('/', authenticateUser, storeListQuerySchema, validate, storeController.listStores);
router.get('/:id', authenticateUser, storeIdParamSchema, validate, storeController.getStoreById);

router.post('/', authenticateUser, requireRole('SYSTEM_ADMIN'), createStoreSchema, validate, storeController.createStore);

module.exports = router;