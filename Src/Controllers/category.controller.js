import categoryModal from "../Modals/category.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

export const CreateCategory = async (req, res) => {
  try {
    const FindCategory = await categoryModal.findOne({ title: req.body.name });
    if (FindCategory) {
      return res.status(400).json({ message: "category already exist" });
    }
    const FileName = req.file.filename;
    const ImageURL = `${process.env.TEST_IMAGE_URL}/categories/${FileName}`;
    const NewCategory = new categoryModal({
      ...req.body,
      image: ImageURL,
    });
    await NewCategory.save();
    return res.status(201).json({ message: "category successfully created" });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const FetchCategoryList = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;
    const totalCategories = await categoryModal.countDocuments({
      deleted: false,
    });
    const totalPages = Math.ceil(totalCategories / limit);
    const categoryList = await categoryModal
      .find({ deleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-deleted -deletedAt");
    return res.status(200).json({
      message: "categories fetched successfully",
      succuss: true,
      categoryList,
      totalPages,
      totalCategories,
      page: page,
      limit: limit,
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const UpdateCategory = async (req, res) => {
  try {
    const FindCategory = await categoryModal.findOne({
      _id: req.params._id,
      deleted: false,
    });
    if (!FindCategory) {
      return res.status(400).json({ message: "category does not exist" });
    }
   

    const FileName = req?.file?.filename;
    const ImageURL = req.file
      ? `${process.env.TEST_IMAGE_URL}/categories/${FileName}`
      : req.body.image;
    const UpdatedCategory = await categoryModal.updateOne(
      { _id: req.params._id },
      { $set: { ...req.body, image: ImageURL } }
    );

    return res
      .status(202)
      .json({ message: "category updated created", UpdatedCategory });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

export const DeleteCategory = async (req, res) => {
  try {
    const FindCategory = await categoryModal.findOne({
      _id: req.params._id,
      deleted: false,
    });
    if (!FindCategory) {
      return res
        .status(400)
        .json({ message: "Category Not Found", succuss: false });
    }

    const deletedCategory = await categoryModal.updateOne(
      { _id: req.params._id },
      { $set: { deleted: true, deletedAt: Date.now() } }
    );
    res.status(202).json({
      message: "Category Deleted Successfully",
      deletedCategory,
      succuss: true,
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
