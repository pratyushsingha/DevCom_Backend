import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist
} from '../controllers/wishlist.controller.js';

const router = Router();

router.route('/').get(verifyJWT, getMyWishlist);
router.route('/:productId').post(verifyJWT, addToWishlist);
router.route('/:productId').delete(verifyJWT, removeFromWishlist);

export default router;
