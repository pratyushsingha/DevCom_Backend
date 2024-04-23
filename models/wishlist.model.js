import mongoose from 'mongoose';

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

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
