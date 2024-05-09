import { Router } from 'express';
import { verifyADMIN, verifyJWT } from '../middlewares/auth.middleware.js';
import {
  getAllAdminCategories,
  getAllAdminCoupons,
  getAllAdminProducts
} from '../controllers/admin.controller.js';

const router = Router();

router.route('/products').get(verifyJWT, verifyADMIN, getAllAdminProducts);
router.route('/categories').get(verifyJWT, verifyADMIN, getAllAdminCategories);
router.route('/coupons').get(verifyJWT, verifyADMIN, getAllAdminCoupons);

export default router;
