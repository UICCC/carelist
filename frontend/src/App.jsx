import { useState } from "react";

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
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Login failed");
      } else {
        setStep(2); // move to OTP step
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
      const res = await fetch("http://localhost:3000/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "OTP verification failed");
      } else {
        // Save token and user info
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Role-based redirect
        if (data.user.role === "admin") {
          window.location.href = "/patients";
        } else if (data.user.role === "doctor") {
          window.location.href = "/doctorDashboard";
        } else {
          window.location.href = "/"; // fallback
        }
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
              <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">
                {error}
              </p>
            )}

            <div className="space-y-4">
              {step === 1 && (
                <>
                  <div>
                    <label className="block text-gray-700 mb-1">Email</label>
                    <input
                      className="w-full border border-gray-300 px-3 py-2 rounded"
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
                      className="w-full border border-gray-300 px-3 py-2 rounded"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    onClick={handleLogin}
                    className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
                    disabled={loading}
                  >
                    {loading ? "Sending OTP..." : "Login"}
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <div>
                    <label className="block text-gray-700 mb-1">OTP</label>
                    <input
                      className="w-full border border-gray-300 px-3 py-2 rounded"
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    onClick={handleVerifyOTP}
                    className="w-full bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700 transition"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
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
