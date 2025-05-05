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
