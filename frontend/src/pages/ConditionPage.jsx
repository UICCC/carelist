import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API = `${API_BASE}/conditions`;

export default function ConditionsPage() {
  const [conditions, setConditions] = useState([]);
  const [editingId, setEditingId] = useState(null); // ConditionID for editing

  const [formData, setFormData] = useState({
    ConditionName: "",
    Description: "",
    Severity: ""
  });

  const [errors, setErrors] = useState({});

  // ------------------------ FETCH ------------------------
  const fetchConditions = async () => {
    try {
      const res = await axios.get(API);
      setConditions(res.data || []);
    } catch (err) {
      console.error("Fetch conditions error:", err);
    }
  };

  useEffect(() => {
    fetchConditions();
  }, []);

  // ---------------------- VALIDATION ---------------------
  const validateForm = () => {
    const errs = {};
    if (!formData.ConditionName.trim()) errs.ConditionName = "Condition name is required";
    if (!formData.Description.trim()) errs.Description = "Description is required";
    if (!formData.Severity.trim()) errs.Severity = "Severity is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ------------------------ CREATE -----------------------
  const createCondition = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.post(API, formData);
      resetForm();
      fetchConditions();
    } catch (err) {
      console.error("Create error:", err);
      alert("Failed to create condition");
    }
  };

  // ----------------------- START EDIT --------------------
  const startEdit = (condition) => {
    setEditingId(condition.ConditionID); // Use ConditionID
    setFormData({
      ConditionName: condition.ConditionName || "",
      Description: condition.Description || "",
      Severity: condition.Severity || ""
    });
    setErrors({});
  };

  // ------------------------ UPDATE ------------------------
  const updateCondition = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await axios.put(`${API}/${editingId}`, formData);
      resetForm();
      fetchConditions();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update condition");
    }
  };

  // ------------------------ DELETE ------------------------
  const deleteCondition = async (ConditionID) => {
    if (!window.confirm("Delete this condition?")) return;

    try {
      await axios.delete(`${API}/${ConditionID}`);
      if (editingId === ConditionID) resetForm();
      fetchConditions();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete condition");
    }
  };

  // ------------------------ RESET -------------------------
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      ConditionName: "",
      Description: "",
      Severity: ""
    });
    setErrors({});
  };

  // ------------------------ UI ----------------------------
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">Conditions Dashboard</h1>

      {/* FORM */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-10">
        <h2 className="text-2xl font-semibold mb-4">
          {editingId ? "Update Condition" : "Add New Condition"}
        </h2>

        <form
          onSubmit={editingId ? updateCondition : createCondition}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {["ConditionName", "Description", "Severity"].map((field) => (
            <div key={field}>
              <input
                type="text"
                placeholder={field}
                name={field}
                value={formData[field]}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                className={`border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 ${
                  errors[field]
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                required
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
            {editingId ? "Update Condition" : "Add Condition"}
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
              {["Condition Name", "Description", "Severity", "Actions"].map((col) => (
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
            {conditions.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  No conditions found.
                </td>
              </tr>
            ) : (
              conditions.map((c) => (
                <tr key={c.ConditionID} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{c.ConditionName}</td>
                  <td className="px-6 py-4">{c.Description}</td>
                  <td className="px-6 py-4">{c.Severity}</td>

                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => startEdit(c)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteCondition(c.ConditionID)}
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
