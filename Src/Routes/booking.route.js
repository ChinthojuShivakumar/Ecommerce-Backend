import express from "express";
import {
  createBooking,
  deleteBooking,
  fetchBookingList,
  updateBooking,
  updateStatus,
  verifyPayment,
} from "../Controllers/booking.controller.js";
import { authentication } from "../Middleware/Auth.js";

const bookingRoute = express.Router();

bookingRoute.post("/booking", authentication, createBooking);
bookingRoute.get("/booking", authentication, fetchBookingList);
bookingRoute.put("/booking/:_id", authentication, updateBooking);
bookingRoute.delete("/booking/:_id", authentication, deleteBooking);

bookingRoute.post("/verify-payment", authentication, verifyPayment);
bookingRoute.patch("/booking", authentication, updateStatus);

export default bookingRoute;
