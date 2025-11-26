require("dotenv").config(); // Load .env variables
const express = require("express");
const connectDB = require("./shared/middlewares/connect-db"); // DB middleware
const cors = require("cors"); // <-- ADD THIS

const server = express();

// Middleware to parse JSON and URL-encoded bodies
server.use(cors()); // <-- ENABLE CORS
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Import all routers
const patientRoutes = require("./modules/patients/routes/patient-routes");
const doctorRoutes = require("./modules/doctor/routes/doctor-routes");
const hospitalRoutes = require("./modules/hospital/routes/hospital-routes");
const insuranceRoutes = require("./modules/insurance/routes/insurance-routes");
const conditionRoutes = require("./modules/condition/routes/condition-routes");
const admissionRoutes = require("./modules/admission/routes/admission-routes");

const port = process.env.PORT || 3000;
const hostname = "localhost";

// ✅ Connect to MongoDB ONCE before starting the server
connectDB()
  .then(() => {
    console.log("✅ MongoDB connected. Starting Express server...");

    // Mount routers only after DB connection is ready
    server.use("/patients", patientRoutes);
    server.use("/doctors", doctorRoutes);
    server.use("/hospitals", hospitalRoutes);
    server.use("/insurances", insuranceRoutes);
    server.use("/conditions", conditionRoutes);
    server.use("/admissions", admissionRoutes);

    // Root route
    server.get("/", (req, res) => {
      res.send(
        "✅ API is running! Try /patients, /doctors, /hospitals, /insurances, /conditions, /admissions"
      );
    });

    // 404 handler for unmatched routes
    server.use((req, res) => {
      res.status(404).send(`404! ${req.method} ${req.path} Not Found.`);
    });

    // Error handler
    server.use((err, req, res, next) => {
      console.error("Server Error:", err.stack);
      res.status(500).json({ error: "Something went wrong on the server." });
    });

    // Start the server
    server.listen(port, hostname, () => {
      console.log(`✅ Server running at http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
  });
