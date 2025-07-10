import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      ref: "users",
    },
    houseNumber: {
      type: String,
    },
    state: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    mandala: {
      type: String,
      required: true,
    },
    village: {
      type: String,
    },
    pincode: {
      type: Number,
      required: true,
    },
    addressType: {
      type: String,
      enum: ["Home", "Office", "Others"],
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
        type: Date,
        default: null
    }
  },
  {
    timestamps: true,
  }
);

addressSchema.index(
  { deletedAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

const addressModal = mongoose.model("address", addressSchema);
export default addressModal;
