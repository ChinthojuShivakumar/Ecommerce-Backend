import cartModal from "../Modals/cart";

export const createCartList = async (req, res) => {
  try {
    const cart = new cartModal.create({ ...req.body });
    return res
      .status(201)
      .json({ success: true, message: "product added to cart :)" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error });
  }
};

export const fetchCartList = async (req, res) => {
  try {
    const cartList = await cartModal.find({ deleted: false });
    if(cartList.length == 0) {
        return res.status(200).json({success: true, cartList, message: "No cart items found"})
    }
    const filteredData = []
    cartList.map((item,i) => {
        return {
            
        }
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error });
  }
};
