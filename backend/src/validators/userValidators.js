const { body, param, query } = require('express-validator');

const { name, email, address, password, ROLE_VALUES } = require('./common');

const createUserSchema = [
  name,
  email,
  address,
  password,
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required.')
    .bail()
    .isIn(ROLE_VALUES)
    .withMessage('Role must be one of: SYSTEM_ADMIN, NORMAL_USER, STORE_OWNER.'),
];

const userIdParamSchema = [
  param('id').notEmpty().withMessage('User id is required.').bail().isInt().withMessage('User id must be an integer.'),
];

const userListQuerySchema = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
  query('search').optional().isString().isLength({ max: 120 }).withMessage('Search term is too long.'),
  query('role')
    .optional()
    .trim()
    .isIn(ROLE_VALUES)
    .withMessage('Role filter must be one of: SYSTEM_ADMIN, NORMAL_USER, STORE_OWNER.'),
  query('sortBy')
    .optional()
    .trim()
    .isIn(['name', 'email', 'address', 'role', 'createdAt'])
    .withMessage('sortBy must be one of: name, email, address, role, createdAt.'),
  query('order').optional().trim().isIn(['asc', 'desc']).withMessage('order must be asc or desc.'),
];

module.exports = { createUserSchema, userIdParamSchema, userListQuerySchema };