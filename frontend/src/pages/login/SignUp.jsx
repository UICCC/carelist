import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function SignUp() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
  });

  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.role) {
      setErrors("Please select a role");
      return;
    }

    setErrors("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(data.message || "Signup failed");
      } else {
        alert("Signup successful! Please login.");
        window.location.href = "/"; // redirect everyone to login
      }
    } catch (err) {
      console.error(err);
      setErrors("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white justify-center items-center p-8">
      <div className="flex flex-row w-full max-w-7xl h-3/4 bg-white rounded-lg shadow-lg overflow-hidden">
        {/* IMAGE SECTION */}
        <div className="w-1/2 flex justify-center items-center bg-white p-0 border-r border-gray-200">
          <img
            src="https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="signup visual"
            className="w-full h-full object-cover"
          />
        </div>

        {/* FORM SECTION */}
        <div className="w-1/2 flex justify-center items-center p-6 bg-white">
          <div className="w-full bg-white p-4">
            <h2 className="text-xl font-bold mb-1 text-black">Create your account</h2>
            <p className="text-gray-700 mb-3 text-xs">
              Enter your details below to create your account
            </p>

            {errors && (
              <p className="bg-red-100 text-red-700 p-1.5 rounded mb-2 text-center text-xs">
                {errors}
              </p>
            )}

            <div className="space-y-2">
              <div>
                <label className="block text-gray-700 mb-0.5 text-xs">Full Name</label>
                <input
                  className="w-full border border-gray-300 px-2 py-1.5 rounded text-xs"
                  type="text"
                  name="fullName"
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-0.5 text-xs">Email</label>
                <input
                  className="w-full border border-gray-300 px-2 py-1.5 rounded text-xs"
                  type="email"
                  name="email"
                  placeholder="example@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-0.5 text-xs">Password</label>
                <input
                  className="w-full border border-gray-300 px-2 py-1.5 rounded text-xs"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-0.5 text-xs">Sign Up As</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 px-2 py-1.5 rounded text-xs"
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>

              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full bg-blue-600 text-white font-semibold py-1.5 rounded hover:bg-blue-700 transition text-xs mt-3"
                disabled={loading}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </div>

            <p className="text-center text-gray-600 mt-3 text-xs">
              Already have an account?{" "}
              <a href="/" className="text-blue-600 hover:underline">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
