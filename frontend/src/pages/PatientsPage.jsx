import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = "http://localhost:3000/patients"; // <-- POINT DIRECTLY TO ROUTE

function PatientsPage() {
  const { id } = useParams();
  const [patients, setPatients] = useState([]);
  const [singlePatient, setSinglePatient] = useState(null);
  const [formData, setFormData] = useState({
    FirstName: "",
    LastName: "",
    DateOfBirth: "",
    Gender: "",
    Address: "",
    Phone: "",
    Email: "",
    InsuranceProviderID: ""
  });

  // -----------------------------
  // 1️⃣ GET ALL PATIENTS
  // -----------------------------
  function fetchAllPatients() {
    fetch(`${API}`)
      .then((res) => res.json())
      .then((data) => setPatients(data))
      .catch((err) => console.error(err));
  }

  // -----------------------------
  // 2️⃣ GET SINGLE PATIENT
  // -----------------------------
  function fetchOnePatient() {
    if (!id) return;
    fetch(`${API}/${id}`)
      .then((res) => res.json())
      .then((data) => setSinglePatient(data))
      .catch((err) => console.error(err));
  }

  // Auto-fetch data
  useEffect(() => {
    fetchAllPatients();
    fetchOnePatient();
  }, [id]);

  // -----------------------------
  // 3️⃣ CREATE NEW PATIENT
  // -----------------------------
  function createPatient(e) {
    e.preventDefault();

    fetch(`${API}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })
      .then((res) => res.json())
      .then(() => {
        setFormData({
          FirstName: "",
          LastName: "",
          DateOfBirth: "",
          Gender: "",
          Address: "",
          Phone: "",
          Email: "",
          InsuranceProviderID: ""
        });
        fetchAllPatients(); // refresh list
      })
      .catch((err) => console.error(err));
  }

  // -----------------------------
  // 4️⃣ DELETE PATIENT
  // -----------------------------
  function deletePatient(pid) {
    fetch(`${API}/${pid}`, { method: "DELETE" })
      .then(() => fetchAllPatients()) // refresh list
      .catch((err) => console.error(err));
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Patients</h1>

      {/* ----------------------------
           SHOW SINGLE PATIENT
      ---------------------------- */}
      {id && singlePatient && (
        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            border: "1px solid #aaa"
          }}
        >
          <h3>Patient Details (ID: {id})</h3>
          <p><b>First Name:</b> {singlePatient.FirstName}</p>
          <p><b>Last Name:</b> {singlePatient.LastName}</p>
          <p><b>Date of Birth:</b> {singlePatient.DateOfBirth}</p>
          <p><b>Gender:</b> {singlePatient.Gender}</p>
          <p><b>Address:</b> {singlePatient.Address}</p>
          <p><b>Phone:</b> {singlePatient.Phone}</p>
          <p><b>Email:</b> {singlePatient.Email}</p>
          <p><b>Insurance ID:</b> {singlePatient.InsuranceProviderID}</p>
        </div>
      )}

      {/* ----------------------------
           CREATE NEW PATIENT FORM
      ---------------------------- */}
      <form onSubmit={createPatient} style={{ marginBottom: "30px" }}>
        <h3>Create Patient</h3>

        <input
          type="text"
          placeholder="First Name"
          value={formData.FirstName}
          onChange={(e) => setFormData({ ...formData, FirstName: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={formData.LastName}
          onChange={(e) => setFormData({ ...formData, LastName: e.target.value })}
          required
        />
        <input
          type="date"
          placeholder="Date of Birth"
          value={formData.DateOfBirth}
          onChange={(e) => setFormData({ ...formData, DateOfBirth: e.target.value })}
          required
        />
        <select
          value={formData.Gender}
          onChange={(e) => setFormData({ ...formData, Gender: e.target.value })}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="text"
          placeholder="Address"
          value={formData.Address}
          onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
        />
        <input
          type="text"
          placeholder="Phone"
          value={formData.Phone}
          onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.Email}
          onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
        />
        <input
          type="number"
          placeholder="Insurance ID"
          value={formData.InsuranceProviderID}
          onChange={(e) => setFormData({ ...formData, InsuranceProviderID: e.target.value })}
        />

        <button type="submit">Add Patient</button>
      </form>

      {/* ----------------------------
           ALL PATIENTS LIST
      ---------------------------- */}
      <h3>All Patients</h3>

      {patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        patients.map((p) => (
          <div
            key={p.PatientID}
            style={{
              padding: "10px",
              margin: "10px 0",
              border: "1px solid #ddd",
              borderRadius: "6px"
            }}
          >
            <p><b>ID:</b> {p.PatientID}</p>
            <p><b>Name:</b> {p.FirstName} {p.LastName}</p>
            <p><b>Date of Birth:</b> {p.DateOfBirth}</p>
            <p><b>Gender:</b> {p.Gender}</p>
            <p><b>Address:</b> {p.Address}</p>
            <p><b>Phone:</b> {p.Phone}</p>
            <p><b>Email:</b> {p.Email}</p>
            <p><b>Insurance ID:</b> {p.InsuranceProviderID}</p>

            <button onClick={() => deletePatient(p.PatientID)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
}

export default PatientsPage;
