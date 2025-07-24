import cartModal from "../Modals/cart.js";
import productModal from "../Modals/products.js";

export const createCartList = async (req, res) => {
  try {
    // const { userId, productId } = req.body;

    const savedCart = await cartModal.create({ ...req.body });

    return res.status(201).json({
      success: true,
      message: "product added to cart :)",
      cart: savedCart,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const fetchCartList = async (req, res) => {
  try {
    const { userId } = req.query;
    const cartList = await cartModal
      .find({ deleted: false, userId: userId })
      .select("-deleted -deletedAt")
      .populate("userId", "_id name email phoneNumber")
      .populate("productId", "_id name price quantity discount images");

    let totalPrice = 0;
    let discountAmount = 0;

    for (const item of cartList) {
      const price = item.productId.price;
      const discount = item.productId.discount;
      const quantity = item.quantity;

      const totalItemPrice = price * quantity;
      const itemDiscountAmount = (price * discount * quantity) / 100;

      totalPrice += totalItemPrice;
      discountAmount += itemDiscountAmount;
    }

    const discountPercent = (discountAmount / totalPrice) * 100;
    const shippingPrice = totalPrice - discountAmount > 500 ? 0 : 50;
    const finalPrice = totalPrice - discountAmount + shippingPrice;

    const result = {
      totalPrice: totalPrice.toFixed(2), // Before discount
      discountAmount: discountAmount.toFixed(2), // Absolute discount value
      discountPercent: discountPercent, // Calculated % overall
      shippingPrice,
      finalPrice: finalPrice.toFixed(2), // Total to pay
    };

    return res.status(200).json({
      success: true,
      message: "cart fetched successfully",
      cartList,
      priceDrop: result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCart = async (req, res) => {
  try {
    const findCartItem = await cartModal.findOne({
      _id: req.body._id,
      deleted: false,
    });
    if (!findCartItem) {
      return res
        .status(404)
        .json({ success: false, message: "cart item not found" });
    }
    const updatedCart = await cartModal.updateOne(
      { _id: req.body._id },
      { $set: { quantity: req.body.quantity } }
    );

    return res.status(202).json({
      message: "cart item updated successfully",
      success: true,
      cart: updatedCart,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCartItem = async (req, res) => {
  try {
    const findCartItem = await cartModal.find({ _id: req.params._id });

    if (!findCartItem) {
      return res
        .status(404)
        .json({ success: false, message: "cart item not found" });
    }

    const updatedCart = await cartModal.updateOne(
      { _id: req.params._id },
      { $set: { deleted: true, deletedAt: Date.now() } }
    );

    return res.status(202).json({
      success: true,
      message: "cart item deleted",
      cart: updatedCart,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
