const router = require('express').Router();

const authController = require('../controllers/authController');
const { registerSchema, loginSchema, changePasswordSchema } = require('../validators/authValidators');
const { validate } = require('../middleware/validate');
const { authenticateUser } = require('../middleware/auth');

router.post('/register', registerSchema, validate, authController.register);
router.post('/login', loginSchema, validate, authController.login);
router.post('/logout', authenticateUser, authController.logout);
router.put('/password', authenticateUser, changePasswordSchema, validate, authController.changePassword);

module.exports = router;