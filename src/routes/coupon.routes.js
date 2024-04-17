import { Router, application } from 'express';
import { verifyADMIN, verifyJWT } from '../middlewares/auth.middleware.js';
import {
  createCouponValidator,
  updateCouponValidator
} from '../validators/coupon.validator.js';
import { validate } from '../utils/validate.js';
import {
  applyCoupon,
  couponActiveStatus,
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  getAvailableCouponCodes,
  getCouponById,
  removeCoupon,
  updateCoupon
} from '../controllers/coupon.controller.js';

const router = Router();

router.route('/').get(verifyJWT, getAllCoupons);
router
  .route('/')
  .post(
    verifyJWT,
    verifyADMIN,
    createCouponValidator(),
    validate,
    createCoupon
  );
router
  .route('/:couponId')
  .patch(
    verifyJWT,
    verifyADMIN,
    updateCouponValidator(),
    validate,
    updateCoupon
  );
router.route('/:couponId').get(verifyJWT, getCouponById);
router.route('/:couponId').delete(verifyJWT, verifyADMIN, deleteCoupon);
router.route('/customer/available').get(verifyJWT, getAvailableCouponCodes);
router
  .route('/status/:couponId')
  .patch(verifyJWT, verifyADMIN, couponActiveStatus);
router.route('/c/apply').post(verifyJWT, applyCoupon);
router.route('/c/remove').post(verifyJWT, removeCoupon);
export default router;
