import { body } from 'express-validator';

const createAddressValidator = () => {
  return [
    body('addressLine1').notEmpty().withMessage('Address Line 1 is required'),

    body('addressLine2')
      .optional()
      .notEmpty()
      .withMessage('Address Line 2 must not be empty'),

    body('city').notEmpty().withMessage('City is required'),

    body('state').notEmpty().withMessage('State is required'),

    body('pincode')
      .isInt({ min: 100000, max: 999999 })
      .withMessage('Pincode must be a 6-digit number'),

    body('country').notEmpty().withMessage('Country is required')
  ];
};
const updateAddressValidator = () => {
  return [
    body('addressLine1')
      .optional()
      .notEmpty()
      .withMessage('Address Line 1 is required'),

    body('addressLine2')
      .optional()
      .notEmpty()
      .withMessage('Address Line 2 must not be empty'),

    body('city').optional().notEmpty().withMessage('City is required'),

    body('state').optional().notEmpty().withMessage('State is required'),

    body('pincode')
      .optional()
      .isInt({ min: 100000, max: 999999 })
      .withMessage('Pincode must be a 6-digit number'),

    body('country').optional().notEmpty().withMessage('Country is required')
  ];
};

export { createAddressValidator, updateAddressValidator };
