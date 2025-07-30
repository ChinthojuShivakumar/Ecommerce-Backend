import productModal from "../Modals/products.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import categoryModal from "../Modals/category.js";
import reviewModal from "../Modals/review.js";
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
    const filters = {
      deleted: false,
    };
    if (req.query.category) {
      const findCategory = await categoryModal.findOne({
        _id: req.query.category,
      });
      if (findCategory) {
        filters.category = findCategory._id;
      } else {
        return res
          .status(404)
          .json({ message: "Category not found", success: false });
      }
    }
    const price = req.query?.price?.split("-");
    if (price && price?.length === 2)
      filters.price = { $gte: price[0], $lte: price[1] };

    // if (req.query.keyword) {
    //   filters.$or = [
    //     { name: { $regex: req.query.keyword, $options: "i" } },
    //     { description: { $regex: req.query.keyword, $options: "i" } },
    //   ];
    // }
    if (req.query.keyword) {
      const regex = { $regex: req.query.keyword, $options: "i" };
      filters.$or = [{ name: regex }, { description: regex }];
    }
    if (req.query.category) filters.category = req.query.category;
    // if (req.query.keyword) filters.name = req.query.keyword;

    const totalCategories = await productModal.countDocuments(filters);
    const totalPages = Math.ceil(totalCategories / limit);

    const productList = await productModal
      .find(filters)
      .skip(skip)
      .populate({
        path: "category",
        select: "_id name",
      })
      .limit(limit)
      .select("-deleted -deletedAt")
      .lean();

    const productIds = productList.map((product) => product._id);

    const reviewList = await reviewModal
      .find({
        productId: { $in: productIds },
      })
      .select("-__v -deleted -deletedAt")
      .populate("userId", "name email");

    const reviewMap = {};

    for (const review of reviewList) {
      const pId = review.productId.toString();
      if (!reviewMap[pId]) reviewMap[pId] = [];
      reviewMap[pId].push(review);
    }

    const enrichedProducts = productList.map((product) => {
      const plainProduct = product;
      return {
        ...plainProduct,
        reviewList: reviewMap[product._id.toString()] || [],
      };
    });

    return res.status(200).json({
      message: "products fetched successfully",
      success: true,
      productList: enrichedProducts,
      totalPages,
      totalCategories,
      page: page,
      limit: limit,
      filters,
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
