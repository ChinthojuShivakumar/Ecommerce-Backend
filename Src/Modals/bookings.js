import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // productId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    //   ref: "products",
    // },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "products",
        },
        quantity: {
          type: Number,
          required: true,
        },
        originalPrice: {
          type: Number,
          require: true,
        },
        discountPrice: {
          type: Number,
          require: true,
        },
        discountPercent: {
          type: Number,
          require: true,
        },
        status: {
          type: String,
          enum: ["CONFIRMED", "PENDING", "SHIPPED", "DELIVERED", "FAILED"],
          default: "PENDING",
        },
        deliveredAt: {
          type: Date,
          default: null,
        },
        shippedAt: {
          type: Date,
          default: null,
        },
        cancelledAt: {
          type: Date,
          default: null,
        },
        returnedAt: {
          type: Date,
          default: null,
        },
      },
    ],
    orderId: {
      type: String,
      default: "Order_",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },

    paymentMode: {
      type: String,
      required: true,
      enum: ["card", "dc", "upi", "emi", "qr", "cod"],
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    totalPrice: {
      type: Number,
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
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "address",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index(
  { deletedAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

const bookingModal = mongoose.model("bookings", bookingSchema);
export default bookingModal;
