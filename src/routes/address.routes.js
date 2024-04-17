import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  createAddress,
  deleteAddress,
  getAddressById,
  getAllAddresses,
  updateAddress
} from '../controllers/address.controller.js';
import {
  createAddressValidator,
  updateAddressValidator
} from '../validators/address.validator.js';
import { validate } from '../utils/validate.js';

const router = Router();

router.use(verifyJWT);

router.route('/').get(getAllAddresses);
router.route('/').post(createAddressValidator(), validate, createAddress);
router
  .route('/:addressId')
  .patch(updateAddressValidator(), validate, updateAddress);
router.route('/:addressId').delete(deleteAddress);
router.route('/:addressId').get(getAddressById);

export default router;
