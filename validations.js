import { body } from 'express-validator'

export const loginValidation = [
  body('email', 'Invalid e-mail format.').isEmail(),
  body(
    'password',
    'The password must contain at least one character.'
  ).isLength({ min: 1 }),
]

export const registerValidation = [
  body('email', 'Invalid e-mail format.').isEmail(),
  body(
    'password',
    'The password must contain at least one character.'
  ).isLength({ min: 1 }),
  body('fullName', 'Enter your name.').isLength({ min: 1 }),
]
