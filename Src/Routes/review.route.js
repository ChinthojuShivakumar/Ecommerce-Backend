import express from "express";
import {
  createReview,
  deleteReview,
  fetchReviewsList,
  updateReview,
} from "../Controllers/review.controller.js";
import { authentication } from "../Middleware/Auth.js";

const reviewRoute = express.Router();

reviewRoute.post("/review/create", authentication, createReview);
reviewRoute.get("/review/list", authentication, fetchReviewsList);
reviewRoute.put("/review/:_id", authentication, updateReview);
reviewRoute.delete("/review/:_id", authentication, deleteReview);

export default reviewRoute;
