import mongoose from 'mongoose';
import { Product } from '../../models/product.model.js';
import { Review } from '../../models/review.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { cloudinaryUpload } from '../utils/Cloudinary.js';

const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { reviewDescription, starRatting, product } = req.body;

  const productExists = await Product.findById(productId);
  if (!productExists) {
    throw new ApiError(422, "product isn't available");
  }
  let productImageLocalPath;
  let productImages = [];
  if (
    req.files &&
    Array.isArray(req.files.productImage) &&
    req.files.productImage.length > 0
  ) {
    for (let i = 0; i < req.files.productImage.length; i++) {
      productImageLocalPath = req.files.productImage[i].path;
      const productImage = await cloudinaryUpload(productImageLocalPath);
      productImages.push(productImage.url);
    }
  }

  const review = await Review.create({
    owner: req.user._id,
    product,
    productImage: productImages,
    reviewDescription,
    starRatting
  });

  if (!review) {
    throw new ApiError(500, 'something went wrong while creating the review');
  }

  return res
    .status(201)
    .json(new ApiResponse(200, review, 'review created successfully'));
});

const deleteReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const review = await Review.findOne({ product: productId });
  if (!review) {
    throw new ApiError(409, "review doesn't exists");
  }

  if (review.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'u are not the owner of this review');
  }

  const deletedReview = await Review.findOneAndDelete({ product: productId });

  if (!deletedReview) {
    throw new ApiError(401, 'something went wrong while deleting the review');
  }

  return res
    .status(201)
    .json(new ApiResponse(200, deletedReview, 'review deleted succcessfully'));
});

const getReviewsById = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const productReviews = await Review.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId)
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
              username: 1,
              avatar: 1
            }
          }
        ]
      }
    },
    {
      $project: {
        _id: 1,
        productImage: 1,
        reviewDescription: 1,
        starRatting: 1,
        customer: { $first: '$customer' }
      }
    },
    {
      $group: {
        _id: null,
        avgStarRating: {
          $avg: '$starRatting'
        },
        reviews: {
          $push: '$$ROOT'
        }
      }
    }
  ]);

  if (productReviews.length > 0) {
    return res
      .status(201)
      .json(
        new ApiResponse(200, productReviews[0], 'reviews fetched successfully')
      );
  } else {
    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          { _id: null, avgStarRating: 0, reviews: [] },
          'no reviews available'
        )
      );
  }
});

export { createReview, deleteReview, getReviewsById };
