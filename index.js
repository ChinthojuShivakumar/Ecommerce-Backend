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

dotenv.config();

const app = express();

connectDb();

// Get current directory name using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] }));
app.use(morgan("dev"));
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

app.listen(process.env.TEST_PORT, (req, res) => {
  console.log("server is running " + process.env.TEST_PORT);
});
