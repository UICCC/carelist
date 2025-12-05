const jwt = require("jsonwebtoken");
const User = require("../models/user-model");

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";

// Verify JWT Token
const verifyToken = async (req, res, next) => {
  try {
    // Get token from header or cookie
    let token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "No token provided. Access denied." 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token. User not found." 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false,
        message: "Account is deactivated. Access denied." 
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error("❌ Token verification error:", error.message);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false,
        message: "Token expired. Please login again.",
        expired: true
      });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token. Please login again." 
      });
    }
    
    return res.status(401).json({ 
      success: false,
      message: "Authentication failed." 
    });
  }
};

// Role-Based Access Control Middleware
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required." 
      });
    }

    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(", ")}. Your role: ${req.user.role}`,
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      
      if (user && user.isActive) {
        req.user = user;
        req.token = token;
      }
    }
    
    next();
  } catch (error) {
    // Don't fail, just continue without user
    next();
  }
};

module.exports = { 
  verifyToken, 
  requireRole, 
  optionalAuth,
  JWT_SECRET 
};