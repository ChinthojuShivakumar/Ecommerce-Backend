import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    productList: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
        },
        quantity: {
          type: Number,
          default: 1,
        },
        discountPrice: {
          type: Number,
        },
        total: {
          type: Number,
        },
        appliedDiscount: {
          type: Number,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    discountPercent: {
      type: Number,
    },
    discountAmount: {
      type: Number,
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

cartSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const cartModal = mongoose.model("cart", cartSchema);
export default cartModal;
