import express from "express";
import {
  createAddress,
  deleteAddress,
  fetchAddress,
  updateAddress,
} from "../Controllers/address.controller.js";

const addressRoute = express.Router();

addressRoute.post("/address/create", createAddress);
addressRoute.get("/address", fetchAddress);
addressRoute.put("/address/:_id", updateAddress);
addressRoute.delete("/address/:_id", deleteAddress);

export default addressRoute;
