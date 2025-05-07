import express from "express";
import { createProduct } from "../Controllers/product.controller.js";
import { FileUpload } from "../../Uploads/multercategory.js";

const productRoute = express.Router();

const UPLOAD_PATH = "Public/products";
const ALLOWED_IMAGE_FILES = /jpeg|jpg|png|webp/;
const FILE_SIZE = 5 * 1024 * 1024;

const FilePayload = {
  fieldName: "image",
  required: true,
  ALLOWED_FILE_TYPE: ALLOWED_IMAGE_FILES,
  FILE_SIZE: FILE_SIZE,
  UPLOAD_PATH: UPLOAD_PATH,
  multiple: true,
  maxCount: 5,
};

productRoute.post("/product", FileUpload(FilePayload), createProduct);

export default productRoute;
