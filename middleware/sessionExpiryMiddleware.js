import jwt from "jsonwebtoken"; // JWT library
import UserSchema from "../models/UserSchema"; // User model

const SESSION_EXPIRY_TIME = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export default sessionExpiryMiddleware = async (req, res, next) => {
  try {
    // Extract token from headers
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database
    const user = await UserSchema.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    // Check last activity timestamp
    const lastActivity = user.lastActivity || user.createdAt;
    const now = Date.now();

    if (now - new Date(lastActivity).getTime() > SESSION_EXPIRY_TIME) {
      // Session expired
      return res
        .status(401)
        .json({ message: "Session expired. Please log in again." });
    }

    // Update last activity
    user.lastActivity = now;
    await user.save();

    // Pass control to the next middleware
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in session expiry middleware:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};


