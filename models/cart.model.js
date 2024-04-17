import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const cartSchema = new Schema(
  {
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
    owner: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true
    },
    coupon: {
      type: mongoose.Types.ObjectId,
      ref: 'Coupon'
    }
  },
  {
    timestamps: true
  }
);

cartSchema.plugin(mongooseAggregatePaginate);

export const Cart = mongoose.model('Cart', cartSchema);
