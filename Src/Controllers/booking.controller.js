import bookingModal from "../Modals/bookings.js";

export const createBooking = async (req, res) => {
  try {
    const findBooking = await bookingModal.findOne({ _id: req.body._id });
    if (findBooking) {
      return res
        .status(400)
        .json({ message: "Booking Already Exist", success: false });
    }

    const newBooking = new bookingModal({ ...req.body });
    return res.status(201).json({
      message: "Booking created successfully",
      success: true,
      newBooking,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const fetchBookingList = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;
    const totalBookings = await bookingModal.countDocuments({
      deleted: false,
    });
    const totalPages = Math.ceil(totalBookings / limit);
    const bookingList = await bookingModal
      .find({ deleted: false })
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
