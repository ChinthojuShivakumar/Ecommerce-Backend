import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "products",
  },
  orderId: {
    type: Date,
    default: "Order_",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Users",
  },
  quantity: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    require: true,
  },
  status: {
    type: String,
    enum: ["CONFIRMED", "PENDING", "SHIPPED", "DELIVERED"],
    default: "PENDING",
  },
  paymentMode: {
    type: String,
    required: true,
    enum: ["cc", "dc", "upi", "emi", "qr", "cod"],
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  orderId: {
    type: String,
    require: true,
  },
});

bookingSchema.index(
  { deletedAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

const bookingModal = mongoose.model("bookings", bookingSchema);
export default bookingModal;
