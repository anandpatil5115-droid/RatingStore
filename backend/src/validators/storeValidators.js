const { body, param, query } = require('express-validator');

const { storeName, email, address } = require('./common');

const createStoreSchema = [
  storeName,
  email,
  address,
  body('ownerId')
    .notEmpty()
    .withMessage('Store owner is required.')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Owner id must be a positive integer.'),
];

const storeIdParamSchema = [
  param('id').notEmpty().withMessage('Store id is required.').bail().isInt().withMessage('Store id must be an integer.'),
];

const storeListQuerySchema = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
  query('search').optional().isString().isLength({ max: 120 }).withMessage('Search term is too long.'),
  query('sortBy')
    .optional()
    .trim()
    .isIn(['name', 'email', 'address', 'rating', 'createdAt'])
    .withMessage('sortBy must be one of: name, email, address, rating, createdAt.'),
  query('order').optional().trim().isIn(['asc', 'desc']).withMessage('order must be asc or desc.'),
];

module.exports = { createStoreSchema, storeIdParamSchema, storeListQuerySchema };