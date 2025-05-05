import categoryModal from "../Modals/category.js";
import dotenv from "dotenv";

dotenv.config();

export const CreateCategory = async (req, res) => {
  try {
    const FindCategory = await categoryModal.findOne({ title: req.body.title });
    if (FindCategory) {
      return res.status(400).json({ message: "category already exist" });
    }
    const FileName = req.file.filename;
    const ImageURL = `${process.env.TEST_PORT}/${FileName}`;
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
