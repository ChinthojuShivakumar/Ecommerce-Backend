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
    const categoryId = req.params._id;

    const existingCategory = await categoryModal.findOne({
      _id: categoryId,
      deleted: false,
    });

    if (!existingCategory) {
      return res
        .status(400)
        .json({ success: false, message: "Category does not exist" });
    }

    let newImageURL = existingCategory.image;

    if (req?.file?.filename) {
      const newFileName = req.file.filename;
      newImageURL = `${process.env.TEST_IMAGE_URL}/categories/${newFileName}`;

      // ✅ Safely delete old image
      if (
        existingCategory.image &&
        existingCategory.image.includes("/categories/")
      ) {
        const oldFileName = existingCategory.image.split("/categories/")[1];
        if (oldFileName) {
          const oldFilePath = path.join("public/categories", oldFileName);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
            console.log(`🗑️ Deleted old category image: ${oldFilePath}`);
          }
        }
      }
    }

    const updatedCategory = await categoryModal.updateOne(
      { _id: categoryId },
      { $set: { ...req.body, image: newImageURL } }
    );

    return res.status(202).json({
      success: true,
      message: "Category updated successfully",
      updatedCategory,
    });
  } catch (error) {
    console.error("❌ Category update error:", error);
    return res.status(500).json({ success: false, error: error.message });
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
