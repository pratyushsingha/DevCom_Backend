import mongoose from 'mongoose';
import { Category } from '../../models/Category.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { categoryIdValidator } from '../validators/category.validator.js';
import { getMongoosePaginationOptions } from '../utils/helper.js';

const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const categoryExists = await Category.findOne({ name, owner: req.user._id });
  if (categoryExists) {
    throw new ApiError(409, 'category already exists');
  }

  const createdCategory = await Category.create({
    name,
    owner: req.user._id
  });

  if (!createdCategory) {
    throw new ApiError(409, 'something went wrong while creating the category');
  }

  return res
    .status(201)
    .json(
      new ApiResponse(200, createdCategory, 'category created successfully')
    );
});

const updateCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { name } = req.body;

  categoryIdValidator(categoryId);

  const categoryExists = await Category.findOne({ name, owner: req.user._id });
  if (categoryExists) {
    throw new ApiError(409, 'category already exists');
  }

  const category = await Category.findByIdAndUpdate(
    categoryId,
    {
      $set: {
        name
      }
    },
    { new: true }
  );

  if (!category) {
    throw new ApiError(
      500,
      'something went wrong while updating category name'
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(200, category, 'category updated successfully'));
});

const getCategoryById = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  categoryIdValidator(categoryId);

  const category = await Category.findOne({
    _id: categoryId,
    owner: req.user._id
  });

  if (!category) {
    throw new ApiError(500, "category doesn't exists");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, category, 'category fetched successfully'));
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  categoryIdValidator(categoryId);

  const category = await Category.findByIdAndDelete(categoryId);

  if (!category) {
    throw new ApiError(404, 'Category does not exist');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deletedCategory: category },
        'Category deleted successfully'
      )
    );
});

const getAllCategories = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const categoriesAggregate = await Category.aggregate([
    {
      $match: {}
    }
  ]);

  const categories = await Category.aggregatePaginate(
    categoriesAggregate,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: 'AllCategories',
        docs: 'Categories'
      }
    })
  );
  return res
    .status(201)
    .json(new ApiResponse(200, categories, 'categories fetched succesffulyy'));
});

export {
  createCategory,
  updateCategory,
  getCategoryById,
  deleteCategory,
  getAllCategories
};
