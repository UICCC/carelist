import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";

const PATIENT_API = "http://localhost:3000/patients";
const DOCTOR_API = "http://localhost:3000/doctors";

export default function ApplicationStatusPage() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Create headers with auth token
  const getAuthHeaders = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Check auth and redirect if needed
  const checkAuth = () => {
    const token = getToken();
    if (!token) {
      alert("Session expired. Please login again.");
      window.location.href = '/';
      return false;
    }
    return true;
  };

  const fetchPatients = async () => {
    if (!checkAuth()) return;

    try {
      const res = await fetch(PATIENT_API, {
        headers: getAuthHeaders()
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        alert("Session expired. Please login again.");
        window.location.href = '/';
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch patients: ${res.status}`);
      }

      const data = await res.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch patients error:", err);
      setError(err.message);
    }
  };

  const fetchDoctors = async () => {
    if (!checkAuth()) return;

    try {
      const res = await fetch(DOCTOR_API, {
        headers: getAuthHeaders()
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        alert("Session expired. Please login again.");
        window.location.href = '/';
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch doctors: ${res.status}`);
      }

      const data = await res.json();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch doctors error:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      await Promise.all([fetchPatients(), fetchDoctors()]);
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const getStatusColor = (status) => {
    if (status === "Accepted") return "text-green-600 font-semibold";
    if (status === "Rejected") return "text-red-600 font-semibold";
    return "text-yellow-600 font-semibold";
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Application Status</h1>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            Loading application status...
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 table-auto">
            <thead className="bg-blue-50">
              <tr>
                {["#", "Name", "Condition", "Doctor", "Status"].map((col) => (
                  <th key={col} className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-600">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patients.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No applications found.
                  </td>
                </tr>
              ) : (
                patients.map((p, index) => {
                  const doc = doctors.find((d) => d._id === (p.Doctor?._id || p.Doctor));

                  return (
                    <tr key={p._id || p.PatientID} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4">{p.FullName}</td>
                      <td className="px-6 py-4">{p.Condition}</td>
                      <td className="px-6 py-4">{doc?.DoctorName || "-"}</td>
                      <td className="px-6 py-4">
                        <span className={getStatusColor(p.status)}>
                          {p.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
} 