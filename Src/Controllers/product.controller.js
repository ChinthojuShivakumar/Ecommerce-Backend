import productModal from "../Modals/products.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

export const createProduct = async (req, res) => {
  try {
    const findProduct = await productModal.findOne({
      name: req.body.name,
      deleted: false,
    });
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
    if (
      req.body.specifications &&
      typeof req.body.specifications === "string"
    ) {
      req.body.specifications = JSON.parse(req.body.specifications);
    }
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

export const updateProduct = async (req, res) => {
  try {
    const findProduct = await productModal.findOne({
      _id: req.params._id,
      deleted: false,
    });
    if (!findProduct) {
      return res
        .status(400)
        .json({ success: false, message: "Product Does not Exist" });
    }
    const files = req.files;
    const convertToURL = files
      ? files?.map((file) => {
          const FileName = file.filename;
          return `${process.env.TEST_IMAGE_URL}/products/${FileName}`;
        })
      : req.body.images;
    if (
      req.body.specifications &&
      typeof req.body.specifications === "string"
    ) {
      req.body.specifications = JSON.parse(req.body.specifications);
    }

    if (
      req.body.specifications &&
      typeof req.body.specifications === "object"
    ) {
      req.body.specifications = new Map(
        Object.entries(req.body.specifications)
      );
    }
    const newProduct = await productModal.updateOne(
      { _id: req.params._id },
      { ...req.body, images: convertToURL }
    );

    return res.status(202).json({
      message: "product updated successfully",
      success: true,
      newProduct,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const fetchProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;
    const totalCategories = await productModal.countDocuments({
      deleted: false,
    });
    const totalPages = Math.ceil(totalCategories / limit);
    const productList = await productModal
      .find({ deleted: false })
      .skip(skip)
      .limit(limit)
      .select("-deleted -deletedAt");
    return res.status(200).json({
      message: "products fetched successfully",
      success: true,
      productList,
      totalPages,
      totalCategories,
      page: page,
      limit: limit,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const findProduct = await productModal.findOne({ _id: req.params._id });
    if (!findProduct) {
      return res
        .status(404)
        .json({ message: "Product Not Found", success: false });
    }
    const deletedProduct = await productModal.updateOne(
      { _id: req.params._id },
      { deleted: true, deletedAt: Date.now() }
    );
    return res.status(202).json({
      message: "product deleted success",
      success: true,
      deletedProduct,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
