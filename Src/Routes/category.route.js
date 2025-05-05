import express from "express";
import { CreateCategory } from "../Controllers/category.controller.js";
import { FileUpload } from "../../Uploads/multercategory.js";

const UPLOAD_PATH = "Public/categories";
const ALLOWED_IMAGE_FILES = /jpeg|jpg|png|webp/;
const FILE_SIZE = 5 * 1024 * 1024;

const FilePayload = {
  fieldName: "image",
  required: true,
  ALLOWED_FILE_TYPE: ALLOWED_IMAGE_FILES,
  FILE_SIZE: FILE_SIZE,
  UPLOAD_PATH: UPLOAD_PATH,
};

const CategoryRoute = express.Router();

// CategoryRoute.route("/category").post()

CategoryRoute.post("/create", FileUpload(FilePayload), CreateCategory);

export default CategoryRoute;
