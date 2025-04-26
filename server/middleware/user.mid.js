import jwt from "jsonwebtoken";
import config from "../config.js";
import { User } from "../models/user.model.js"; // Adjust path as needed

const userMiddleware = async (req, res, next) => {
  try {
    console.log("Middleware started - Request headers:", req.headers);
    console.log("Middleware started - Request cookies:", req.cookies);

    const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];
    console.log("Extracted token in userMiddleware:", token);

    if (!token) {
      console.log("No token provided in request");
      return res.status(401).json({ errors: "No token provided" });
    }

    const decoded = jwt.verify(token, config.JWT_USER_PASSWORD);
    console.log("Decoded token in userMiddleware:", decoded);

    // Fetch user from database
    const user = await User.findById(decoded.id);
    console.log("Fetched user from DB in userMiddleware for ID:", decoded.id, "Result:", user);

    if (!user) {
      console.log("User not found in database for ID:", decoded.id);
      return res.status(401).json({ errors: "User not found" });
    }

    req.user = user; // Set req.user to the full user document
    console.log("Set req.user in userMiddleware:", req.user._id, req.user);
    next();
  } catch (error) {
    console.error("Token verification error in userMiddleware:", error.message, error.stack);
    return res.status(401).json({ errors: "Invalid authorization or expired token", details: error.message });
  }
};

export default userMiddleware;