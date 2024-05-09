import mongoose from 'mongoose';
import { Product } from '../../models/product.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { getMongoosePaginationOptions } from '../utils/helper.js';
import { Category } from '../../models/Category.model.js';
import { Coupon } from '../../models/coupon.model.js';

const getAllAdminProducts = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const productAggregate = Product.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        mainImage: 1,
        price: 1,
        stock: 1
      }
    }
  ]);
  const products = await Product.aggregatePaginate(
    productAggregate,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: 'allProducts',
        docs: 'products'
      }
    })
  );
  return res
    .status(201)
    .json(new ApiResponse(200, products, 'products fetched successfully'));
});

const getAllAdminCategories = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const categoryAggregate = Category.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $project: {
        _id: 1,
        name: 1
      }
    }
  ]);

  const categories = await Category.aggregatePaginate(
    categoryAggregate,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: 'allCategories',
        docs: 'categories'
      }
    })
  );

  return res
    .status(201)
    .json(new ApiResponse(200, categories, 'categories fetched successfully'));
});

const getAllAdminCoupons = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const couponAggregate = Coupon.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        couponCode: 1,
        discountValue: 1,
        expiryDate: 1
      }
    }
  ]);

  const coupon = await Coupon.aggregatePaginate(
    couponAggregate,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: 'allCoupons',
        docs: 'coupons'
      }
    })
  );

  return res
    .status(201)
    .json(new ApiResponse(201, coupon, 'coupons fetched successfully'));
});

export { getAllAdminProducts, getAllAdminCategories, getAllAdminCoupons };
