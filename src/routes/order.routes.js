import { Router } from 'express';
import { verifyADMIN, verifyJWT } from '../middlewares/auth.middleware.js';
import {
  checkout,
  getOrderById,
  orderListAdmin,
  orderVerification
} from '../controllers/order.controller.js';

const router = Router();

router.use(verifyJWT);

router.route('/provider/razorpay').post(checkout);
router.route('/provider/razorpay/verify-payment').post(orderVerification);
router.route('/').get(getOrderById);
router.route('/list/admin').get(verifyADMIN, orderListAdmin);

export default router;
