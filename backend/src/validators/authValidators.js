const { body } = require('express-validator');

const { name, email, address, password, PASSWORD_PATTERN, PASSWORD_MESSAGE } = require('./common');

const registerSchema = [
  name,
  email,
  address,
  password,
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required.')
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),
];

const loginSchema = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required.')
    .bail()
    .isEmail()
    .withMessage('Please enter a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

const changePasswordSchema = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required.')
    .bail()
    .matches(PASSWORD_PATTERN)
    .withMessage(PASSWORD_MESSAGE),
  body('confirmNewPassword')
    .notEmpty()
    .withMessage('Confirm new password is required.')
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New passwords do not match.');
      }
      return true;
    }),
];

module.exports = { registerSchema, loginSchema, changePasswordSchema };