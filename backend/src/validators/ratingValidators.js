const { body, param, query } = require('express-validator');

const RATING_INT = { min: 1, max: 5 };

const ratingBodySchema = [
  body('rating')
    .exists({ checkFalsy: false })
    .withMessage('Rating is required.')
    .bail()
    .isInt(RATING_INT)
    .withMessage('Rating must be an integer between 1 and 5.'),
];

const storeIdParamSchema = [
  param('storeId').notEmpty().withMessage('Store id is required.').bail().isInt().withMessage('Store id must be an integer.'),
];

const ratingListQuerySchema = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
  query('sortBy')
    .optional()
    .trim()
    .isIn(['rating', 'createdAt', 'userName', 'userEmail'])
    .withMessage('sortBy must be one of: rating, createdAt, userName, userEmail.'),
  query('order').optional().trim().isIn(['asc', 'desc']).withMessage('order must be asc or desc.'),
];

module.exports = { ratingBodySchema, storeIdParamSchema, ratingListQuerySchema, RATING_INT };