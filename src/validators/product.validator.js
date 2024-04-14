import { body, check } from 'express-validator';
import { isValidObjectId } from 'mongoose';
import { ApiError } from '../utils/ApiError.js';

const productIdValidator = (productId) => {
  if (!isValidObjectId(productId)) {
    throw new ApiError(409, 'product id is not valid');
  }
  return;
};

const createProductValidator = () => {
  return [
    body('name')
      .trim()
      .optional()
      .notEmpty()
      .withMessage('name is required')
      .isLength({ min: 2 })
      .withMessage('product name must be at least 2 characters'),
    body('description')
      .trim()
      .optional()
      .notEmpty()
      .withMessage('description is required')
      .isLength({ min: 15 })
      .withMessage('product description must be at least 2 characters'),
    body('price')
      .trim()
      .optional()
      .notEmpty()
      .withMessage('price is required')
      .isFloat({ min: 0 })
      .withMessage('price cant be less than 0'),
    body('stock')
      .trim()
      .optional()
      .notEmpty()
      .withMessage('stock is required')
      .isFloat({ min: 0 })
      .withMessage('stock cant be less than 0')
  ];
};

const updateProductValidator = () => {
  return [
    body('name')
      .trim()
      .optional()
      .notEmpty()
      .withMessage('name is required')
      .isLength({ min: 2 })
      .withMessage('product name must be at least 2 characters'),
    body('description')
      .trim()
      .optional()
      .notEmpty()
      .withMessage('description is required')
      .isLength({ min: 15 })
      .withMessage('product description must be at least 2 characters'),
    body('price')
      .trim()
      .optional()
      .notEmpty()
      .withMessage('price is required')
      .isFloat({ min: 0 })
      .withMessage('price cant be less than 0'),
    body('stock')
      .trim()
      .optional()
      .notEmpty()
      .withMessage('stock is required')
      .isFloat({ min: 0 })
      .withMessage('stock cant be less than 0')
  ];
};

export { createProductValidator, productIdValidator, updateProductValidator };
