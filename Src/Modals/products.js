import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  rating: {
    type: String,
    default: "0",
  },
  stock: {
    type: Number,
    required: true,
  },
  totalReviews: {
    type: String,
    default: "0",
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});
productSchema.index(
  { deletedAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);
const productModal = mongoose.model("products", productSchema);

export default productModal;
