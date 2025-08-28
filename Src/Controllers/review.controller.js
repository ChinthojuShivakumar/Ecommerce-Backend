import bookingModal from "../Modals/bookings.js";
import productModal from "../Modals/products.js";
import reviewModal from "../Modals/review.js";

export const createReview = async (req, res) => {
  try {
    const productId = req.body.productId;
    const filters = { _id: req.body.orderId, deleted: false };
    if (productId) filters["products.product"] = productId;
    const booking = await bookingModal.findOne(filters);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found for this product",
      });
    }

    // Validate product
    const product = await productModal.findOne({
      _id: productId,
      deleted: false,
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found :(",
      });
    }

    const review = new reviewModal({ ...req.body });
    await review.save();

    const reviewList = await reviewModal.find({
      deleted: false,
      productId: productId,
    });
    const averageRating =
      reviewList.reduce((sum, review) => sum + review.rating, 0) /
      reviewList.length;

    await productModal.updateOne(
      { _id: productId },
      {
        $set: {
          rating: averageRating.toFixed(1),
          totalReviews: reviewList.length,
        },
      }
    );

    await bookingModal.updateOne(
      { _id: req.body.orderId, "products.product": productId },
      { $set: { "products.$.review": review._id } }
    );

    return res.status(201).json({
      success: true,
      message: "review created successfully :)",
      review,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: error, success: false });
  }
};

export const fetchReviewsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;
    const filters = {
      deleted: false,
    };
    const totalReviews = await reviewModal.countDocuments(filters);
    const totalPages = Math.ceil(totalReviews / limit);
    const reviewList = await reviewModal
      .find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-deleted -deletedAt")
      .populate([
        { path: "userId", select: "_id name" },
        { path: "productId", select: "-_id name" },
        { path: "orderId", select: "-_id name bookingId" },
      ]);
    return res.status(200).json({
      message: "review list fetched successfully :)",
      reviewList,
      totalReviews,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
};

export const updateReview = async (req, res) => {
  try {
    const findReview = await reviewModal.findOne({
      deleted: false,
      _id: req.body._id,
    });
    if (!findReview) {
      return res
        .status(404)
        .json({ message: "Review not found", success: false });
    }

    const updatedReview = await reviewModal.updateOne(
      { _id: req.body._id },
      { $set: { ...req.body } }
    );

    return res
      .status(202)
      .json({ message: "review updated successfully :)", updatedReview });
  } catch (error) {
    return res.status(500).json({ message: error, success: false });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const findReview = await reviewModal.findOne({
      deleted: false,
      _id: req.body._id,
    });
    if (!findReview) {
      return res
        .status(404)
        .json({ message: "Review not found", success: false });
    }

    const updatedReview = await reviewModal.updateOne(
      { _id: req.body._id },
      { $set: { deleted: true, deletedAt: Date.now() } }
    );

    return res
      .status(202)
      .json({ message: "review deleted successfully :)", updatedReview });
  } catch (error) {
    return res.status(500).json({ message: error, success: false });
  }
};
