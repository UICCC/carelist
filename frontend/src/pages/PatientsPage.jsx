import { useEffect, useState } from "react";

const API = "http://localhost:3000/patients";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    DateOfBirth: "",
    Gender: ""
  });

  const [errors, setErrors] = useState({});

  // --- READ: fetch all patients
  const fetchPatients = async () => {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      setPatients(data || []);
    } catch (err) {
      console.error("Fetch patients error:", err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // --- VALIDATION
  const validateForm = () => {
    const errs = {};

    if (!formData.FirstName) errs.FirstName = "First name is required";
    else if (!/^[A-Za-z]+$/.test(formData.FirstName))
      errs.FirstName = "First name must contain only letters";

    if (!formData.LastName) errs.LastName = "Last name is required";
    else if (!/^[A-Za-z]+$/.test(formData.LastName))
      errs.LastName = "Last name must contain only letters";

    if (!formData.DateOfBirth) errs.DateOfBirth = "Date of birth is required";

    if (!["Male", "Female", "Other"].includes(formData.Gender))
      errs.Gender = "Gender must be Male, Female, or Other";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // --- CREATE
  const createPatient = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error(`Create failed: ${res.status}`);
      await fetchPatients();
      resetForm();
    } catch (err) {
      console.error("Create error:", err);
      alert(err.message);
    }
  };

  // --- PREPARE EDIT
  const startEdit = (patient) => {
    setEditingId(patient.PatientID);
    let dob = patient.DateOfBirth ?? "";
    if (dob.includes("T")) dob = dob.split("T")[0];
    setFormData({
      FirstName: patient.FirstName || "",
      LastName: patient.LastName || "",
      DateOfBirth: dob,
      Gender: patient.Gender || ""
    });
    setErrors({});
  };

  // --- UPDATE
  const updatePatient = async (e) => {
    e.preventDefault();
    if (!editingId || !validateForm()) return;

    try {
      const res = await fetch(`${API}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error(`Update failed: ${res.status}`);
      await fetchPatients();
      resetForm();
    } catch (err) {
      console.error("Update error:", err);
      alert(err.message);
    }
  };

  // --- DELETE
  const deletePatient = async (id) => {
    if (!confirm("Delete this patient?")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      await fetchPatients();
      if (editingId === id) resetForm();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      FirstName: "",
      LastName: "",
      DateOfBirth: "",
      Gender: ""
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Patient Dashboard</h1>

      {/* FORM */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-10">
        <h2 className="text-2xl font-semibold mb-4">
          {editingId ? "Update Patient" : "Add New Patient"}
        </h2>

        <form
          onSubmit={editingId ? updatePatient : createPatient}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="flex flex-col">
            <input
              type="text"
              placeholder="First Name"
              value={formData.FirstName}
              onChange={(e) => setFormData({ ...formData, FirstName: e.target.value })}
              className={`border px-3 py-2 rounded focus:outline-none focus:ring-2 ${
                errors.FirstName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
              required
            />
            {errors.FirstName && <span className="text-red-500 text-sm">{errors.FirstName}</span>}
          </div>

          <div className="flex flex-col">
            <input
              type="text"
              placeholder="Last Name"
              value={formData.LastName}
              onChange={(e) => setFormData({ ...formData, LastName: e.target.value })}
              className={`border px-3 py-2 rounded focus:outline-none focus:ring-2 ${
                errors.LastName ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
              required
            />
            {errors.LastName && <span className="text-red-500 text-sm">{errors.LastName}</span>}
          </div>

          <div className="flex flex-col">
            <input
              type="date"
              value={formData.DateOfBirth}
              onChange={(e) => setFormData({ ...formData, DateOfBirth: e.target.value })}
              className={`border px-3 py-2 rounded focus:outline-none focus:ring-2 ${
                errors.DateOfBirth ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
              required
            />
            {errors.DateOfBirth && <span className="text-red-500 text-sm">{errors.DateOfBirth}</span>}
          </div>

          <div className="flex flex-col">
            <select
              value={formData.Gender}
              onChange={(e) => setFormData({ ...formData, Gender: e.target.value })}
              className={`border px-3 py-2 rounded focus:outline-none focus:ring-2 ${
                errors.Gender ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.Gender && <span className="text-red-500 text-sm">{errors.Gender}</span>}
          </div>

          <button
            type="submit"
            className={`md:col-span-2 text-white font-semibold py-2 rounded transition ${
              editingId ? "bg-yellow-600 hover:bg-yellow-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {editingId ? "Update Patient" : "Add Patient"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="md:col-span-2 bg-gray-500 text-white font-semibold py-2 rounded hover:bg-gray-600 transition"
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOB</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {patients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No patients found.</td>
              </tr>
            ) : (
              patients.map((p) => (
                <tr key={p.PatientID} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">{p.PatientID}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.FirstName} {p.LastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{(p.DateOfBirth || "").split("T")[0]}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.Gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    <button
                      onClick={() => startEdit(p)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePatient(p.PatientID)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
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
