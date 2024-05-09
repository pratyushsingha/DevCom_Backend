import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const wishlistSchema = mongoose.Schema(
  {
    items: {
      type: [
        {
          product: {
            type: mongoose.Types.ObjectId,
            ref: 'Product',
            required: true
          }
        }
      ],
      default: []
    },
    owner: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

wishlistSchema.plugin(mongooseAggregatePaginate)

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
