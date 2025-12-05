import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";

const PATIENT_API = "http://localhost:3000/patients";
const DOCTOR_API = "http://localhost:3000/doctors";

export default function ApplicationStatusPage() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const fetchPatients = async () => {
    const res = await fetch(PATIENT_API);
    setPatients(await res.json());
  };

  const fetchDoctors = async () => {
    const res = await fetch(DOCTOR_API);
    setDoctors(await res.json());
  };

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
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
              {patients.map((p, index) => {
                const doc = doctors.find((d) => d._id === p.Doctor);

                return (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{p.FullName}</td>
                    <td className="px-6 py-4">{p.Condition}</td>
                    <td className="px-6 py-4">{doc?.DoctorName || "-"}</td>

                    <td className="px-6 py-4">
                      <span className={getStatusColor(p.status)}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {patients.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
