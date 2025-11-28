import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import AdmissionsPage from "./pages/AdmissionsPage";
import PatientsPage from "./pages/PatientsPage";
import DoctorsPage from "./pages/DoctorsPage";
import HospitalPage from "./pages/HospitalPage"
import ConditionsPage from "./pages/ConditionPage";
function App() {
  return (
    <BrowserRouter>
      {/* NAVIGATION BAR */}
      <nav className="bg-blue-600 text-white px-6 py-3 shadow-md flex gap-6">
        <Link to="/" className="hover:text-gray-200 transition">Dashboard</Link>
        <Link to="/admissions" className="hover:text-gray-200 transition">Admissions</Link>
        <Link to="/patients" className="hover:text-gray-200 transition">Patients</Link>
        <Link to="/doctors" className="hover:text-gray-200 transition">Doctors</Link>
        <Link to="/hospitals" className="hover:text-gray-200 transition">Hospitals</Link>
        <Link to="/conditions" className="hover:text-gray-200 transition">Conditions</Link>
      </nav>

      {/* ROUTES */}
      <div className="p-6">
        <Routes>
          <Route path="/" element={<h1 className="text-2xl font-bold">Dashboard</h1>} />

          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/hospitals" element={<HospitalPage />} />
          <Route path="/conditions" element={<ConditionsPage />} />
          
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
