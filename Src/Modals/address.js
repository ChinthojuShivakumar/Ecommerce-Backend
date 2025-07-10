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
    area: {
      type: String,
      require: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    addressType: {
      type: String,
      enum: ["Home", "Work", "Others"],
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
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
