import axios from "axios";
import bookingModal from "../Modals/bookings.js";
import userModal from "../Modals/users.js";
import productModal from "../Modals/products.js";
import cartModal from "../Modals/cart.js";

export const createBooking = async (req, res) => {
  try {
    // const { totalPrice, productId, userId, paymentMode, quantity } = req.body;
    const { userId, paymentMode } = req.body;
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const findUser = await userModal.findOne({
      _id: userId,
    });
    if (!findUser) {
      return res
        .status(404)
        .json({ success: false, message: "user not found payment failed :(" });
    }

    const cartList = await cartModal
      .find({ userId, deleted: false })
      .populate("productId");

    let totalPrice = 0;
    let discountAmount = 0;
    let totalQuantity = 0;

    for (const item of cartList) {
      const price = item.productId.price;
      const discount = item.productId.discount;
      const quantity = item.quantity;

      const itemTotal = price * quantity;
      const itemDiscount = (price * discount * quantity) / 100;

      totalPrice += itemTotal;
      discountAmount += itemDiscount;
      totalQuantity += quantity;
    }

    // Payment mode discount
    let paymentMethodDiscount = 0;
    if (["card", "upi"].includes(paymentMode?.toLowerCase())) {
      paymentMethodDiscount = ((totalPrice - discountAmount) * 10) / 100;
      discountAmount += paymentMethodDiscount;
    }

    const discountPercent = (discountAmount / totalPrice) * 100;
    const shippingPrice = totalPrice - discountAmount > 500 ? 0 : 50;
    const finalPrice = totalPrice - discountAmount + shippingPrice;

    // Order ID
    const orderId =
      paymentMode === "cod" ? `Order-${Date.now()}` : `Order-${Date.now()}`;

    // Create bookings for each cart item
    if (paymentMode === "cod") {
      const bookings = [];

      for (const item of cartList) {
        const booking = await bookingModal.create({
          productId: item.productId._id,
          userId: item.userId,
          quantity: item.quantity,
          totalPrice,
          paymentMode,
          discountPercent,
          discountAmount,
          finalPrice,
          shippingPrice,
          orderId,
          status: paymentMode === "cod" ? "CONFIRMED" : "PENDING",
        });
        bookings.push(booking);
      }

      return res.status(201).json({
        success: true,
        message:
          paymentMode === "cod"
            ? "Order placed with Cash on Delivery!"
            : "Order placed! Awaiting payment...",
        bookings,
      });
    }

    const payload = {
      customer_details: {
        customer_id: findUser._id.toString(),
        customer_email: findUser.email.toString(),
        customer_phone: findUser.phoneNumber.toString(),
        customer_name: findUser.name,
      },
      thank_you_msg: "Thank you for your payment!",
      link_expiry_time: expirationTime,
      link_amount: Number(totalPrice * 100),
      link_currency: "INR",
      link_purpose: findProduct?.name,
      link_meta: {
        return_url: "http://localhost:5173/orders",
        notify_url: "http://localhost:5173",
      },
      link_notify: {
        send_sms: false,
        send_email: true,
      },
    };

    const config = {
      headers: {
        "x-client-id": process.env.TEST_X_CLIENT_ID,
        "x-client-secret": process.env.TEST_X_CLIENT_SECRET,
        "x-api-version": "2023-08-01",
      },
    };

    const payLink = await axios.post(
      process.env.TEST_PAYMENT_URL,
      payload,
      config
    );

    if (payLink.status == 200) {
      const newBooking = new bookingModal({
        ...req.body,
        orderId: payLink.data.link_id,
      });
      await newBooking.save();
      return res.status(201).json({
        success: true,
        message: "Payment link created..!",
        paymentFullData: payLink.data,
        booking: newBooking,
        paymentLink: payLink.data.link_url,
      });
    }
  } catch (error) {
    if (error.response) {
      console.error("Error Response:", error.response.data);
      return res.status(500).json({ message: error });
    } else {
      console.error("Unknown Error:", error);
      return res.status(500).json({ message: "Unknown error", error });
    }
  }
};

export const fetchBookingList = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;
    const filters = {
      deleted: false,
    };
    if (req.query.status) filters.status = req.query.status;
    const totalBookings = await bookingModal.countDocuments(filters);
    const totalPages = Math.ceil(totalBookings / limit);
    const bookingList = await bookingModal
      .find(filters)
      .skip(skip)
      .limit(limit)
      .select("-deleted -deletedAt")
      .populate([
        {
          path: "productId",
          select: "-deleted -deletedAt",
        },
        {
          path: "userId", // 👈 assuming the field is named `userId` in your schema
          select: "-deleted -deletedAt",
        },
      ]);
    return res.status(200).json({
      message: "Booking list fetched successfully",
      succuss: true,
      bookingList,
      totalPages,
      totalBookings,
      page: page,
      limit: limit,
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const updateBooking = async (req, res) => {
  try {
    const findBooking = await bookingModal.findOne({ _id: req.params._id });
    if (!findBooking) {
      return res
        .status(400)
        .json({ message: "Booking does not exist", success: false });
    }

    const updatedBooking = await bookingModal.updateOne({ ...req.body });
    return res.status(201).json({
      message: "Booking Updated successfully",
      success: true,
      updatedBooking,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const findBooking = await bookingModal.findOne({ _id: req.params._id });
    if (!findBooking) {
      return res
        .status(400)
        .json({ message: "Booking Not Found", success: false });
    }

    const deletedBooking = await bookingModal.updateOne(
      { _id: req.params._id },
      { deleted: true, deletedAt: Date.now() }
    );
    return res.status(202).json({
      success: true,
      message: "Booking deleted successfully",
      deletedBooking,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const config = {
      headers: {
        "x-client-id": process.env.TEST_X_CLIENT_ID,
        "x-client-secret": process.env.TEST_X_CLIENT_SECRET,
        "x-api-version": "2023-08-01",
      },
    };

    const checkStatus = await axios.get(
      `${process.env.TEST_VERIFY_PAYMENT_URL}/${orderId}`,
      config
    );
    console.log(checkStatus?.data);

    if (checkStatus?.status === 200) {
      // Correcting the filter parameter to be an object
      const paymentData = await bookingModal.findOneAndUpdate(
        { orderId }, // Filter by orderId field (an object)
        { status: checkStatus?.data?.link_status }, // Update the payment status
        { new: true }
      );

      if (!paymentData) {
        return res.status(404).json({
          success: false,
          message: "Payment data not found",
        });
      }

      res.status(200).json({
        success: true,
        data: paymentData,
        check: checkStatus?.data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Unable to verify payment",
        check: checkStatus?.data,
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message, success: false });
  }
};
