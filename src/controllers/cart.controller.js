import mongoose from 'mongoose';
import { Cart } from '../../models/cart.model.js';
import { Product } from '../../models/product.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { getMongoosePaginationOptions } from '../utils/helper.js';
import { productIdValidator } from '../validators/product.validator.js';

export const getCart = async (userId) => {
  const cartAggregate = await Cart.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $unwind: {
        path: '$items'
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $project: {
        product: { $first: '$product' },
        quantity: '$items.quantity',
        coupon: 1
      }
    },
    {
      $group: {
        _id: null,
        items: {
          $push: '$$ROOT'
        },
        cartTotal: {
          $sum: {
            $multiply: ['$product.price', '$quantity']
          }
        },
        coupon: { $first: '$coupon' }
      }
    },
    {
      $lookup: {
        from: 'coupons',
        localField: 'coupon',
        foreignField: '_id',
        as: 'coupon'
      }
    },
    {
      $addFields: {
        coupon: { $first: '$coupon' }
      }
    },
    {
      $addFields: {
        discountCartValue: {
          $ifNull: [
            {
              $subtract: ['$cartTotal', '$coupon.discountValue']
            },
            '$cartTotal'
          ]
        }
      }
    }
  ]);

  if (cartAggregate.length > 0) {
    return cartAggregate[0];
  } else {
    return {
      _id: null,
      items: [],
      cartTotal: 0
    };
  }
};

const addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity = 1 } = req.body;
  productIdValidator(productId);

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (product.stock < quantity) {
    throw new ApiError(
      400,
      product.stock > 0
        ? `Only ${product.stock} are remaining but you are adding ${quantity}`
        : 'Product is out of stock'
    );
  }

  let updateProductQuantity;

  const cart = await Cart.findOne({ owner: req.user._id });

  if (!cart) {
    updateProductQuantity = await Cart.create({
      items: [{ product: productId, quantity }],
      owner: req.user._id
    });
  } else {
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId.toString()
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
    updateProductQuantity = cart;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updateProductQuantity,
        'Product added to cart successfully'
      )
    );
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity = 1 } = req.body;

  productIdValidator(productId);

  const cart = await Cart.findOne({ owner: req.user._id });

  if (!cart) {
    throw new ApiError(403, 'Cart is empty');
  }

  // console.log(cart.items)
  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingItemIndex === -1) {
    throw new ApiError(422, 'Product is not added in cart');
  }

  const existingItem = cart.items[existingItemIndex];

  if (existingItem.quantity <= quantity) {
    cart.items.splice(existingItemIndex, 1);
  } else {
    existingItem.quantity -= quantity;
  }

  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, 'Product removed from cart successfully'));
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({
    owner: req.user._id
  });

  console.log(cart);

  if (!cart) {
    throw new ApiError(403, 'cart is empty');
  }

  cart.items = [];
  await cart.save();

  return res
    .status(201)
    .json(new ApiResponse(200, cart, 'cart cleared successfully'));
});

const getUserCart = asyncHandler(async (req, res) => {
  const cart = await getCart(req.user._id);
  return res
    .status(201)
    .json(new ApiResponse(200, cart, 'cart fetched successfully'));
});

export { addToCart, removeFromCart, clearCart, getUserCart };
