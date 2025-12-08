import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API = `${API_BASE}/patients`; // backend

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "All",
    searchName: "",
    date: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch all appointments with authentication
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = getToken();
      
      if (!token) {
        setError("No authentication token found. Please login.");
        window.location.href = '/';
        return;
      }

      const res = await fetch(API, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch appointments: ${res.status}`);
      }

      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter appointments
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesStatus =
      filters.status === "All" || appointment.status === filters.status;
    const matchesName =
      filters.searchName === "" ||
      appointment.FullName.toLowerCase().includes(filters.searchName.toLowerCase());
    const matchesDate =
      filters.date === "" || appointment.PreferredDate?.split("T")[0] === filters.date;

    return matchesStatus && matchesName && matchesDate;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Accept or Reject appointment with authentication
  const updateStatus = async (id, status) => {
    if (!confirm(`Mark this appointment as ${status}?`)) return;

    try {
      const token = getToken();
      
      if (!token) {
        alert("No authentication token found. Please login.");
        window.location.href = '/';
        return;
      }

      console.log("Updating status for PatientID:", id, "Status:", status);
      console.log("API URL:", `${API}/${id}/status`);

      const res = await fetch(`${API}/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
      });

      if (res.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }

      if (res.status === 403) {
        alert("Access denied. You can only update your own appointments.");
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || errorData.details || "Failed to update status");
      }

      fetchAppointments(); // refresh table
    } catch (err) {
      console.error("Error updating status:", err);
      alert(err.message);
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="h-screen bg-gray-100 p-6 flex flex-col">
      {/* Header with Title and Logout */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Upcoming Appointments
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium text-sm"
        >
          Logout
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-3 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          {/* Search by Name */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Search Patient
            </label>
            <input
              type="text"
              placeholder="Search by name..."
              value={filters.searchName}
              onChange={(e) =>
                setFilters({ ...filters, searchName: e.target.value })
              }
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filter by Status */}
          <div className="w-40">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Filter by Date */}
          <div className="w-44">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Date
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) =>
                setFilters({ ...filters, date: e.target.value })
              }
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={() =>
              setFilters({ status: "All", searchName: "", date: "" })
            }
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg flex-1 flex flex-col overflow-hidden">
        <div className="overflow-auto flex-1">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50 sticky top-0">
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

            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-gray-500">
                    Loading appointments...
                  </td>
                </tr>
              ) : currentAppointments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-gray-500">
                    No upcoming appointments.
                  </td>
                </tr>
              ) : (
                currentAppointments.map((p, index) => (
                  <tr key={p.PatientID} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{startIndex + index + 1}</td>
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
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredAppointments.length > itemsPerPage && (
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">{Math.min(endIndex, filteredAppointments.length)}</span> of{" "}
              <span className="font-medium">{filteredAppointments.length}</span> appointments
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => goToPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}