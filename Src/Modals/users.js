import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  plainPassword: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  role: {
    type: String,
    enum: ["USER", "ADMIN", "SUPER ADMIN"],
    default: "USER",
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Others"],
  },
});

userSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
const userModal = mongoose.model("Users", userSchema);
export default userModal;
