import { body } from 'express-validator';
import { isValidObjectId } from 'mongoose';
import { ApiError } from '../utils/ApiError.js';

const categoryIdValidator = (categoryId) => {
  if (!isValidObjectId(categoryId)) {
    throw new ApiError(500, 'category Id is not valid');
  }
  return;
};

const createCategoryValidator = () => {
  return [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('category is required')
      .isLength({ min: 2 })
      .withMessage('category must have atleast 2 charracters')
  ];
};

export { createCategoryValidator, categoryIdValidator };
