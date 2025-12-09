import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";

const PATIENT_API = "http://localhost:3000/patients";
const DOCTOR_API = "http://localhost:3000/doctors";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const patientsPerPage = 5;

  const [formData, setFormData] = useState({
    FullName: "",
    Age: "",
    Condition: "",
    PreferredDate: "",
    PreferredTime: "",
    Gender: "",
    Doctor: ""
  });

  const [doctors, setDoctors] = useState([]);
  const [errors, setErrors] = useState({});
  const [doctorFilter, setDoctorFilter] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);

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

  // Pagination calculations
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = patients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(patients.length / patientsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getWeekdayName = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", { 
      weekday: "long",
      timeZone: "UTC"
    });
  };

  const fetchPatients = async () => {
    if (!checkAuth()) return;
    
    try {
      setLoading(true);
      setError(null);
      
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
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
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
      console.error("Error fetching doctors:", err);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(d =>
    d.DoctorName.toLowerCase().includes(doctorFilter.toLowerCase()) ||
    d.Specialty.toLowerCase().includes(doctorFilter.toLowerCase())
  );

  useEffect(() => {
    if (!formData.Doctor || !formData.PreferredDate) {
      setAvailableSlots([]);
      return;
    }

    const doctor = doctors.find(d => d._id === formData.Doctor);
    
    if (!doctor || !doctor.Availability) {
      setAvailableSlots([]);
      return;
    }

    const weekday = getWeekdayName(formData.PreferredDate);
    const availability = doctor.Availability.find(av => av.day === weekday);

    if (!availability) {
      setAvailableSlots([]);
      return;
    }

    const slots = [];
    let [startH, startM] = availability.startTime.split(":").map(Number);
    let [endH, endM] = availability.endTime.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      // Store object with value (time only) and display text (weekday + time)
      slots.push({
        value: time,
        display: `${weekday} ${time}`
      });
    }

    setAvailableSlots(slots);
  }, [formData.Doctor, formData.PreferredDate, doctors]);

  const validateForm = () => {
    const e = {};
    if (!formData.FullName.trim()) e.FullName = "Full name is required";
    if (!formData.Age) e.Age = "Age is required";
    if (!formData.Condition.trim()) e.Condition = "Condition is required";
    if (!formData.PreferredDate) e.PreferredDate = "Preferred date is required";
    if (!formData.PreferredTime) e.PreferredTime = "Preferred time is required";
    if (!["Male", "Female", "Other"].includes(formData.Gender)) e.Gender = "Select a valid gender";
    if (!formData.Doctor) e.Doctor = "Please select a doctor";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const createPatient = async (e) => {
    e.preventDefault();
    if (!validateForm() || !checkAuth()) return;
    
    try {
      console.log("Sending create data:", formData);
      
      const res = await fetch(PATIENT_API, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        alert("Session expired. Please login again.");
        window.location.href = '/';
        return;
      }

      if (res.status === 403) {
        alert("Access denied. Only admins can create appointments.");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to create patient");
      }

      fetchPatients();
      resetForm();
      setCurrentPage(1);
      alert("Patient added successfully!");
    } catch (err) {
      console.error("Create error:", err);
      alert("Error creating patient: " + err.message);
    }
  };

  const startEdit = (p) => {
    // Use MongoDB _id for editing
    setEditingId(p._id);
    
    setFormData({
      FullName: p.FullName,
      Age: p.Age,
      Condition: p.Condition,
      PreferredDate: p.PreferredDate?.split("T")[0] || "",
      PreferredTime: p.PreferredTime,
      Gender: p.Gender,
      Doctor: p.Doctor?._id || p.Doctor || ""
    });
  };

  const updatePatient = async (e) => {
    e.preventDefault();
    if (!editingId || !validateForm() || !checkAuth()) return;
    
    try {
      console.log("Sending update data:", formData);
      
      const res = await fetch(`${PATIENT_API}/${editingId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        alert("Session expired. Please login again.");
        window.location.href = '/';
        return;
      }

      if (res.status === 403) {
        alert("Access denied. Only admins can update appointments.");
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Server validation error:", errorData);
        alert("Validation error: " + JSON.stringify(errorData));
        throw new Error("Failed to update patient");
      }

      fetchPatients();
      resetForm();
      alert("Patient updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      alert("Error updating patient: " + err.message);
    }
  };

  const deletePatient = async (id) => {
    if (!confirm("Delete this patient?") || !checkAuth()) return;
    
    try {
      const res = await fetch(`${PATIENT_API}/${id}`, { 
        method: "DELETE",
        headers: getAuthHeaders()
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        alert("Session expired. Please login again.");
        window.location.href = '/';
        return;
      }

      if (res.status === 403) {
        alert("Access denied. Only admins can delete appointments.");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to delete patient");
      }

      fetchPatients();
      if (currentPatients.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      alert("Patient deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting patient: " + err.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      FullName: "",
      Age: "",
      Condition: "",
      PreferredDate: "",
      PreferredTime: "",
      Gender: "",
      Doctor: ""
    });
    setErrors({});
    setDoctorFilter("");
    setAvailableSlots([]);
  };

  const getDoctorSchedule = (doctorId) => {
    const doctor = doctors.find(d => d._id === doctorId);
    if (!doctor || !doctor.Availability) return [];
    return doctor.Availability;
  };

  return (
    <DashboardLayout>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 -m-6 min-h-full">
        <div className="max-w-7xl mx-auto pb-8">
          {/* Header */}
          <div className="mb-6 pt-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Patient Management</h1>
            <p className="text-sm text-gray-600">Manage patient appointments and information</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg mb-4">
              Loading patients...
            </div>
          )}

          {/* FORM */}
          <div className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? "✏️ Update Patient" : "➕ Add New Patient"}
              </h2>
              {editingId && (
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition text-sm font-medium"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={formData.FullName}
                  onChange={(e) => setFormData({ ...formData, FullName: e.target.value })}
                  className={`border px-3 py-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 transition ${errors.FullName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                  required
                />
                {errors.FullName && <p className="text-red-500 text-xs mt-1">{errors.FullName}</p>}
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  placeholder="Enter age"
                  value={formData.Age}
                  onChange={(e) => setFormData({ ...formData, Age: e.target.value })}
                  className={`border px-3 py-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 transition ${errors.Age ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                  required
                />
                {errors.Age && <p className="text-red-500 text-xs mt-1">{errors.Age}</p>}
              </div>

              {/* Condition */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Condition</label>
                <input
                  type="text"
                  placeholder="Enter medical condition"
                  value={formData.Condition}
                  onChange={(e) => setFormData({ ...formData, Condition: e.target.value })}
                  className={`border px-3 py-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 transition ${errors.Condition ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                  required
                />
                {errors.Condition && <p className="text-red-500 text-xs mt-1">{errors.Condition}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={formData.Gender}
                  onChange={(e) => setFormData({ ...formData, Gender: e.target.value })}
                  className={`border px-3 py-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 transition ${errors.Gender ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.Gender && <p className="text-red-500 text-xs mt-1">{errors.Gender}</p>}
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={formData.PreferredDate}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    PreferredDate: e.target.value,
                    PreferredTime: ""
                  })}
                  className={`border px-3 py-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 transition ${errors.PreferredDate ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.PreferredDate && <p className="text-red-500 text-xs mt-1">{errors.PreferredDate}</p>}
                {formData.PreferredDate && (
                  <p className="text-xs mt-1 text-blue-600 font-medium">
                    📅 {formData.PreferredDate} ({getWeekdayName(formData.PreferredDate)})
                  </p>
                )}
              </div>

              {/* Time Slot */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Time Slot</label>
                <select
                  value={formData.PreferredTime}
                  onChange={(e) => setFormData({ ...formData, PreferredTime: e.target.value })}
                  className={`border px-3 py-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 transition ${errors.PreferredTime ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                  required
                  disabled={!formData.PreferredDate || availableSlots.length === 0}
                >
                  <option value="">Select Time Slot</option>
                  {availableSlots.length === 0 ? (
                    formData.Doctor && formData.PreferredDate ? (
                      <option value="" disabled>
                        No slots available for {getWeekdayName(formData.PreferredDate)}
                      </option>
                    ) : (
                      <option value="" disabled>
                        {!formData.Doctor ? "Select a doctor first" : "Select a date first"}
                      </option>
                    )
                  ) : (
                    availableSlots.map((slot, idx) => (
                      <option key={idx} value={slot.value}>
                        {slot.display}
                      </option>
                    ))
                  )}
                </select>
                {errors.PreferredTime && <p className="text-red-500 text-xs mt-1">{errors.PreferredTime}</p>}
                {availableSlots.length > 0 && (
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    ✓ {availableSlots.length} slot(s) available
                  </p>
                )}
              </div>

              {/* Doctor Filter + Dropdown */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Doctor</label>
                <input
                  type="text"
                  placeholder="🔍 Filter doctors by name or specialty..."
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 transition"
                />
                <select
                  value={formData.Doctor}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    Doctor: e.target.value,
                    PreferredDate: "",
                    PreferredTime: ""
                  })}
                  className={`border px-3 py-2 rounded-lg w-full text-sm focus:outline-none focus:ring-2 transition ${errors.Doctor ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}`}
                  required
                >
                  <option value="">Select Doctor</option>
                  {filteredDoctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      Dr. {d.DoctorName} - {d.Specialty}
                    </option>
                  ))}
                </select>
                {errors.Doctor && <p className="text-red-500 text-xs mt-1">{errors.Doctor}</p>}
                {formData.Doctor && (
                  <div className="text-xs text-blue-700 mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="font-semibold mb-1">👨‍⚕️ Doctor's Schedule:</div>
                    {getDoctorSchedule(formData.Doctor).length === 0 ? (
                      <div className="text-gray-600">No schedule available</div>
                    ) : (
                      <div className="space-y-0.5">
                        {getDoctorSchedule(formData.Doctor).map((av, idx) => (
                          <div key={idx} className="ml-2">
                            <span className="font-medium">{av.day}:</span> {av.startTime} - {av.endTime}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <button 
                  onClick={editingId ? updatePatient : createPatient}
                  className={`w-full text-white font-semibold py-2.5 rounded-lg transition shadow-lg text-sm ${editingId ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {editingId ? "💾 Update Patient" : "➕ Add Patient"}
                </button>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
            <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600">
              <h3 className="text-lg font-bold text-white">Patient Records ({patients.length} total)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["#", "Name", "Age", "Condition", "Date", "Time", "Gender", "Doctor", "Specialty", "Actions"].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPatients.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-6 text-gray-500">
                        <div className="text-3xl mb-1">📋</div>
                        <div className="text-sm">No patients found</div>
                      </td>
                    </tr>
                  ) : (
                    currentPatients.map((p, index) => {
                      const doc = doctors.find(d => d._id === (p.Doctor?._id || p.Doctor));
                      const dateStr = p.PreferredDate?.split("T")[0];
                      const dayName = dateStr ? getWeekdayName(dateStr) : "";
                      const globalIndex = indexOfFirstPatient + index + 1;
                      
                      return (
                        <tr key={p._id} className="hover:bg-blue-50 transition">
                          <td className="px-4 py-3 text-xs text-gray-900">{globalIndex}</td>
                          <td className="px-4 py-3 text-xs font-medium text-gray-900">{p.FullName}</td>
                          <td className="px-4 py-3 text-xs text-gray-900">{p.Age}</td>
                          <td className="px-4 py-3 text-xs text-gray-900">{p.Condition}</td>
                          <td className="px-4 py-3 text-xs text-gray-900">
                            {dateStr ? (
                              <div>
                                <div className="font-medium">{dateStr}</div>
                                <div className="text-xs text-gray-500">{dayName}</div>
                              </div>
                            ) : "-"}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-900">{p.PreferredTime}</td>
                          <td className="px-4 py-3 text-xs text-gray-900">{p.Gender}</td>
                          <td className="px-4 py-3 text-xs text-gray-900">{doc?.DoctorName || "-"}</td>
                          <td className="px-4 py-3 text-xs text-gray-900">{doc?.Specialty || "-"}</td>
                          <td className="px-4 py-3 flex gap-2">
                            <button 
                              onClick={() => startEdit(p)} 
                              className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg transition shadow text-xs font-medium"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => deletePatient(p._id)} 
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition shadow text-xs font-medium"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstPatient + 1} to {Math.min(indexOfLastPatient, patients.length)} of {patients.length} patients
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}