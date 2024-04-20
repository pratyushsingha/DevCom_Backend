import { Router } from 'express';
import { verifyADMIN, verifyJWT } from '../middlewares/auth.middleware.js';
import {
  checkout,
  getOrderById,
  myOrders,
  orderListAdmin,
  orderVerification,
  updateOrderStatus
} from '../controllers/order.controller.js';

const router = Router();

router.use(verifyJWT);

router.route('/provider/razorpay').post(checkout);
router.route('/provider/razorpay/verify-payment').post(orderVerification);
router.route('/:orderId').get(getOrderById);
router.route('/list/admin').get(verifyADMIN, orderListAdmin);
router.route('/my-orders').get(myOrders);
router.route('/status/:orderId').patch(verifyADMIN, updateOrderStatus);

export default router;
