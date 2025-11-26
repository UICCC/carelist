import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdmissionsPage from "./pages/AdmissionsPage";
import PatientsPage from "./pages/PatientsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Dashboard</h1>} />

        <Route path="/admissions" element={<AdmissionsPage />} />
        <Route path="/patients" element={<PatientsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
