const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: [true, "Full name is required"],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, "Email is required"],
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
  },
  password: { 
    type: String, 
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"]
  },
  role: { 
    type: String, 
    enum: {
      values: ["admin", "doctor", "patient"],
      message: "{VALUE} is not a valid role"
    },
    default: "doctor",
    required: true 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  // OTP fields for MFA
  otp: { 
    type: String,
    select: false  // Don't return OTP in queries by default
  },
  otpExpiry: { 
    type: Date,
    select: false  // Don't return expiry in queries by default
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash if password is modified
  if (!this.isModified("password")) return next();
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update the updatedAt timestamp
userSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Method to generate OTP
userSchema.methods.generateOTP = function() {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set OTP and expiry (10 minutes)
  this.otp = otp;
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  
  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(candidateOTP) {
  // Check if OTP exists
  if (!this.otp) {
    return { valid: false, message: "No OTP found. Please request a new one." };
  }
  
  // Check if OTP is expired
  if (new Date() > this.otpExpiry) {
    return { valid: false, message: "OTP has expired. Please request a new one." };
  }
  
  // Check if OTP matches
  if (this.otp !== candidateOTP) {
    return { valid: false, message: "Invalid OTP. Please try again." };
  }
  
  return { valid: true, message: "OTP verified successfully" };
};

// Method to clear OTP
userSchema.methods.clearOTP = function() {
  this.otp = undefined;
  this.otpExpiry = undefined;
};

// Create indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;