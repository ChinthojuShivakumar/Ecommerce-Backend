import express from "express";
import {
  CreateCategory,
  DeleteCategory,
  FetchCategoryList,
  UpdateCategory,
} from "../Controllers/category.controller.js";
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
  multiple: false,
};

const CategoryRoute = express.Router();

// CategoryRoute.route("/category").post()

CategoryRoute.post("/category", FileUpload(FilePayload), CreateCategory);
CategoryRoute.get("/category", FetchCategoryList);
CategoryRoute.put(
  "/category/:_id",
  FileUpload({
    fieldName: "image",
    required: false,
    ALLOWED_FILE_TYPE: ALLOWED_IMAGE_FILES,
    FILE_SIZE: FILE_SIZE,
    UPLOAD_PATH: UPLOAD_PATH,
    multiple: false,
  }),
  UpdateCategory
);
CategoryRoute.delete("/category/:_id", DeleteCategory);

export default CategoryRoute;
