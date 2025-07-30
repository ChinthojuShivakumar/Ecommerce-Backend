import axios from "axios";
import bookingModal from "../Modals/bookings.js";
import userModal from "../Modals/users.js";
import productModal from "../Modals/products.js";
import cartModal from "../Modals/cart.js";
// import cartModal from "../Modals/cart.js";

export const createBooking = async (req, res) => {
  try {
    // const { totalPrice, productId, userId, paymentMode, quantity } = req.body;
    const { userId, paymentMode, finalPrice } = req.body;
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    // console.log(req.body);

    const findUser = await userModal.findOne({
      _id: userId,
    });
    if (!findUser) {
      return res
        .status(404)
        .json({ success: false, message: "user not found payment failed :(" });
    }

    // Create bookings for each cart item
    if (paymentMode === "cod") {
      const booking = await bookingModal.create({ ...req.body });
      await cartModal.updateMany(
        { userId },
        { $set: { deleted: true, deletedAt: Date.now() } }
      );
      return res.status(201).json({
        success: true,
        message: "Order Placed with COD",
        booking,
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
      link_amount: parseFloat(finalPrice.toFixed(2)),
      link_currency: "INR",
      link_purpose: `order of ${req.body.products.length} items`,
      link_meta: {
        return_url: "http://localhost:5173/orders",
        notify_url: "http://localhost:5173",
      },
      link_notify: {
        send_sms: false,
        send_email: true,
      },
    };

    // console.log(payload);

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
      const productsWithStatus = req.body.products.map((item) => ({
        ...item,
        status: payLink.data.link_status === "PAID" ? "CONFIRMED" : "PENDING", // or "CONFIRMED" / dynamic
      }));
      const newBooking = new bookingModal({
        ...req.body,
        orderId: payLink.data.link_id,
        products: productsWithStatus,
      });
      await newBooking.save();
      await cartModal.updateMany(
        { userId },
        { $set: { deleted: true, deletedAt: Date.now() } }
      );
      const stockUpdatePromises = newBooking.products.map(
        async ({ product, quantity }) => {
          const foundProduct = await productModal.findById(product);
          if (!foundProduct) throw new Error("Product not found");
          if (foundProduct.stock < quantity) {
            throw new Error(
              `Insufficient stock for product ${foundProduct.name}`
            );
          }
          foundProduct.stock -= quantity;
          await foundProduct.save();
        }
      );
      await Promise.all(stockUpdatePromises);
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
      console.error("Unknown Error:", error.message);
      return res.status(500).json({ message: "Unknown error", error });
    }
  }
};

export const fetchBookingList = async (req, res) => {
  try {
    const userId = req.query.userId;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;
    const filters = {
      deleted: false,
    };
    if (req.query.status) filters["products.status"] = req.query.status;
    if (req.user?.role !== "ADMIN" && req.query.userId) filters.userId = userId;
    if (req.query.year) {
      const year = parseInt(req.query.year);
      const start = new Date(`${year}-01-01T00:00:00.000Z`);
      const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);
      filters.createdAt = { $gte: start, $lt: end };
    }

    const totalBookings = await bookingModal.countDocuments(filters);
    const totalPages = Math.ceil(totalBookings / limit);
    const bookingList = await bookingModal
      .find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-deleted -deletedAt")
      .populate([
        {
          path: "userId", // 👈 assuming the field is named `userId` in your schema
          select: "-deleted -deletedAt -password",
        },
        {
          path: "products.product", // 🔥 populate each product inside products array
          model: "products", // 👈 replace with your actual Product model name
          select: "images name _id",
        },
        {
          path: "addressId",
          select: "-deletedAt -deleted",
        },
      ]);

    return res.status(200).json({
      message: "Booking list fetched successfully",
      succuss: true,
      bookingList: bookingList,
      totalPages,
      totalBookings,
      page: page,
      limit: limit,
      // filters,
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

    if (checkStatus?.status === 200) {
      // Correcting the filter parameter to be an object
      const newStatus =
        checkStatus?.data?.link_status == "PAID"
          ? "CONFIRMED"
          : checkStatus.data.link_status == "FAILED"
          ? "FAILED"
          : checkStatus.data.link_status;
      const paymentData = await bookingModal.findOneAndUpdate(
        { orderId },
        {
          $set: {
            "products.$[elem].status": newStatus,
          },
        },
        {
          new: true,
          arrayFilters: [{ "elem.status": { $ne: newStatus } }],
        }
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
    console.log(error);

    return res.status(500).json({ message: error, success: false });
  }
};

export const updateStatus = async (req, res) => {
  const { _id, productId, status } = req.body;
  try {
    const findBooking = await bookingModal.findOne({ _id: req.body._id });
    if (!findBooking) {
      return res
        .status(404)
        .json({ message: "Booking not failed :(", success: false });
    }

    const updateFields = {
      "products.$.status": req.body.status,
    };

    if (status === "DELIVERED")
      updateFields["products.$.deliveredAt"] = new Date();
    if (status === "SHIPPED") updateFields["products.$.shippedAt"] = new Date();
    if (status === "CANCELLED")
      updateFields["products.$.cancelledAt"] = new Date();
    if (status === "RETURNED")
      updateFields["products.$.returnedAt"] = new Date();

    const result = await bookingModal.updateOne(
      { _id: _id, "products._id": productId },
      { $set: updateFields }
    );

    return res.status(202).json({
      success: true,
      message: "status updated successfully :)",
      result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error, success: false });
  }
};
