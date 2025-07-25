import express from "express";
import {
  changeUserStatus,
  CreateUser,
  DeleteUser,
  FetchUsers,
  loginUser,
  UpdateUser,
} from "../Controllers/user.controller.js";
import { authentication } from "../Middleware/Auth.js";

const userRoutes = express.Router();

userRoutes.post("/user", CreateUser);
userRoutes.get("/user", authentication, FetchUsers);
userRoutes.put("/user/:_id", UpdateUser);
userRoutes.delete("/user/:_id", DeleteUser);

userRoutes.post("/signup", CreateUser);
userRoutes.post("/signin", loginUser);

userRoutes.post("/user/deactivate/:_id", changeUserStatus);

export default userRoutes;
