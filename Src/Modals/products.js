import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  deleted: {
    type: Boolean,
  },
  deletedAt: {
    type: Date,
  },
});
productSchema.index(
  { deletedAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);
const productModal = mongoose.model("products", productSchema);

export default productModal;
