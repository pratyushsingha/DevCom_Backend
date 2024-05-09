import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { createReviewValidator } from '../validators/review.validator.js';
import {
  createReview,
  deleteReview,
  getReviewsById,
} from '../controllers/review.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { validate } from '../utils/validate.js';
import { MAXIMUM_SUB_IMAGE_COUNT } from '../../constants.js';

const router = Router();

router.use(verifyJWT);
router.route('/:productId').post(
  // createReviewValidator(),
  // validate,
  upload.fields([
    {
      name: 'productImage',
      maxCount: MAXIMUM_SUB_IMAGE_COUNT
    }
  ]),
  createReview
);
router.route('/:productId').delete(deleteReview);
router.route('/:productId').get(getReviewsById);

export default router;
