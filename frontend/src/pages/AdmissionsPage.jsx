import { useEffect, useState } from "react";

function AdmissionsPage() {
  const [admissions, setAdmissions] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/admission")
      .then(res => res.json())
      .then(data => setAdmissions(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Admissions</h2>

      {admissions.length === 0 ? (
        <p>No admissions yet</p>
      ) : (
        admissions.map(item => (
          <div key={item.id} className="card">
            <p>Patient: {item.patientId}</p>
            <p>Doctor: {item.doctorId}</p>
            <p>Status: {item.status}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default AdmissionsPage;
