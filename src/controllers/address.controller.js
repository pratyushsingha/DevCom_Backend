import mongoose from 'mongoose';
import { Address } from '../../models/address.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { getMongoosePaginationOptions } from '../utils/helper.js';

const createAddress = asyncHandler(async (req, res) => {
  const { addressLine1, addressLine2, city, state, pincode, country } =
    req.body;

  const createAddress = await Address.create({
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
    country,
    owner: req.user._id
  });

  if (!createAddress) {
    throw new ApiError(500, 'something went wrong while creating the address');
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createAddress, 'address created successfully'));
});

const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const { addressLine1, addressLine2, city, state, pincode, country } =
    req.body;

  const modifiedAddress = await Address.findByIdAndUpdate(
    addressId,
    {
      $set: {
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        country
      }
    },
    { new: true }
  );
  if (!modifiedAddress) {
    throw new ApiError(404, 'Address not found');
  }

  return res
    .status(201)
    .json(
      new ApiResponse(200, modifiedAddress, 'address updated successfully')
    );
});

const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const deletedAddress = await Address.findByIdAndDelete(addressId);

  if (!deletedAddress) {
    throw new ApiError(409, 'address not found');
  }

  return res
    .status(201)
    .json(new ApiResponse(200, deletedAddress, 'address deleted succefully'));
});

const getAddressById = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const address = await Address.findById(addressId);

  if (!address) {
    throw new ApiError(500, 'address not found');
  }

  return res
    .status(201)
    .json(new ApiResponse(200, address, 'address fetched successfully'));
});

const getAllAddresses = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const addressAggregate = await Address.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id)
      }
    }
  ]);

  const addresses = await Address.aggregatePaginate(
    addressAggregate,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: 'AllAddresses',
        docs: 'Addresses'
      }
    })
  );

  return res
    .status(201)
    .json(new ApiResponse(200, addressAggregate, 'addresses fetched successfully'));
});

export {
  createAddress,
  updateAddress,
  deleteAddress,
  getAddressById,
  getAllAddresses
};
