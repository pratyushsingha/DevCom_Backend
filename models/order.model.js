import mongoose, { Schema } from 'mongoose';

import { orderStatusEnum, orderStatuses } from '../constants.js';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const orderSchema = mongoose.Schema(
  {
    orderPrice: {
      type: Number,
      required: true
    },
    disCountedOrderPrice: {
      type: Number,
      required: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    items: {
      type: [
        {
          product: {
            type: mongoose.Types.ObjectId,
            ref: 'Product',
            required: true
          },
          quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity can't be less than 1"]
          }
        }
      ],
      default: []
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: 'Address',
      required: true
    },
    coupon: {
      type: mongoose.Types.ObjectId,
      ref: 'Coupon'
    },
    paymentId: {
      type: String
    },
    status: {
      type: String,
      enum: orderStatuses,
      default: orderStatusEnum.PENDING
    },
    isPAymentDone: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

orderSchema.plugin(mongooseAggregatePaginate);

export const Order = mongoose.model('Order', orderSchema);
