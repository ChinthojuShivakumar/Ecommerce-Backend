import express from "express";
import {
  createCartList,
  fetchCartList,
  updateCart,
} from "../Controllers/cart.controller.js";

const cartRoute = express.Router();

cartRoute.post("/cart/create", createCartList);
cartRoute.get("/cart/list", fetchCartList);
cartRoute.put("/cart/update", updateCart);


export default cartRoute
