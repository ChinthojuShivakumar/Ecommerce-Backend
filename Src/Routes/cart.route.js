import express from "express";
import {
  createCartList,
  deleteCartItem,
  fetchCartList,
  updateCart,
} from "../Controllers/cart.controller.js";
import { authentication } from "../Middleware/Auth.js";

const cartRoute = express.Router();

cartRoute.post("/cart/create", authentication, createCartList);
cartRoute.get("/cart/list", authentication, fetchCartList);
cartRoute.put("/cart/update", authentication, updateCart);
cartRoute.delete("/cart/:_id", authentication, deleteCartItem);

export default cartRoute;
