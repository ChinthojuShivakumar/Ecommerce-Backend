import express from "express";
import {
  createCartList,
  deleteCartItem,
  fetchCartList,
  updateCart,
} from "../Controllers/cart.controller.js";

const cartRoute = express.Router();

cartRoute.post("/cart/create", createCartList);
cartRoute.get("/cart/list", fetchCartList);
cartRoute.put("/cart/update", updateCart);
cartRoute.delete("/cart/delete", deleteCartItem);

export default cartRoute;
