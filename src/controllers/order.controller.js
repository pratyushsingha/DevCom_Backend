import { Address } from '../../models/address.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { getCart } from './cart.controller.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { nanoid } from 'nanoid';
import { Order } from '../../models/order.model.js';
import { Cart } from '../../models/cart.model.js';
import mongoose from 'mongoose';
import { getMongoosePaginationOptions } from '../utils/helper.js';

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const checkout = asyncHandler(async (req, res) => {
  const { addressId } = req.body;

  const address = await Address.findOne({
    owner: req.user._id,
    _id: addressId
  });

  if (!address) {
    throw new ApiError(403, 'address not found');
  }

  const userCart = await Cart.findOne({
    owner: req.user._id
  });
  console.log(userCart);
  if (!userCart || !userCart.items?.length) {
    throw new ApiError(400, 'cart is empty');
  }
  const orderItems = userCart.items;
  const cart = await getCart(req.user._id);

  const options = {
    amount: cart.discountCartValue * 100,
    currency: 'INR',
    receipt: nanoid(10)
  };

  instance.orders.create(options, async function (err, razorpayOrder) {
    if (!razorpayOrder || (err && err.error)) {
      return res
        .status(err.statusCode)
        .json(
          new ApiResponse(
            err.statusCode,
            null,
            err.error.reason ||
              'Something went wrong while initialising the razorpay order.'
          )
        );
    }

    const unpaidOrder = await Order.create({
      address: addressId,
      customer: req.user._id,
      items: orderItems,
      orderPrice: cart.cartTotal ?? 0,
      disCountedOrderPrice: cart.discountCartValue ?? 0,
      paymentId: razorpayOrder.id,
      coupon: cart.coupon?._id,
      owner: req.user._id
    });
    if (unpaidOrder) {
      return res
        .status(200)
        .json(new ApiResponse(200, razorpayOrder, 'Razorpay order generated'));
    } else {
      return res
        .status(500)
        .json(
          new ApiResponse(
            500,
            null,
            'Something went wrong while initialising the razorpay order.'
          )
        );
    }
  });
});

const orderVerification = asyncHandler(async (req, res) => {
  const {
    orderCreationId,
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature
  } = req.body;

  const shasum = crypto.createHmac('sha256', 'hdheuh37ehr4urhrj');
  shasum.update(`${orderCreationId}|${razorpayPaymentId}`);

  const digest = shasum.digest('hex');
  if (digest !== razorpaySignature) {
    throw new ApiError(400, 'transaction not legit');
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId
      },
      'payment verified successfully'
    )
  );
});

const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(orderId)
      }
    },
    {
      $lookup: {
        from: 'addresses',
        localField: 'address',
        foreignField: '_id',
        as: 'address'
      }
    },
    {
      $lookup: {
        from: 'coupons',
        localField: 'coupon',
        foreignField: '_id',
        as: 'coupon',
        pipeline: [
          {
            $project: {
              _id: 1,
              couponCode: 1,
              name: 1
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'customer',
        pipeline: [
          {
            $project: {
              _id: 1,
              email: 1,
              username: 1
            }
          }
        ]
      }
    },
    {
      $unwind: '$items'
    },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'items.product'
      }
    },
    {
      $unwind: '$items.product'
    },

    {
      $group: {
        _id: '$_id',
        orderPrice: { $first: '$orderPrice' },
        disCountedOrderPrice: {
          $first: '$disCountedOrderPrice'
        },
        customer: { $first: '$customer' },
        coupon: { $first: '$coupon' },
        address: { $first: '$address' },
        items: { $push: '$items' }
      }
    },
    {
      $project: {
        _id: 1,
        orderPrice: 1,
        disCountedOrderPrice: 1,
        customer: { $first: '$customer' },
        coupon: {
          $ifNull: [{ $first: '$coupon' }, 'Nil']
        },
        address: { $first: '$address' },
        items: 1
      }
    }
  ]);

  if (!order) {
    throw new ApiError(
      500,
      'something went wrong while fetching the order Details'
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, order, 'order details fetched successfully'));
});

const orderListAdmin = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;

  const orderAggregate = await Order.aggregate([
    {
      $lookup: {
        from: 'coupons',
        localField: 'coupon',
        foreignField: '_id',
        as: 'coupon',
        pipeline: [
          {
            $project: {
              _id: 1,
              couponCode: 1,
              name: 1
            }
          }
        ]
      }
    },
    {
      $lookup: {
        from: 'addresses',
        localField: 'address',
        foreignField: '_id',
        as: 'address'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'customer',
        pipeline: [
          {
            $project: {
              _id: 1,
              email: 1,
              username: 1
            }
          }
        ]
      }
    },
    {
      $project: {
        _id: 1,
        orderPrice: 1,
        disCountedOrderPrice: 1,
        items: 1,
        customer: { $first: '$customer' },
        address: { $first: '$address' },
        coupon: {
          $ifNull: [
            {
              $first: '$coupon'
            },
            'Nil'
          ]
        },
        isPAymentDone: 1,
        status: 1,
        paymentId: 1
      }
    }
  ]);

  const orderList = await Order.aggregatePaginate(
    orderAggregate,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: 'OrderList',
        docs: 'orders'
      }
    })
  );

  if (!orderList) {
    throw new ApiError(
      500,
      'something went wrong while fetching the order list'
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(200, orderList, 'order list fetched successfully'));
});

export { checkout, orderVerification, getOrderById,orderListAdmin };
