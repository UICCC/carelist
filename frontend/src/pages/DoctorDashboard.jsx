import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";

const API = "http://localhost:3000/patients"; // backend

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);

  // Fetch all appointments
  const fetchAppointments = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setAppointments(data || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Accept or Reject appointment
  const updateStatus = async (id, status) => {
    if (!confirm(`Mark this appointment as ${status}?`)) return;

    try {
      const res = await fetch(`${API}/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      fetchAppointments(); // refresh table
    } catch (err) {
      console.error("Error updating status:", err);
      alert(err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Upcoming Appointments
        </h1>

        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-auto">
            <thead className="bg-blue-50">
              <tr>
                {[
                  "#",
                  "Patient Name",
                  "Age",
                  "Condition",
                  "Date",
                  "Time",
                  "Gender",
                  "Status",
                  "Actions",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-gray-500">
                    No upcoming appointments.
                  </td>
                </tr>
              ) : (
                appointments.map((p, index) => (
                  <tr key={p.PatientID} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{p.FullName}</td>
                    <td className="px-6 py-4">{p.Age}</td>
                    <td className="px-6 py-4">{p.Condition}</td>
                    <td className="px-6 py-4">{p.PreferredDate?.split("T")[0]}</td>
                    <td className="px-6 py-4">{p.PreferredTime}</td>
                    <td className="px-6 py-4">{p.Gender}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          p.status === "Accepted"
                            ? "bg-green-100 text-green-800"
                            : p.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {p.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      {p.status === "Pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(p.PatientID, "Accepted")}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateStatus(p.PatientID, "Rejected")}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
