import mongoose, { Schema } from 'mongoose';
import { Product } from './product.model.js';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

categorySchema.plugin(mongooseAggregatePaginate);

export const Category = mongoose.model('Category', categorySchema);
