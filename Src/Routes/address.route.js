import express from "express";
import {
  createAddress,
  deleteAddress,
  fetchAddress,
  fetchDefaultAddress,
  setDefaultAddress,
  updateAddress,
} from "../Controllers/address.controller.js";
import { authentication } from "../Middleware/Auth.js";

const addressRoute = express.Router();

addressRoute.post("/address/create", authentication, createAddress);
addressRoute.get("/address", authentication, fetchAddress);
addressRoute.put("/address/:_id", authentication, updateAddress);
addressRoute.delete("/address/:_id", authentication, deleteAddress);
addressRoute.patch("/address/:_id", authentication, setDefaultAddress);
addressRoute.get("/address/default/:userId", fetchDefaultAddress);

export default addressRoute;
