import axios from "axios";
import bookingModal from "../Modals/bookings.js";
import userModal from "../Modals/users.js";
import productModal from "../Modals/products.js";

export const createBooking = async (req, res) => {
  try {
    const { totalPrice, productId, userId } = req.body;
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const findUser = await userModal.findOne({
      _id: userId,
    });
    if (!findUser) {
      return res
        .status(404)
        .json({ success: false, message: "user not found payment failed :(" });
    }
    const findProduct = await productModal.findOne({
      _id: productId,
    });
    if (!findProduct) {
      return res.status(404).json({
        success: false,
        message: "product not found payment failed :(",
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
      const newBooking = new bookingModal({ ...req.body });
      return res.status(201).json({
        success: true,
        message: "Payment link created",

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
      return res.status(500).json({ message: "Unknown error" });
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
          path: "product",
          select: "-deleted -deletedAt",
        },
        {
          path: "user", // 👈 assuming the field is named `userId` in your schema
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
      `${TEST_VERIFY_PAYMENT_URL}/${orderId}`,
      config
    );
    console.log(checkStatus?.data);

    if (checkStatus?.status === 200) {
      // Correcting the filter parameter to be an object
      const paymentData = await bookingModal.findOneAndUpdate(
        { orderId }, // Filter by orderId field (an object)
        { paymentStatus: checkStatus?.data?.order_status }, // Update the payment status
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
