import productModal from "../Modals/products.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

export const createProduct = async (req, res) => {
  try {
    const findProduct = await productModal.findOne({ name: req.body.name });
    if (findProduct) {
      return res
        .status(400)
        .json({ success: false, message: "Product Already Exist" });
    }
    const files = req.files;
    const convertToURL = files.map((file) => {
      const FileName = file.filename;
      return `${process.env.TEST_IMAGE_URL}/products/${FileName}`;
    });
    const newProduct = new productModal({ ...req.body, images: convertToURL });
    await newProduct.save();
    return res.status(201).json({
      message: "product added successfully",
      success: true,
      newProduct,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const fetchProducts = async (req, res) => {
  try {
    const productList = await productModal.find({ deleted: false });
    return res.status(200).json({
      message: "products fetched successfully",
      success: true,
      productList,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
