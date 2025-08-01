import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDb = async () => {
  //   const url = "mongodb://127.0.0.1:27017/buyproduct";
  try {
    mongoose.connect(process.env.PRODUCTION_DB_URI, {
      connectTimeoutMS: 30000,
    });
    const db = mongoose.connection;
    db.on("error", (error) => {
      throw error;
    });
    db.once("open", () => {
      console.log("db connected successful");
    });
  } catch (error) {
    console.warn("Db Connection Failed");
    process.exit(-1);
  }
};

export default connectDb;
