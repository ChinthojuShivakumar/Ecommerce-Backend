import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
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

categorySchema.index(
  { deletedAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

const categoryModal = mongoose.model("category", categorySchema);

export default categoryModal;
