import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../baseurl";
import { useToast } from "../components/toast";
import { useNavigate, Link } from "react-router-dom";

/**
 * Lasting Legacy Cleaners — Admin Register Page
 * Matches AdminLoginPage theme:
 *  - Background: #F5F7FA
 *  - Card:       #FFFFFF
 *  - Primary:    #1669A9
 *  - Dark:       #1A1A2E
 *  - Text:       #374151 / #6B7280
 *  - Accent:     #1E90CF
 */

function ShieldLogo({ size = 64 }) {
  return (
    <div className="flex items-center gap-3">
    <img src="https://res.cloudinary.com/dbjwbveqn/image/upload/v1789646047/cleanerlogo_fvdkle.jpg" alt="Lasting Legacy Cleaners" style={{ height: size, width: "auto", display: "block" }} />
  </div>
  );
}

const inputStyles = {
  backgroundColor: "#F9FAFB",
  border: "1px solid #D1D5DB",
  color: "#1A1A2E",
  outline: "none",
};

export default function AdminRegisterPage() {
  const { success: toastSuccess, error: toastError } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password || !form.confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${BASE_URL}/admin/register`, {
        email: form.email,
        password: form.password,
      });
      toastSuccess("Admin created", "Account created successfully. Please sign in.");
      navigate("/admin");
    } catch (axiosErr) {
      const msg = axiosErr?.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
      toastError("Registration Failed", msg);
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
            <span>⬡</span> Create Admin Account
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
            Register Administrator
          </h1>
          <p className="mt-2 text-center text-sm" style={{ color: "#6B7280" }}>
            New admin account registration
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: "#E5EAF0" }} />
            <span className="text-xs uppercase tracking-wide" style={{ color: "#9CA3AF" }}>
              Account Details
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#E5EAF0" }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="reg-email"
                className="block text-sm font-medium mb-2"
                style={{ color: "#374151" }}
              >
                Email address
              </label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={set("email")}
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
                htmlFor="reg-password"
                className="block text-sm font-medium mb-2"
                style={{ color: "#374151" }}
              >
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={set("password")}
                placeholder="Min. 8 characters"
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

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="reg-confirm-password"
                className="block text-sm font-medium mb-2"
                style={{ color: "#374151" }}
              >
                Confirm password
              </label>
              <input
                id="reg-confirm-password"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                placeholder="Re-enter password"
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
              {submitting ? "Creating Account…" : "Create Admin Account"}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-6 text-center text-sm" style={{ color: "#6B7280" }}>
            Already have an account?{" "}
            <Link
              to="/admin"
              className="font-medium transition"
              style={{ color: "#1669A9" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1E90CF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#1669A9")}
            >
              Sign in
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