import mongoose, { Schema } from 'mongoose';
import { CouponTypeEnum, availableCouponType } from '../constants.js';
import { defaultExpiry } from '../src/utils/helper.js';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const couponSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    couponCode: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
      trim: true
    },
    type: {
      type: String,
      enum: availableCouponType,
      default: CouponTypeEnum.FLAT,
      required: true
    },
    discountValue: {
      type: Number,
      required: true,
      min: [1, "discount value can't be less than 1"]
    },
    minimumCartValue: {
      type: Number,
      min: [1, "minimum Cart value can't be less than 1"],
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    expiryDate: {
      type: Date,
      required: true,
      default: defaultExpiry
    },
    startDate: {
      type: Date,
      default: Date.now(),
      required: true
    },
    owner: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

couponSchema.plugin(mongooseAggregatePaginate);

export const Coupon = mongoose.model('Coupon', couponSchema);
