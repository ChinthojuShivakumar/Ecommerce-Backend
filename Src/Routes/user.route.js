import express from "express";
import {
  CreateUser,
  DeleteUser,
  FetchUsers,
  UpdateUser,
} from "../Controllers/user.controller.js";

const userRoutes = express.Router();

userRoutes.post("/user", CreateUser);
userRoutes.get("/user", FetchUsers);
userRoutes.put("/user/:_id", UpdateUser);
userRoutes.delete("/user/:_id", DeleteUser);

export default userRoutes
