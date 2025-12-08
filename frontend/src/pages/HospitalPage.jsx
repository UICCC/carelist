import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API = `${API_BASE}/hospitals`;

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState([]);
  const [editingId, setEditingId] = useState(null); // HospitalID for editing

  const [formData, setFormData] = useState({
    Name: "",
    Address: "",
    ContactNumber: ""
  });

  const [errors, setErrors] = useState({});

  // ------------------------ FETCH ------------------------
  const fetchHospitals = async () => {
    try {
      const res = await axios.get(API);
      setHospitals(res.data || []);
    } catch (err) {
      console.error("Fetch hospitals error:", err);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  // ---------------------- VALIDATION ---------------------
  const validateForm = () => {
    const errs = {};
    if (!formData.Name.trim()) errs.Name = "Hospital name is required";
    if (!formData.Address.trim()) errs.Address = "Address is required";
    if (formData.ContactNumber && !/^\+?\d{7,15}$/.test(formData.ContactNumber))
      errs.ContactNumber = "Contact number must be valid";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ------------------------ CREATE -----------------------
  const createHospital = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.post(API, formData);
      resetForm();
      fetchHospitals();
    } catch (err) {
      console.error("Create error:", err);
      alert("Failed to create hospital");
    }
  };

  // ----------------------- START EDIT --------------------
  const startEdit = (hospital) => {
    setEditingId(hospital.HospitalID); // Use HospitalID
    setFormData({
      Name: hospital.Name || "",
      Address: hospital.Address || "",
      ContactNumber: hospital.ContactNumber || ""
    });
    setErrors({});
  };

  // ------------------------ UPDATE ------------------------
  const updateHospital = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.put(`${API}/${editingId}`, formData);
      resetForm();
      fetchHospitals();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update hospital");
    }
  };

  // ------------------------ DELETE ------------------------
  const deleteHospital = async (HospitalID) => {
    if (!window.confirm("Delete this hospital?")) return;

    try {
      await axios.delete(`${API}/${HospitalID}`);
      if (editingId === HospitalID) resetForm();
      fetchHospitals();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete hospital");
    }
  };

  // ------------------------ RESET -------------------------
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      Name: "",
      Address: "",
      ContactNumber: ""
    });
    setErrors({});
  };

  // ------------------------ UI ----------------------------
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Hospitals Dashboard</h1>

      {/* FORM */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-10">
        <h2 className="text-2xl font-semibold mb-4">
          {editingId ? "Update Hospital" : "Add New Hospital"}
        </h2>

        <form
          onSubmit={editingId ? updateHospital : createHospital}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {["Name", "Address", "ContactNumber"].map((field) => (
            <div key={field}>
              <input
                type={field === "ContactNumber" ? "tel" : "text"}
                placeholder={field}
                name={field}
                value={formData[field]}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                className={`border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 ${
                  errors[field]
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                required={["Name", "Address"].includes(field)}
              />
              {errors[field] && (
                <p className="text-red-500 text-xs">{errors[field]}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            className={`md:col-span-2 text-white font-semibold py-2 rounded transition ${
              editingId ? "bg-yellow-600" : "bg-blue-600"
            }`}
          >
            {editingId ? "Update Hospital" : "Add Hospital"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="md:col-span-2 bg-gray-500 text-white py-2 rounded"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-50">
            <tr>
              {["Name", "Address", "Contact Number", "Actions"].map((col) => (
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
            {hospitals.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  No hospitals found.
                </td>
              </tr>
            ) : (
              hospitals.map((h) => (
                <tr key={h.HospitalID} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{h.Name}</td>
                  <td className="px-6 py-4">{h.Address}</td>
                  <td className="px-6 py-4">{h.ContactNumber}</td>

                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => startEdit(h)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteHospital(h.HospitalID)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
