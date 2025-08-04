import express from "express";
import dotenv from "dotenv";
import connectDb from "./Src/Config/db.js";
import cors from "cors";
import morgan from "morgan";
import CategoryRoute from "./Src/Routes/category.route.js";
import userRoutes from "./Src/Routes/user.route.js";
import path from "path";
import { fileURLToPath } from "url";
import productRoute from "./Src/Routes/product.route.js";
import bookingRoute from "./Src/Routes/booking.route.js";
import addressRoute from "./Src/Routes/address.route.js";
import cartRoute from "./Src/Routes/cart.route.js";
import reviewRoute from "./Src/Routes/review.route.js";

dotenv.config();

const app = express();

connectDb();

// Get current directory name using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app.use(
//   cors({
//     origin:
//       process.env.Node_ENV === "production"
//         ? process.env.FRONT_END_WEBSITE_URL
//         : process.env.FRONT_END_TEST_URL,

//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//   })
// );

const allowedOrigins = [
  process.env.FRONT_END_WEBSITE_URL,
  process.env.FRONT_END_TEST_URL,
  "http://localhost:5173", // Explicitly allow local React dev server
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    // credentials: true, // if you use cookies or auth headers
  })
);

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(
  "/categories",
  express.static(path.join(__dirname, "Public/categories"))
);
app.use("/products", express.static(path.join(__dirname, "Public/products")));

app.use("/v1", CategoryRoute);
app.use("/v1", userRoutes);
app.use("/v1", productRoute);
app.use("/v1", bookingRoute);
app.use("/v1", addressRoute);
app.use("/v1", cartRoute);
app.use("/v1", reviewRoute);

app.listen(process.env.TEST_PORT, (req, res) => {
  console.log("server is running " + process.env.TEST_PORT);
});
