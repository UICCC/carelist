const jwt = require("jsonwebtoken");
const User = require("../models/user-model");

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";

// Verify JWT Token
const verifyToken = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if (!token) return res.status(401).json({ success: false, message: "No token provided." });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) return res.status(401).json({ success: false, message: "Invalid token." });
    if (!user.isActive) return res.status(403).json({ success: false, message: "Account deactivated." });

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error("Token error:", error.message);
    return res.status(401).json({ success: false, message: "Authentication failed." });
  }
};

// Role-Based Access Control
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required." });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Access denied. Required role(s): ${allowedRoles.join(", ")}.` });
    }
    next();
  };
};

// Optional auth
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      if (user && user.isActive) req.user = user;
    }
    next();
  } catch {
    next();
  }
};

module.exports = { verifyToken, requireRole, optionalAuth, JWT_SECRET };
