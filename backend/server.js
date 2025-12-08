require("dotenv").config(); // Load .env variables
const express = require("express");
const connectDB = require("./shared/middlewares/connect-db"); // DB middleware
const cors = require("cors");
const cookieParser = require("cookie-parser");

const server = express();

// ============================================
// CORS Middleware
// ============================================
// Allowed frontend URLs (add all deployed URLs here)
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173", // local dev
  "https://carelist-dkdj.vercel.app",
  "https://carelist-l0xumhmgo-uicccs-projects.vercel.app"
];

server.use(cors({
  origin: function(origin, callback){
    // Allow requests with no origin (Postman, server-to-server)
    if(!origin) return callback(null, true);

    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Middleware to parse JSON and URL-encoded bodies
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());

// Request logging middleware (development only)
if (process.env.NODE_ENV === "development") {
  server.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// Import all routers
// ============================================
const authRoutes = require("./modules/auth/routes/auth-routes");
const patientRoutes = require("./modules/patients/routes/patient-routes");
const doctorRoutes = require("./modules/doctor/routes/doctor-routes");
const hospitalRoutes = require("./modules/hospital/routes/hospital-routes");
const insuranceRoutes = require("./modules/insurance/routes/insurance-routes");
const conditionRoutes = require("./modules/condition/routes/condition-routes");
const admissionRoutes = require("./modules/admission/routes/admission-routes");

const port = process.env.PORT || 3000;
const hostname = "0.0.0.0";

// ============================================
// Connect to MongoDB before starting server
// ============================================
connectDB()
  .then(() => {
    console.log("✅ MongoDB connected. Starting Express server...");

    // Mount routers after DB connection
    server.use("/auth", authRoutes);
    server.use("/patients", patientRoutes);
    server.use("/doctors", doctorRoutes);
    server.use("/hospitals", hospitalRoutes);
    server.use("/insurances", insuranceRoutes);
    server.use("/conditions", conditionRoutes);
    server.use("/admissions", admissionRoutes);

    // Root route
    server.get("/", (req, res) => {
      res.json({
        message: "✅ Hospital Management API is running!",
        version: "1.0.0",
        status: "active",
        endpoints: {
          auth: "/auth (signup, login, verify-otp, logout, me)",
          patients: "/patients",
          doctors: "/doctors",
          hospitals: "/hospitals",
          insurances: "/insurances",
          conditions: "/conditions",
          admissions: "/admissions"
        }
      });
    });

    // 404 handler
    server.use((req, res) => {
      res.status(404).json({
        success: false,
        message: `404! ${req.method} ${req.path} Not Found.`
      });
    });

    // Error handler
    server.use((err, req, res, next) => {
      console.error("❌ Server Error:", err.stack);
      res.status(err.status || 500).json({ 
        success: false,
        error: "Something went wrong on the server.",
        ...(process.env.NODE_ENV === "development" && { 
          message: err.message,
          stack: err.stack 
        })
      });
    });

    // Start server
    server.listen(port, hostname, () => {
      console.log(`🚀 Server running at http://${hostname}:${port}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔐 Auth endpoints: http://${hostname}:${port}/auth`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});
