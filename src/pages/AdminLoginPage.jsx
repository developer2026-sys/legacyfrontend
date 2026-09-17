import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../baseurl";
import { useToast } from "../components/toast";
import { useNavigate, Link } from "react-router-dom";

const inputStyles = {
  backgroundColor: "#F9FAFB",
  border: "1px solid #D1D5DB",
  color: "#1A1A2E",
  outline: "none",
};
function ShieldLogo({ size = 64 }) {
  return (
    <div className="flex items-center gap-3">
    <img src="https://res.cloudinary.com/dbjwbveqn/image/upload/v1789646047/cleanerlogo_fvdkle.jpg" alt="Lasting Legacy Cleaners" style={{ height: size, width: "auto", display: "block" }} />
  </div>
  );
}
export default function AdminLoginPage({ onLogin }) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await axios.post(`${BASE_URL}/admin/login`, { email, password });

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));

      toastSuccess("Welcome, Admin", data.message || "Login successful.");

      if (typeof onLogin === "function") {
        onLogin({ token: data.token, partner: data.admin });
      }

      navigate("/admin/dashboard");
    } catch (axiosErr) {
      const msg = axiosErr?.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
      toastError("Login Failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{
        backgroundColor: "#F5F7FA",
        fontFamily: "'Poppins', 'Roboto', system-ui, sans-serif",
      }}
    >
      {/* Decorative top bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1"
        style={{ background: "linear-gradient(90deg, #1669A9, #1E90CF, #1669A9)" }}
      />

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <ShieldLogo size={64} />
        </div>

        {/* Admin badge */}
        <div className="flex justify-center mb-6">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-widest uppercase border"
            style={{
              backgroundColor: "rgba(22,105,169,0.08)",
              borderColor: "rgba(22,105,169,0.2)",
              color: "#1669A9",
            }}
          >
            <span>⬡</span> Secure Admin Access
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7 sm:p-9"
          style={{
            backgroundColor: "#FFFFFF",
            boxShadow: "0 4px 24px rgba(22, 105, 169, 0.08), 0 1px 3px rgba(0,0,0,0.06)",
            border: "1px solid #E5EAF0",
          }}
        >
          <h1
            className="text-xl sm:text-2xl font-semibold text-center"
            style={{ color: "#1A1A2E" }}
          >
            Administrator Sign In
          </h1>
          <p className="mt-2 text-center text-sm" style={{ color: "#6B7280" }}>
            Restricted access — authorized personnel only
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: "#E5EAF0" }} />
            <span className="text-xs uppercase tracking-wide" style={{ color: "#9CA3AF" }}>
              Credentials
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#E5EAF0" }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium mb-2"
                style={{ color: "#374151" }}
              >
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full h-12 px-4 rounded-lg text-sm transition"
                style={inputStyles}
                onFocus={(e) => {
                  e.target.style.borderColor = "#1669A9";
                  e.target.style.boxShadow = "0 0 0 3px rgba(22, 105, 169, 0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#D1D5DB";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium mb-2"
                style={{ color: "#374151" }}
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-12 px-4 rounded-lg text-sm transition"
                style={inputStyles}
                onFocus={(e) => {
                  e.target.style.borderColor = "#1669A9";
                  e.target.style.boxShadow = "0 0 0 3px rgba(22, 105, 169, 0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#D1D5DB";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                className="rounded-lg px-4 py-3 text-sm flex items-start gap-2"
                style={{
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#DC2626",
                }}
              >
                <span className="mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-lg text-sm font-semibold text-white tracking-wider uppercase transition disabled:opacity-60"
              style={{ backgroundColor: "#1669A9" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1E90CF")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1669A9")}
            >
              {submitting ? "Authenticating…" : "Access Dashboard"}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-6 text-center text-sm" style={{ color: "#6B7280" }}>
            Don't have an account?{" "}
            <Link
              to="/admin/register"
              className="font-medium transition"
              style={{ color: "#1669A9" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1E90CF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#1669A9")}
            >
              Create one
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: "#9CA3AF" }}>
          © {new Date().getFullYear()} Lasting Legacy Cleaners &nbsp;·&nbsp; Admin Portal
        </p>
      </div>
    </main>
  );
}