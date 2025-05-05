import express from "express";
import dotenv from "dotenv";
import connectDb from "./Src/Config/db.js";
import cors from "cors";
import morgan from "morgan";
import CategoryRoute from "./Src/Routes/category.route.js";
import userRoutes from "./Src/Routes/user.route.js";

dotenv.config();

const app = express();

connectDb();

app.use(cors({ methods: ["GET", "POST", "PUT", "PATCH", "DELETE"] }));
app.use(morgan("dev"));
app.use(express.json());



app.use("/v1", CategoryRoute);
app.use("/v1", userRoutes);

app.listen(process.env.TEST_PORT, (req, res) => {
  console.log("serverS is running " + process.env.TEST_PORT);
});
