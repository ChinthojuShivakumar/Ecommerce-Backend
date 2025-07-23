import cartModal from "../Modals/cart.js";
import productModal from "../Modals/products.js";

export const createCartList = async (req, res) => {
  try {
    const { userId, productList } = req.body;
    const cart = await calculateCart(productList);
    // console.log(cart, "create");

    const savedCart = await cartModal.create({
      productList: cart.items,
      totalPrice: cart.totalPrice,
      discountAmount: cart.discountAmount,
      discountPercent: cart.discountPercent,
      finalPrice: cart.finalPrice,
      shippingPrice: cart.shippingPrice,
      userId: userId,
    });

    return res.status(201).json({
      success: true,
      message: "product added to cart :)",
      cartItems: savedCart,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error });
  }
};

export const fetchCartList = async (req, res) => {
  try {
    const { userId } = req.params;
    const cartList = await cartModal
      .find({ deleted: false, userId: userId })
      .select("-deleted -deletedAt")
      .populate("userId", "_id name email phoneNumber")
      .populate("productList.product", "_id name price discount stock rating");
    return res
      .status(200)
      .json({ success: true, message: "cart fetched successfully", cartList });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCart = async (req, res) => {
  try {
    const { userId, _id, cPId, quantity } = req.body; //cart product id is cpd
    // console.log(cPId, "cpid");

    const findCart = await cartModal.findOne({
      userId: userId,
      _id: _id,
      deleted: false,
    });
    if (!findCart) {
      return res
        .status(400)
        .json({ success: false, message: "cart item not found" });
    }
    const t = await cartModal.findOne({
      _id: _id,
      userId,
    });
    t.productList.map((p) => {
      if (p._id.toString() === cPId) {
        p.quantity = quantity;
      }
    });

    t.save();
    // const updatedCart = await cartModal.findOne({ _id: _id, deleted: false });

    // Ensure we fetch productList with product & quantity
    const cartWithProducts = await cartModal
      .findOne({ _id: _id, deleted: false })
      .select("productList");

    const recalculatedCart = await calculateCart(cartWithProducts.productList);

    // cartWithProducts.productList = recalculatedCart.items;
    // cartWithProducts.totalPrice = recalculatedCart.totalPrice;
    // cartWithProducts.discountAmount = recalculatedCart.discountAmount;
    // cartWithProducts.discountPercent = recalculatedCart.discountPercent;
    // cartWithProducts.finalPrice = recalculatedCart.finalPrice;
    // cartWithProducts.shippingPrice = recalculatedCart.shippingPrice;

    // console.log(recalculatedCart);

    await cartWithProducts.save();

    return res.status(202).json({
      success: false,
      message: "cart updated successfully",

      cart: cartWithProducts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const calculateCart = async (productList, paymentMethod) => {
  const productIds = productList.map((p) => p.product);

  const products = await productModal.find({ _id: { $in: productIds } });

  let totalPrice = 0;

  const items = [];

  for (const item of productList) {
    const product = products.find(
      (p) => p._id.toString() === item.product.toString()
    );

    if (!product) continue;
    const quantity = item.quantity || 1;

    const discountOnItem = Number(
      (product.price - (product.price * product.discount) / 100).toFixed(2)
    );
    totalPrice += discountOnItem * quantity;

    items.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity,

      discountPrice: discountOnItem,
      appliedDiscount: product.discount,
    });
  }

  let discountPercent = 0;
  if (["card", "upi"].includes(paymentMethod?.toLowerCase())) {
    discountPercent = 10;
  }
  const discountAmount = (totalPrice * discountPercent) / 100;
  const shippingPrice = totalPrice > 500 ? 0 : 50;
  const finalPrice = totalPrice - discountAmount + shippingPrice;
  console.log({
    items,
    totalPrice: Number(totalPrice.toFixed(2)),
    shippingPrice,
    finalPrice,
    discountAmount,
    discountPercent,
  });

  return {
    items,
    totalPrice: Number(totalPrice.toFixed(2)),
    shippingPrice,
    finalPrice,
    discountAmount,
    discountPercent,
  };
};
