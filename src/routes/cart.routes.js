import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  addToCart,
  clearCart,
  getUserCart,
  removeFromCart,
  removeItemFromCart
} from '../controllers/cart.controller.js';

const router = Router();

router.route('/').get(verifyJWT, getUserCart);
router.route('/item/:productId').post(verifyJWT, addToCart);
router.route('/item/:productId').delete(verifyJWT, removeFromCart);
router.route('/clear').delete(verifyJWT, clearCart);
router.route('/remove/item/:productId').delete(verifyJWT, removeItemFromCart);

export default router;
