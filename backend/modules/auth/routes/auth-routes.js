const express = require("express");
const router = express.Router();
const User = require("../models/user-model");
const jwt = require("jsonwebtoken");
const { sendOTPEmail, sendWelcomeEmail } = require("../utils/email-service");
const { verifyToken } = require("../middlewares/auth-middleware");

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";

// ============================================
// SIGNUP ROUTE - Register new user
// ============================================
router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required (fullName, email, password)" 
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Please enter a valid email address" 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 6 characters long" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "User with this email already exists" 
      });
    }

    // Validate role
    const validRoles = ["admin", "doctor", "patient"];
    const userRole = role && validRoles.includes(role) ? role : "doctor";

    // Create new user
    const user = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: userRole,
    });

    await user.save();

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.fullName, user.role).catch(err => 
      console.error("Failed to send welcome email:", err)
    );

    console.log("✅ New user registered:", user.email);

    res.status(201).json({
      success: true,
      message: "Registration successful! Please login to continue.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Signup error:", error);
    
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: messages.join(", ") 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Server error during registration. Please try again." 
    });
  }
});

// ============================================
// LOGIN ROUTE - Step 1: Validate credentials and send OTP
// ============================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    // Find user (include OTP fields)
    const user = await User.findOne({ email: email.toLowerCase() })
      .select("+otp +otpExpiry");
      
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false,
        message: "Your account has been deactivated. Please contact support." 
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // Generate OTP using model method
    const otp = user.generateOTP();
    
    // Save OTP to database
    await user.save();

    // Send OTP via email
    try {
      await sendOTPEmail(user.email, otp, user.fullName);
      
      console.log("✅ Login initiated for:", user.email);
      console.log("📧 OTP sent successfully");

      res.status(200).json({
        success: true,
        message: "OTP has been sent to your email. Please verify to complete login.",
        data: {
          email: user.email,
          otpSent: true,
          expiresIn: "10 minutes"
        }
      });
    } catch (emailError) {
      // Clear OTP if email fails
      user.clearOTP();
      await user.save();
      
      throw new Error("Failed to send OTP email. Please try again.");
    }

  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Server error during login. Please try again." 
    });
  }
});

// ============================================
// VERIFY OTP ROUTE - Step 2: Verify OTP and issue JWT
// ============================================
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        message: "Email and OTP are required" 
      });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ 
        success: false,
        message: "OTP must be a 6-digit number" 
      });
    }

    // Find user with OTP fields
    const user = await User.findOne({ email: email.toLowerCase() })
      .select("+otp +otpExpiry");
      
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Verify OTP using model method
    const otpVerification = user.verifyOTP(otp);
    
    if (!otpVerification.valid) {
      return res.status(401).json({ 
        success: false,
        message: otpVerification.message 
      });
    }

    // OTP is valid - Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    // Clear OTP and update last login
    user.clearOTP();
    user.isVerified = true;
    user.lastLogin = new Date();
    await user.save();

    console.log("✅ Login successful for:", user.email);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin
      },
    });
  } catch (error) {
    console.error("❌ OTP verification error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error during OTP verification. Please try again." 
    });
  }
});

// ============================================
// RESEND OTP ROUTE
// ============================================
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Email is required" 
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
      .select("+otp +otpExpiry");
      
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP
    await sendOTPEmail(user.email, otp, user.fullName);

    console.log("✅ OTP resent to:", user.email);

    res.status(200).json({ 
      success: true,
      message: "New OTP has been sent to your email",
      data: {
        email: user.email,
        expiresIn: "10 minutes"
      }
    });
  } catch (error) {
    console.error("❌ Resend OTP error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to resend OTP. Please try again." 
    });
  }
});

// ============================================
// LOGOUT ROUTE (Protected)
// ============================================
router.post("/logout", verifyToken, async (req, res) => {
  try {
    // In stateless JWT, logout is handled client-side
    // But we can log the event for security monitoring
    console.log("✅ User logged out:", req.user.email);
    
    res.status(200).json({ 
      success: true,
      message: "Logged out successfully" 
    });
  } catch (error) {
    console.error("❌ Logout error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error during logout" 
    });
  }
});

// ============================================
// GET CURRENT USER ROUTE (Protected)
// ============================================
router.get("/me", verifyToken, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        role: req.user.role,
        isVerified: req.user.isVerified,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt
      },
    });
  } catch (error) {
    console.error("❌ Get user error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching user data" 
    });
  }
});

// ============================================
// CHECK EMAIL EXISTS (For UI validation)
// ============================================
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Email is required" 
      });
    }
    
    const exists = await User.exists({ email: email.toLowerCase() });
    
    res.status(200).json({
      success: true,
      exists: !!exists
    });
  } catch (error) {
    console.error("❌ Check email error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error checking email" 
    });
  }
});

module.exports = router;