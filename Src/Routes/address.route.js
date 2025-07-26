import express from "express";
import {
  createAddress,
  deleteAddress,
  fetchAddress,
  setDefaultAddress,
  updateAddress,
} from "../Controllers/address.controller.js";

const addressRoute = express.Router();

addressRoute.post("/address/create", createAddress);
addressRoute.get("/address", fetchAddress);
addressRoute.put("/address/:_id", updateAddress);
addressRoute.delete("/address/:_id", deleteAddress);
addressRoute.patch("/address/:_id", setDefaultAddress);

export default addressRoute;
