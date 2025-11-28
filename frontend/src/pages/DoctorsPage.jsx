import { useEffect, useState } from "react";

const API = "http://localhost:3000/doctors";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    DoctorName: "",
    Specialty: "",
    Department: "",
    Phone: "",
    Email: ""
  });

  const [errors, setErrors] = useState({});

  // ------------------------ FETCH ------------------------
  const fetchDoctors = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setDoctors(data || []);
    } catch (err) {
      console.error("Fetch doctors error:", err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // ---------------------- VALIDATION ---------------------
  const validateForm = () => {
    const errs = {};

    if (!formData.DoctorName.trim()) errs.DoctorName = "Doctor name is required";
    if (!formData.Specialty.trim()) errs.Specialty = "Specialty is required";
    if (!formData.Department.trim()) errs.Department = "Department is required";

    if (formData.Phone && !/^\+?\d{7,15}$/.test(formData.Phone))
      errs.Phone = "Phone must be a valid number";

    if (formData.Email && !/^\S+@\S+\.\S+$/.test(formData.Email))
      errs.Email = "Email must be valid";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ------------------------ CREATE -----------------------
  const createDoctor = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = { ...formData };
    if (!payload.Phone) delete payload.Phone;
    if (!payload.Email) delete payload.Email;

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to create doctor");

      await fetchDoctors();
      resetForm();
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
      Email: doctor.Email || ""
    });

    setErrors({});
  };

  // ------------------------ UPDATE ------------------------
  const updateDoctor = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = { ...formData };
    if (!payload.Phone) delete payload.Phone;
    if (!payload.Email) delete payload.Email;

    try {
      const res = await fetch(`${API}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to update doctor");

      await fetchDoctors();
      resetForm();
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

      if (!res.ok) throw new Error("Failed to delete doctor");

      await fetchDoctors();
      if (editingId === id) resetForm();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.message);
    }
  };

  // ------------------------ RESET -------------------------
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      DoctorName: "",
      Specialty: "",
      Department: "",
      Phone: "",
      Email: ""
    });
    setErrors({});
  };

  // ------------------------ UI ----------------------------
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Doctors Dashboard</h1>

      {/* FORM */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-10">
        <h2 className="text-2xl font-semibold mb-4">
          {editingId ? "Update Doctor" : "Add New Doctor"}
        </h2>

        <form
          onSubmit={editingId ? updateDoctor : createDoctor}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {["DoctorName", "Specialty", "Department", "Phone", "Email"].map((field) => (
            <div key={field}>
              <input
                type={field === "Email" ? "email" : "text"}
                placeholder={field}
                value={formData[field]}
                onChange={(e) =>
                  setFormData({ ...formData, [field]: e.target.value })
                }
                className={`border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 ${
                  errors[field] ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                }`}
                required={["DoctorName", "Specialty", "Department"].includes(field)}
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
            {editingId ? "Update Doctor" : "Add Doctor"}
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
              {["Name", "Specialty", "Department", "Phone", "Email", "Actions"].map(
                (col) => (
                  <th
                    key={col}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase"
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {doctors.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No doctors found.
                </td>
              </tr>
            ) : (
              doctors.map((d) => (
                <tr key={d._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{d.DoctorName}</td>
                  <td className="px-6 py-4">{d.Specialty}</td>
                  <td className="px-6 py-4">{d.Department}</td>
                  <td className="px-6 py-4">{d.Phone}</td>
                  <td className="px-6 py-4">{d.Email}</td>

                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => startEdit(d)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteDoctor(d._id)}
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
