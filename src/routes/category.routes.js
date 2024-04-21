import { Router } from 'express';
import { verifyADMIN, verifyJWT } from '../middlewares/auth.middleware.js';
import { createCategoryValidator } from '../validators/category.validator.js';
import { validate } from '../utils/validate.js';
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory
} from '../controllers/category.controller.js';

const router = Router();

router.route('/').get(getAllCategories);
router
  .route('/')
  .post(
    verifyJWT,
    verifyADMIN,
    createCategoryValidator(),
    validate,
    createCategory
  );
router
  .route('/:categoryId')
  .patch(
    verifyJWT,
    verifyADMIN,
    createCategoryValidator(),
    validate,
    updateCategory
  );
router.route('/:categoryId').get(verifyJWT, getCategoryById);
router.route('/:categoryId').delete(verifyJWT, verifyADMIN, deleteCategory);

export default router;
