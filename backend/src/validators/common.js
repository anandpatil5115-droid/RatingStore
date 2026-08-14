const { body } = require('express-validator');

const ROLE_VALUES = ['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'];

const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;
const PASSWORD_MESSAGE =
  'Password must be 8-16 characters long and include at least one uppercase letter and one special character.';

const name = body('name')
  .trim()
  .notEmpty()
  .withMessage('Name is required.')
  .bail()
  .isLength({ min: 20, max: 60 })
  .withMessage('Name must be between 20 and 60 characters.');

const email = body('email')
  .trim()
  .notEmpty()
  .withMessage('Email is required.')
  .bail()
  .isEmail()
  .withMessage('Please enter a valid email address.')
  .bail()
  .isLength({ max: 120 })
  .withMessage('Email must not exceed 120 characters.');

const address = body('address')
  .optional({ values: 'null' })
  .trim()
  .custom((value) => {
    if (value !== undefined && value !== null && value.length > 400) {
      throw new Error('Address must not exceed 400 characters.');
    }
    return true;
  });

const password = body('password')
  .notEmpty()
  .withMessage('Password is required.')
  .bail()
  .matches(PASSWORD_PATTERN)
  .withMessage(PASSWORD_MESSAGE);

const storeName = body('name')
  .trim()
  .notEmpty()
  .withMessage('Store name is required.')
  .bail()
  .isLength({ max: 60 })
  .withMessage('Store name must not exceed 60 characters.');

module.exports = {
  ROLE_VALUES,
  PASSWORD_PATTERN,
  PASSWORD_MESSAGE,
  name,
  email,
  address,
  password,
  storeName,
};