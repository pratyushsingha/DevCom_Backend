import mongoose, { isValidObjectId } from 'mongoose';
import { Product } from '../../models/product.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { cloudinaryUpload } from '../utils/Cloudinary.js';
import { Category } from '../../models/Category.model.js';
import { productIdValidator } from '../validators/product.validator.js';
import { getMongoosePaginationOptions } from '../utils/helper.js';
import { categoryIdValidator } from '../validators/category.validator.js';

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, stock } = req.body;

  if (!isValidObjectId(category)) {
    throw new ApiError(409, 'category Id is not valid');
  }

  const categoryExists = await Category.findOne({ _id: category });
  if (!categoryExists) {
    throw new ApiError(422, "category doesn't exists");
  }

  let mainImageLocalPath;
  let subImages = [];

  if (
    req.files &&
    Array.isArray(req.files.mainImage) &&
    req.files.mainImage.length > 0
  ) {
    mainImageLocalPath = req.files.mainImage[0].path;
  }

  const mainImage = await cloudinaryUpload(mainImageLocalPath);

  if (
    req.files &&
    Array.isArray(req.files.subImages) &&
    req.files.subImages.length > 0
  ) {
    for (let i = 0; i < req.files.subImages.length; i++) {
      const subImagesLocalPath = req.files.subImages[i].path;
      const subImage = await cloudinaryUpload(subImagesLocalPath);
      subImages.push(subImage.url);
    }
  }

  const productExists = await Product.findOne({ name, owner: req.user._id });

  if (productExists) {
    throw new ApiError(422, 'product with this name already exists');
  }

  const product = await Product.create({
    name,
    description,
    price,
    category,
    stock,
    mainImage: mainImage.url,
    subImages,
    owner: req.user._id
  });

  if (!product) {
    throw new ApiError(500, 'something went wrong while creating the product');
  }

  return res
    .status(200)
    .json(new ApiResponse(201, product, 'product created successfully'));
});

const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  productIdValidator(productId);

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new ApiError(409, "Product doesn't exists");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, product, 'product fetched successfully'));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { name, description, stock, price, category } = req.body;

  productIdValidator(productId);

  let mainImageLocalPath;
  let subImages = [];

  if (
    req.files &&
    Array.isArray(req.files.mainImage) &&
    req.files.mainImage.length > 0
  ) {
    mainImageLocalPath = req.files.mainImage[0].path;
  }

  const mainImage = await cloudinaryUpload(mainImageLocalPath);

  if (
    req.files &&
    Array.isArray(req.files.subImages) &&
    req.files.subImages.length > 0
  ) {
    for (let i = 0; i < req.files.subImages.length; i++) {
      const subImagesLocalPath = req.files.subImages[i].path;
      const subImage = await cloudinaryUpload(subImagesLocalPath);
      subImages.push(subImage.url);
    }
  }
  const product = await Product.findByIdAndUpdate(
    productId,
    {
      $set: {
        name,
        description,
        price,
        stock,
        category,
        ...(mainImage ? { mainImage: mainImage.url } : {}),
        ...(subImages.length > 0 ? { subImages } : {})
      }
    },
    { new: true }
  );

  if (!product) {
    throw new ApiError(500, 'product not found');
  }

  return res
    .status(201)
    .json(new ApiResponse(200, product, 'product updated successfully'));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  productIdValidator(productId);

  const product = await Product.findByIdAndDelete(productId);
  if (!product) {
    throw new ApiError(404, 'product does not exists');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        201,
        { deleteProduct: product },
        'product deleted successfully'
      )
    );
});

const getAllProducts = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const productAggregate = await Product.aggregate([
    {
      $match: {}
    }
  ]);

  const products = await Product.aggregatePaginate(
    productAggregate,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: 'allProducts',
        docs: 'Products'
      }
    })
  );

  return res
    .status(201)
    .json(new ApiResponse(200, products, 'products fetched successfully'));
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const { categoryId } = req.params;
  categoryIdValidator(categoryId);

  const productAggregate = await Product.aggregate([
    {
      $match: {
        category: new mongoose.Types.ObjectId(categoryId)
      }
    }
  ]);

  const products = await Product.aggregatePaginate(
    productAggregate,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: 'categoryProducts',
        docs: 'products'
      }
    })
  );

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        productAggregate,
        'Category products fetched successfully'
      )
    );
});

const searchProduct = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const products = await Product.find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ]
  });

  if (!products) {
    throw new ApiError(500, 'something went wrong while getting products');
  }

  return res
    .status(201)
    .json(new ApiResponse(200, products, 'products fetched successfully'));
});

export {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductsByCategory,
  searchProduct
};
