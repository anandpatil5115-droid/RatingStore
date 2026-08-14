const router = require('express').Router();

const userController = require('../controllers/userController');
const { authenticateUser, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createUserSchema,
  userIdParamSchema,
  userListQuerySchema,
} = require('../validators/userValidators');

router.get('/me', authenticateUser, userController.getCurrentUser);

router.use(authenticateUser, requireRole('SYSTEM_ADMIN'));

router.get('/', userListQuerySchema, validate, userController.listUsers);
router.get('/:id', userIdParamSchema, validate, userController.getUserById);
router.post('/', createUserSchema, validate, userController.createUser);

module.exports = router;