const router = require('express').Router();

const adminController = require('../controllers/adminController');
const { authenticateUser, requireRole } = require('../middleware/auth');

router.use(authenticateUser, requireRole('SYSTEM_ADMIN'));

router.get('/dashboard', adminController.getDashboard);

module.exports = router;