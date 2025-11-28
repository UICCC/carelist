import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:3000/hospitals";

function HospitalsPage() {
  const [hospitals, setHospitals] = useState([]);
  const [formData, setFormData] = useState({
    Name: "",
    Address: "",
    ContactNumber: ""
  });
  const [editingID, setEditingID] = useState(null); // HospitalID for edit

  // Fetch hospitals
  const fetchHospitals = async () => {
    try {
      const res = await axios.get(API);
      setHospitals(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add hospital
  const addHospital = async () => {
    if (!formData.Name.trim() || !formData.Address.trim()) return;

    try {
      await axios.post(API, formData);
      setFormData({ Name: "", Address: "", ContactNumber: "" });
      fetchHospitals();
    } catch (err) {
      console.error("Add error:", err);
    }
  };

  // Start editing
  const startEdit = (hospital) => {
    setEditingID(hospital.HospitalID); // <-- Use HospitalID
    setFormData({
      Name: hospital.Name,
      Address: hospital.Address,
      ContactNumber: hospital.ContactNumber || ""
    });
  };

  // Update hospital
  const updateHospital = async () => {
    if (!editingID) return;

    try {
      await axios.put(`${API}/${editingID}`, formData);
      setFormData({ Name: "", Address: "", ContactNumber: "" });
      setEditingID(null);
      fetchHospitals();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  // Delete hospital
  const deleteHospital = async (HospitalID) => {
    if (!window.confirm("Delete this hospital?")) return;

    try {
      await axios.delete(`${API}/${HospitalID}`);
      if (editingID === HospitalID) setEditingID(null);
      fetchHospitals();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Hospitals</h1>

      {/* Form */}
      <div className="bg-white p-4 shadow-md rounded mb-6">
        <h2 className="text-xl font-semibold mb-3">
          {editingID ? "Update Hospital" : "Add Hospital"}
        </h2>

        <input
          type="text"
          name="Name"
          placeholder="Hospital Name"
          value={formData.Name}
          onChange={handleChange}
          className="border p-2 mr-2 mb-2"
        />

        <input
          type="text"
          name="Address"
          placeholder="Address"
          value={formData.Address}
          onChange={handleChange}
          className="border p-2 mr-2 mb-2"
        />

        <input
          type="text"
          name="ContactNumber"
          placeholder="Contact Number (optional)"
          value={formData.ContactNumber}
          onChange={handleChange}
          className="border p-2 mr-2 mb-2"
        />

        <div className="mt-2">
          {editingID ? (
            <>
              <button
                onClick={updateHospital}
                className="bg-green-600 text-white px-4 py-2 rounded mr-2"
              >
                Update
              </button>
              <button
                onClick={() => { setEditingID(null); setFormData({ Name: "", Address: "", ContactNumber: "" }); }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={addHospital}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <table className="w-full bg-white shadow-md">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Address</th>
            <th className="p-2 text-left">Contact Number</th>
            <th className="p-2 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {hospitals.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center p-4 text-gray-500">
                No hospitals found.
              </td>
            </tr>
          ) : (
            hospitals.map((h) => (
              <tr key={h.HospitalID} className="border-b hover:bg-gray-50">
                <td className="p-2">{h.Name}</td>
                <td className="p-2">{h.Address}</td>
                <td className="p-2">{h.ContactNumber || "-"}</td>
                <td className="p-2 flex gap-2 justify-center">
                  <button
                    onClick={() => startEdit(h)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteHospital(h.HospitalID)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
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
  );
}

export default HospitalsPage;
