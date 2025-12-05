import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";

const API = "http://localhost:3000/doctors";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const [formData, setFormData] = useState({
    DoctorName: "",
    Specialty: "",
    Department: "",
    Phone: "",
    Email: "",
    YearsOfExperience: "",
    Availability: [{ day: "Monday", startTime: "09:00", endTime: "17:00" }]
  });

  const [errors, setErrors] = useState({});

  // ------------------------ FETCH ------------------------
  const fetchDoctors = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      console.log("Fetched doctors:", data);
      setDoctors(data || []);
    } catch (err) {
      console.error("Fetch doctors error:", err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // ---------------------- PAGINATION ---------------------
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDoctors = doctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(doctors.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // ---------------------- VALIDATION ---------------------
  const validateForm = () => {
    const errs = {};

    if (!formData.DoctorName.trim()) errs.DoctorName = "Doctor name is required";
    if (!formData.Specialty.trim()) errs.Specialty = "Specialty is required";
    if (!formData.Department.trim()) errs.Department = "Department is required";
    if (!formData.Phone.trim()) errs.Phone = "Phone is required";
    if (!formData.Email.trim()) errs.Email = "Email is required";

    if (formData.Phone && !/^\+?\d{7,15}$/.test(formData.Phone))
      errs.Phone = "Phone must be a valid number";

    if (formData.Email && !/^\S+@\S+\.\S+$/.test(formData.Email))
      errs.Email = "Email must be valid";

    const experience = parseInt(formData.YearsOfExperience);
    if (isNaN(experience) || experience < 0)
      errs.YearsOfExperience = "Years of experience must be a positive number";

    if (!formData.Availability || formData.Availability.length === 0)
      errs.Availability = "At least one availability slot is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ------------------------ CREATE -----------------------
  const createDoctor = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        ...formData,
        YearsOfExperience: parseInt(formData.YearsOfExperience) || 0
      };

      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create doctor");
      }

      await fetchDoctors();
      resetForm();
      alert("Doctor added successfully!");
    } catch (err) {
      console.error("Create error:", err);
      alert(err.message);
    }
  };

  // ----------------------- START EDIT --------------------
  const startEdit = (doctor) => {
    setEditingId(doctor._id);

    setFormData({
      DoctorName: doctor.DoctorName || "",
      Specialty: doctor.Specialty || "",
      Department: doctor.Department || "",
      Phone: doctor.Phone || "",
      Email: doctor.Email || "",
      YearsOfExperience: doctor.YearsOfExperience?.toString() || "0",
      Availability: doctor.Availability && doctor.Availability.length > 0 
        ? doctor.Availability 
        : [{ day: "Monday", startTime: "09:00", endTime: "17:00" }]
    });

    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ------------------------ UPDATE ------------------------
  const updateDoctor = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        ...formData,
        YearsOfExperience: parseInt(formData.YearsOfExperience) || 0
      };

      const res = await fetch(`${API}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update doctor");
      }

      await fetchDoctors();
      resetForm();
      alert("Doctor updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      alert(err.message);
    }
  };

  // ------------------------ DELETE ------------------------
  const deleteDoctor = async (id) => {
    if (!confirm("Delete this doctor?")) return;

    try {
      const res = await fetch(`${API}/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete doctor");
      }

      await fetchDoctors();
      if (editingId === id) resetForm();
      
      // Adjust pagination if needed
      if (currentDoctors.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
      alert("Doctor deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.message);
    }
  };

  // -------------------- AVAILABILITY HANDLERS ------------
  const addAvailability = () => {
    setFormData({
      ...formData,
      Availability: [
        ...formData.Availability,
        { day: "Monday", startTime: "09:00", endTime: "17:00" }
      ]
    });
  };

  const removeAvailability = (index) => {
    const newAvailability = formData.Availability.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      Availability: newAvailability
    });
  };

  const updateAvailability = (index, field, value) => {
    const newAvailability = [...formData.Availability];
    newAvailability[index] = {
      ...newAvailability[index],
      [field]: value
    };
    setFormData({
      ...formData,
      Availability: newAvailability
    });
  };

  // ------------------------ RESET -------------------------
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      DoctorName: "",
      Specialty: "",
      Department: "",
      Phone: "",
      Email: "",
      YearsOfExperience: "",
      Availability: [{ day: "Monday", startTime: "09:00", endTime: "17:00" }]
    });
    setErrors({});
  };

  // ------------------------ UI ----------------------------
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-100 p-4 md:p-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">Doctors Dashboard</h1>

        {/* FORM */}
        <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            {editingId ? "Update Doctor" : "Add New Doctor"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Doctor Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor Name *
              </label>
              <input
                type="text"
                placeholder="Enter doctor name"
                value={formData.DoctorName}
                onChange={(e) => setFormData({ ...formData, DoctorName: e.target.value })}
                className={`border px-3 py-2 rounded w-full text-sm focus:outline-none focus:ring-2 ${
                  errors.DoctorName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {errors.DoctorName && (
                <p className="text-red-500 text-xs mt-1">{errors.DoctorName}</p>
              )}
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialty *
              </label>
              <input
                type="text"
                placeholder="e.g., Cardiology"
                value={formData.Specialty}
                onChange={(e) => setFormData({ ...formData, Specialty: e.target.value })}
                className={`border px-3 py-2 rounded w-full text-sm focus:outline-none focus:ring-2 ${
                  errors.Specialty ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {errors.Specialty && (
                <p className="text-red-500 text-xs mt-1">{errors.Specialty}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <input
                type="text"
                placeholder="e.g., Emergency"
                value={formData.Department}
                onChange={(e) => setFormData({ ...formData, Department: e.target.value })}
                className={`border px-3 py-2 rounded w-full text-sm focus:outline-none focus:ring-2 ${
                  errors.Department ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {errors.Department && (
                <p className="text-red-500 text-xs mt-1">{errors.Department}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                placeholder="+1234567890"
                value={formData.Phone}
                onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
                className={`border px-3 py-2 rounded w-full text-sm focus:outline-none focus:ring-2 ${
                  errors.Phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {errors.Phone && (
                <p className="text-red-500 text-xs mt-1">{errors.Phone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                placeholder="doctor@example.com"
                value={formData.Email}
                onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                className={`border px-3 py-2 rounded w-full text-sm focus:outline-none focus:ring-2 ${
                  errors.Email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {errors.Email && (
                <p className="text-red-500 text-xs mt-1">{errors.Email}</p>
              )}
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience *
              </label>
              <input
                type="number"
                min="0"
                placeholder="5"
                value={formData.YearsOfExperience}
                onChange={(e) => setFormData({ ...formData, YearsOfExperience: e.target.value })}
                className={`border px-3 py-2 rounded w-full text-sm focus:outline-none focus:ring-2 ${
                  errors.YearsOfExperience ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {errors.YearsOfExperience && (
                <p className="text-red-500 text-xs mt-1">{errors.YearsOfExperience}</p>
              )}
            </div>

            {/* Availability Section */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Availability *
                </label>
                <button
                  type="button"
                  onClick={addAvailability}
                  className="text-xs md:text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  + Add Slot
                </button>
              </div>
              
              {errors.Availability && (
                <p className="text-red-500 text-xs mb-2">{errors.Availability}</p>
              )}

              {formData.Availability.map((slot, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3 p-3 border rounded bg-gray-50">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Day</label>
                    <select
                      value={slot.day}
                      onChange={(e) => updateAvailability(index, "day", e.target.value)}
                      className="border px-2 py-2 rounded w-full text-sm"
                    >
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start</label>
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateAvailability(index, "startTime", e.target.value)}
                      className="border px-2 py-2 rounded w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End</label>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateAvailability(index, "endTime", e.target.value)}
                      className="border px-2 py-2 rounded w-full text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    {formData.Availability.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAvailability(index)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-2"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Buttons */}
            <button
              onClick={editingId ? updateDoctor : createDoctor}
              type="button"
              className={`md:col-span-2 text-white font-semibold py-2 rounded transition text-sm md:text-base ${
                editingId ? "bg-yellow-600 hover:bg-yellow-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {editingId ? "Update Doctor" : "Add Doctor"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="md:col-span-2 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded transition text-sm md:text-base"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  {["Name", "Specialty", "Department", "Experience", "Phone", "Email", "Availability", "Actions"].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500 text-sm">
                      No doctors found.
                    </td>
                  </tr>
                ) : (
                  currentDoctors.map((d) => (
                    <tr key={d._id} className="hover:bg-gray-50">
                      <td className="px-3 md:px-4 py-3">
                        <div className="text-xs md:text-sm font-medium text-gray-900">{d.DoctorName || "-"}</div>
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <div className="text-xs md:text-sm text-gray-900">{d.Specialty || "-"}</div>
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <div className="text-xs md:text-sm text-gray-900">{d.Department || "-"}</div>
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <div className="text-xs md:text-sm text-gray-900">{d.YearsOfExperience || 0} yrs</div>
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <div className="text-xs md:text-sm text-gray-900">{d.Phone || "-"}</div>
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <div className="text-xs md:text-sm text-gray-900">{d.Email || "-"}</div>
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <div className="text-xs md:text-sm text-gray-900">
                          {d.Availability && d.Availability.length > 0 ? (
                            d.Availability.slice(0, 1).map((av, idx) => (
                              <div key={idx}>
                                {av.day}: {av.startTime}-{av.endTime}
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400">No schedule</span>
                          )}
                          {d.Availability && d.Availability.length > 1 && (
                            <div className="text-blue-500 text-xs">
                              +{d.Availability.length - 1} more
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <div className="flex flex-col md:flex-row gap-1 md:gap-2">
                          <button
                            onClick={() => startEdit(d)}
                            className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteDoctor(d._id)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {doctors.length > itemsPerPage && (
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between items-center">
                <div className="text-xs md:text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, doctors.length)}
                  </span>{" "}
                  of <span className="font-medium">{doctors.length}</span> doctors
                </div>
                
                <div className="flex gap-1 md:gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => paginate(index + 1)}
                      className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded ${
                        currentPage === index + 1
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}