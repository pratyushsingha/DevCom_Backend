import { body } from 'express-validator';

const createReviewValidator = () => {
  return [
    body('reviewDescription')
      .trim()
      .optional()
      .isLength({ min: 2 })
      .withMessage('must be atleast 10 words'),
    body('starRatting')
      .notEmpty()
      .withMessage('Ratting is required')
      .trim()
      .isNumeric()
      .withMessage('ratting should be a number')
      // .isLength({ min: 1 })
      // .withMessage('ratting can not be greater than 5 or less than 0')
  ];
};

export { createReviewValidator };
