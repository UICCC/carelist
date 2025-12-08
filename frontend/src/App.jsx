import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1 = credentials, 2 = OTP
  const [loading, setLoading] = useState(false);

  // Step 1: handle login credentials
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Login failed");
      } else {
        setStep(2); // move to OTP step
        setError(""); // clear any previous errors
      }
    } catch (err) {
      setError("Server error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "OTP verification failed");
      } else {
        // Save token and user info to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        console.log("✅ Login successful! Role:", data.user.role);

        // Role-based redirect
        if (data.user.role === "admin") {
          window.location.href = "/patients";
        } else if (data.user.role === "doctor") {
          window.location.href = "/doctorDashboard";
        } else {
          // Fallback for other roles
          window.location.href = "/";
        }
      }
    } catch (err) {
      setError("Server error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP function
  const handleResendOTP = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        alert("New OTP has been sent to your email!");
      } else {
        setError(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      setError("Server error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white justify-center items-center p-8">
      <div className="flex flex-row w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* IMAGE SECTION */}
        <div className="w-1/2 flex justify-center items-center bg-white p-0 border-r border-gray-200">
          <img
            src="https://images.pexels.com/photos/2882566/pexels-photo-2882566.jpeg"
            alt="login visual"
            className="w-full h-full object-cover"
          />
        </div>

        {/* FORM SECTION */}
        <div className="w-1/2 flex justify-center items-center p-8 bg-white">
          <div className="w-full bg-white p-8">
            <h2 className="text-3xl font-bold mb-2 text-black">Welcome Back</h2>
            <p className="text-gray-700 mb-8">
              {step === 1
                ? "Enter your credentials to access your account"
                : "Enter the 6-digit OTP sent to your email"}
            </p>

            {error && (
              <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center text-sm">
                {error}
              </p>
            )}

            <div className="space-y-4">
              {step === 1 && (
                <>
                  <div>
                    <label className="block text-gray-700 mb-1">Email</label>
                    <input
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="email"
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Password</label>
                    <input
                      className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    onClick={handleLogin}
                    className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? "Sending OTP..." : "Login"}
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                    <p className="text-sm text-blue-800">
                      📧 OTP has been sent to <strong>{email}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-1">Enter OTP</label>
                    <input
                      className="w-full border border-gray-300 px-3 py-2 rounded text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500"
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      maxLength={6}
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    onClick={handleVerifyOTP}
                    className="w-full bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700 transition disabled:bg-green-300 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>

                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                      ← Back to Login
                    </button>
                    <button
                      onClick={handleResendOTP}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                      disabled={loading}
                    >
                      Resend OTP
                    </button>
                  </div>
                </>
              )}
            </div>

            {step === 1 && (
              <p className="text-center text-gray-600 mt-6">
                Don't have an account?{" "}
                <a href="/signup" className="text-blue-600 hover:underline">
                  Sign up
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}