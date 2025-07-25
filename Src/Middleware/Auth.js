import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
export const RequiredRoles = (...roles) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.headers.authorization)) {
        return res
          .status(403)
          .json({ message: "Access Denied..! Please contact support." });
      }
      next();
    } catch (error) {
      return res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  };
};

export const authentication = (req, res, next) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "unauthorized :(" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decodedToken) => {
      if (error) {
        return res
          .status(401)
          .json({ success: false, message: "Token is not valid!", error });
      }
      req.user = decodedToken;
      console.log(req.user, "req.user");
      
      next();
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
