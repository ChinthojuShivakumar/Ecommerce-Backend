import express from "express";
import {
  createBooking,
  deleteBooking,
  fetchBookingList,
  updateBooking,
  verifyPayment,
} from "../Controllers/booking.controller.js";

const bookingRoute = express.Router();

bookingRoute.post("/booking", createBooking);
bookingRoute.get("/booking", fetchBookingList);
bookingRoute.put("/booking/:_id", updateBooking);
bookingRoute.delete("/booking/:_id", deleteBooking);

bookingRoute.post("/verify-payment", verifyPayment);

export default bookingRoute;
