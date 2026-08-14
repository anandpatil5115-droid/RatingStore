const router = require('express').Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const storeRoutes = require('./storeRoutes');
const ratingRoutes = require('./ratingRoutes');
const adminRoutes = require('./adminRoutes');
const storeOwnerRoutes = require('./storeOwnerRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/stores', storeRoutes);
router.use('/stores', ratingRoutes);
router.use('/admin', adminRoutes);
router.use('/store-owner', storeOwnerRoutes);

module.exports = router;