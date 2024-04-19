import { Cart } from '../../models/cart.model.js';
import { Coupon } from '../../models/coupon.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { getMongoosePaginationOptions } from '../utils/helper.js';
import { getCart } from './cart.controller.js';

export const getCoupons = async () => {
  const AllCoupons = await Coupon.aggregate([
    {
      $match: {}
    }
  ]);
  if (AllCoupons.length > 0) {
    return AllCoupons;
  } else {
    return {
      AllCoupons: []
    };
  }
};

const createCoupon = asyncHandler(async (req, res) => {
  const {
    name,
    couponCode,
    type,
    discountValue,
    minimumCartValue,
    expiryDate,
    startDate
  } = req.body;

  const couponExists = await Coupon.findOne({
    $or: [{ name }, { couponCode }],
    owner: req.user._id
  });
  if (couponExists) {
    throw new ApiError(409, 'coupon already exists');
  }

  if (discountValue >= minimumCartValue) {
    throw new ApiError(
      409,
      "Discount price can't be greater than Minimum cart price"
    );
  }

  const coupon = await Coupon.create({
    name,
    couponCode,
    type,
    discountValue,
    minimumCartValue,
    expiryDate,
    startDate,
    owner: req.user._id
  });

  if (!coupon) {
    throw new ApiError(500, 'something went wrong while creating the coupon');
  }

  return res
    .status(201)
    .json(new ApiResponse(200, coupon, 'coupon created succefully'));
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;
  const { couponCode, discountValue, name } = req.body;

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }

  if (coupon.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not the owner of the coupon');
  }

  const couponExists = await Coupon.findOne({
    couponCode,
    owner: req.user._id
  });
  if (couponExists) {
    throw new ApiError(409, 'Coupon with this name or code already exists');
  }
  const updatedCoupon = await Coupon.findByIdAndUpdate(
    coupon._id,
    {
      $set: {
        couponCode,
        name,
        discountValue
      }
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCoupon, 'Coupon updated successfully'));
});

const getCouponById = asyncHandler(async (req, res) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    throw new ApiError(409, "coupon doesn't exists");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, coupon, 'coupon details fetched successfully'));
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    throw new ApiError(404, "coupon doesn't exists");
  }

  if (coupon.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'u are not the authorized owner');
  }

  await Coupon.findByIdAndDelete(couponId);

  return res
    .status(201)
    .json(new ApiResponse(200, coupon, 'coupon deleted Successfully'));
});

const getAllCoupons = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const couponAggregate = await Coupon.aggregate([
    {
      $match: {}
    }
  ]);

  const coupons = await Coupon.aggregatePaginate(
    couponAggregate,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: 'AllCoupons',
        docs: 'coupons'
      }
    })
  );

  return res
    .status(201)
    .json(new ApiResponse(200, coupons, 'coupons fetched successfully'));
});

const getAvailableCouponCodes = asyncHandler(async (req, res) => {
  const cart = await getCart(req.user._id);
  const coupons = await getCoupons();

  const availableCoupons = coupons.filter(
    (coupon) => coupon.minimumCartValue <= cart.cartTotal
  );

  if (availableCoupons.length === 0) {
    throw new ApiError(422, 'Add more item to avail coupon');
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        availableCoupons,
        'available coupons fetched successfully'
      )
    );
});

const couponActiveStatus = asyncHandler(async (req, res) => {
  const { couponId } = req.params;
  const { isActive } = req.body;

  const coupon = await Coupon.findById(couponId);

  if (!coupon) {
    throw new ApiError(403, "coupon doesn't exists");
  }

  if (coupon.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(409, 'u are not the owner of this coupon');
  }
  coupon.isActive = isActive;
  await coupon.save();

  return res
    .status(201)
    .json(new ApiResponse(200, coupon, 'coupon updated successfully'));
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { couponCode } = req.body;
  const cart = await getCart(req.user._id);

  const coupon = await Coupon.findOne({ couponCode });
  if (!coupon) {
    throw new ApiError(403, 'invalid coupon');
  }

  if (cart.cartTotal < coupon.minimumCartValue) {
    throw new ApiError(
      422,
      `add products of ${coupon.minimumCartValue - cart.cartTotal} to avail this coupon`
    );
  }

  const appliedCoupon = await Cart.findOneAndUpdate(
    { owner: req.user._id },
    {
      $set: {
        coupon: coupon._id
      }
    },
    { new: true }
  );

  if (!appliedCoupon) {
    throw new ApiError(500, 'something went wrong while appling the coupon');
  }

  const newCart = await getCart(req.user._id);

  return res
    .status(201)
    .json(new ApiResponse(200, newCart, 'coupon applied successfully'));
});

const removeCoupon = asyncHandler(async (req, res) => {
  const { couponCode } = req.body;

  // const cart = await getCart(req.user._id);

  const coupon = await Coupon.findOne({ couponCode });

  if (!coupon) {
    throw new ApiError(403, 'invalid coupon');
  }

  const removedCoupon = await Cart.findOneAndUpdate(
    { owner: req.user._id },
    {
      $unset: { coupon: coupon._id }
    },
    { new: true }
  );

  if (!removedCoupon) {
    throw new ApiError(500, 'soomething went wrong while appling the coupon');
  }

  const newCart = await getCart(req.user._id);

  return res
    .status(201)
    .json(new ApiResponse(200, newCart, 'Coupon removed successfully'));
});

export {
  createCoupon,
  updateCoupon,
  getCouponById,
  deleteCoupon,
  getAllCoupons,
  getAvailableCouponCodes,
  couponActiveStatus,
  applyCoupon,
  removeCoupon
};
