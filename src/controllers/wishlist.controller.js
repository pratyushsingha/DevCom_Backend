import mongoose from 'mongoose';
import { Product } from '../../models/product.model.js';
import { Wishlist } from '../../models/wishlist.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(422, "product doesn't exists");
  }

  const wishlist = await Wishlist.findOne({ owner: req.user._id });
  if (wishlist) {
    const existingItem = wishlist.items.find(
      (item) => item.product.toString() === productId.toString()
    );
    if (existingItem) {
      throw new ApiError(409, 'already in wishlist');
    } else {
      wishlist.items.push({ product: productId });
      await wishlist.save();
    }
  } else {
    const addToWish = await Wishlist.create({
      items: [{ product: productId }],
      owner: req.user._id
    });
  }
  return res
    .status(201)
    .json(new ApiResponse(200, wishlist, 'item added to wishlist'));
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(422, "product doesn't exists");
  }

  const wishlist = await Wishlist.findOne({ owner: req.user._id });

  if (!wishlist) {
    throw new ApiError(409, 'wishlist is empty');
  }

  const itemIndex = wishlist.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );

  if (itemIndex === -1) {
    throw new ApiError(422, 'item is not in wislist');
  }

  const removeItem = wishlist.items.splice(itemIndex, 1);
  await wishlist.save();

  return res
    .status(201)
    .json(new ApiResponse(201, wishlist, 'product removed from wishlist'));
});

const getMyWishlist = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const wishlistAggregate = await Wishlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id)
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
        as: 'items.product',
        pipeline: [
          {
            $project: {
              name: 1,
              price: 1,
              stock: 1,
              mainImage: 1
            }
          }
        ]
      }
    },
    {
      $project: {
        product: {
          $first: '$items.product'
        }
      }
    },
    {
      $group: {
        _id: null,
        items: {
          $push: '$$ROOT'
        }
      }
    }
  ]);

  return res
    .status(201)
    .json(
      new ApiResponse(200, wishlistAggregate, 'wishlist fetched successfully')
    );
});

export { addToWishlist, removeFromWishlist, getMyWishlist };
