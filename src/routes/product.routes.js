import { Router } from 'express';
import { verifyADMIN, verifyJWT } from '../middlewares/auth.middleware.js';
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProduct,
  updateProduct
} from '../controllers/product.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { MAXIMUM_SUB_IMAGE_COUNT } from '../../constants.js';
import {
  createProductValidator,
  updateProductValidator
} from '../validators/product.validator.js';
import { validate } from '../utils/validate.js';

const router = Router();

router.route('/category/:categoryId').get(getProductsByCategory);
router.route('/').post(
  verifyJWT,
  verifyADMIN,
  createProductValidator(),
  validate,
  upload.fields([
    {
      name: 'mainImage',
      maxCount: 1
    },
    {
      name: 'subImages',
      maxCount: MAXIMUM_SUB_IMAGE_COUNT
    }
  ]),
  createProduct
);
router.route('/:productId').get(getProductById);
router.route('/:productId').patch(
  verifyJWT,
  verifyADMIN,
  updateProductValidator(),
  validate,
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    {
      name: 'subImages',
      maxCount: MAXIMUM_SUB_IMAGE_COUNT
    }
  ]),
  updateProduct
);
router.route('/:productId').delete(verifyJWT, verifyADMIN, deleteProduct);
router.route('/').get(getAllProducts);
router.route('/search').get(searchProduct);

export default router;
