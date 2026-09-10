import { body } from 'express-validator';

export const updateProfileValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  body('bio').optional().isString().isLength({ max: 500 }).withMessage('Bio must be under 500 characters'),
  body('categories').optional().isArray().withMessage('Categories must be a list'),
  body('skills').optional().isArray().withMessage('Skills must be a list'),
  body('experienceYears')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Experience must be a positive number'),
  body('location').optional().isObject().withMessage('Location must be an object'),
];
