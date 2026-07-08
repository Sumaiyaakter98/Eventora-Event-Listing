import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // OTP স্টেটের জন্য আলাদা মেসেজ ট্র্যাকিং
  const [loading, setLoading] = useState(false);

  const { login, verifyOTP } = useContext(AuthContext);
  const navigate = useNavigate();

  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // শুধু সাধারণ এরর মেসেজগুলো মুছবো, OTP নোটিফিকেশনটা স্ক্রিনে রাখবো
    if (!showOTP) {
      setSuccessMessage("");
    }

    try {
      if (!showOTP) {
        // ১ম ধাপ: ইমেইল ও পাসওয়ার্ড দিয়ে সাধারণ লগইন চেষ্টা
        const data = await login(email, password);
        if (isMounted.current) {
          if (data?.role === "admin") navigate("/admin");
          else navigate("/dashboard");
        }
      } else {
        // ২য় ধাপ: OTP কোড সাবমিশন
        const data = await verifyOTP(email, otp);
        if (isMounted.current) {
          if (data?.role === "admin") navigate("/admin");
          else navigate("/dashboard");
        }
      }
    } catch (err) {
      if (isMounted.current) {
        // যদি ব্যাকএন্ড থেকে অ্যাকাউন্ট ভেরিফাইড না থাকার রেসপন্স আসে
        // নোট: আপনার ব্যাকএন্ড রেসপন্স স্ট্রাকচার অনুযায়ী err.response?.data?.needsVerification চেক করা লাগতে পারে
        const needsVerify =
          err?.needsVerification || err.response?.data?.needsVerification;
        const errMsg =
          err?.message ||
          err.response?.data?.message ||
          err ||
          "Authentication failed.";

        if (needsVerify) {
          setShowOTP(true);
          setSuccessMessage(
            "Account not verified. A new OTP has been sent to your email.",
          );
        } else {
          setError(errMsg);
        }
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
          Welcome Back
        </h2>
        <p className="text-gray-500">Sign in to your Eventora account</p>
      </div>

      {/* সাধারণ এরর মেসেজ */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-center text-sm shadow-inner border border-red-100">
          {error}
        </div>
      )}

      {/* OTP নোটিফিকেশন মেসেজ (যা সাবমিট করার সময় মুছে যাবে না) */}
      {successMessage && (
        <div className="bg-blue-50 text-blue-600 p-3 rounded-lg mb-6 text-center text-sm shadow-inner border border-blue-100">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {!showOTP ? (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 focus:border-transparent transition shadow-sm outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 focus:border-transparent transition shadow-sm outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Verification Code (OTP)
              </label>
              <button
                type="button"
                className="text-xs font-bold text-gray-500 hover:text-gray-900 underline transition"
                onClick={() => {
                  setShowOTP(false);
                  setOtp("");
                  setError("");
                  setSuccessMessage("");
                }}
              >
                Back to Sign In
              </button>
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              placeholder="6-digit code"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 focus:border-transparent transition shadow-sm font-bold tracking-widest text-center text-lg outline-none"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (showOTP && !otp)}
          className={`w-full text-white font-bold py-3 rounded-lg transition shadow-md duration-200 ${
            loading || (showOTP && !otp)
              ? "bg-gray-400 cursor-not-allowed shadow-none"
              : "bg-gray-900 hover:bg-black focus:ring-4 focus:ring-gray-200"
          }`}
        >
          {loading
            ? "Processing..."
            : showOTP
              ? "Verify OTP & Log In"
              : "Sign In"}
        </button>
      </form>

      <p className="text-center mt-8 text-gray-600">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-gray-900 font-bold hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;
