import { body } from 'express-validator';

const createCouponValidator = () => {
  return [
    body('name').trim().notEmpty().withMessage('Coupon name is required'),
    body('couponCode').trim().notEmpty().withMessage('Coupon code is required'),
    body('type').trim().notEmpty().withMessage('Type is required'),
    body('discountValue')
      .isNumeric()
      .withMessage('Discount value must be a number')
      .notEmpty()
      .withMessage('discount value is required'),
    body('minimumCartValue')
      .notEmpty()
      .withMessage('minimum cart value is required')
      .isNumeric()
      .withMessage('Minimum cart value must be a number'),
    body('expiryDate')
      .optional()
      .isDate()
      .withMessage('Expiry date must be a valid date'),
    body('startDate')
      .optional()
      .isDate()
      .withMessage('Start date must be a valid date')
  ];
};

const updateCouponValidator = () => {
  return [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Coupon name is required'),
    body('couponCode')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Coupon code is required'),
    body('discountValue')
      .optional()
      .isNumeric()
      .withMessage('Discount value must be a number')
      .notEmpty()
      .withMessage('discount value is required')
  ];
};

export { createCouponValidator, updateCouponValidator };
