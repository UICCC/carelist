// src/main.jsx
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import App from "./App"; // Login page
import AdmissionsPage from "./pages/AdmissionsPage";
import PatientsPage from "./pages/PatientsPage";
import DoctorsPage from "./pages/DoctorsPage";
import HospitalPage from "./pages/HospitalPage";
import ConditionsPage from "./pages/ConditionPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import ApplicationStatusPage from "./pages/ApplicationStatusPage";
import SignUp from "./pages/login/SignUp";
import "./index.css"; // ✅ Must import Tailwind CSS 
import './tailwind.css';

function MainRouter() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <BrowserRouter>
      {/* Show navbar only after login */}
      {isLoggedIn && (
        <nav className="bg-blue-600 text-white px-6 py-3 shadow-md flex gap-6">
          <Link to="/" className="hover:text-gray-200 transition">Dashboard</Link>
          <Link to="/admissions" className="hover:text-gray-200 transition">Admissions</Link>
          <Link to="/patients" className="hover:text-gray-200 transition">Patients</Link>
          <Link to="/doctors" className="hover:text-gray-200 transition">Doctors</Link>
          <Link to="/hospitals" className="hover:text-gray-200 transition">Hospitals</Link>
          <Link to="/conditions" className="hover:text-gray-200 transition">Conditions</Link>
        </nav>
      )}

      <div className="h-screen p-6 overflow-hidden">
        <Routes>
          {/* Default route → App/Login */}
          <Route path="/" element={<App setIsLoggedIn={setIsLoggedIn} />} />

          {/* Other pages */}
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/hospitals" element={<HospitalPage />} />
          <Route path="/conditions" element={<ConditionsPage />} />
          <Route path="/doctorDashboard" element={<DoctorDashboard />} />
          <Route path="/appStatus" element={<ApplicationStatusPage />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MainRouter />
  </React.StrictMode>
);
