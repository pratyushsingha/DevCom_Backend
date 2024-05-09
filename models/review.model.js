import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true
    },
    product: {
      type: mongoose.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productImage: {
      type: [String]
    },
    reviewDescription: {
      type: String
    },
    starRatting: {
      type: Number,
      required: true,
      min: [1, "rating can't be less than 1"],
      max: [5, "rating can't be greater than 5"],
      index: true
    }
  },
  { timestamps: true }
);

export const Review = mongoose.model('Review', reviewSchema);
