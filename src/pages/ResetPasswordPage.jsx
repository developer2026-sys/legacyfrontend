import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../baseurl";
import { useToast } from "../components/toast";

/**
 * Lasting Legacy Cleaners — Reset Password Page
 * Matches LoginPage theme:
 *  - Background: #F5F7FA
 *  - Card:       #FFFFFF
 *  - Primary:    #1669A9
 *  - Dark:       #1A1A2E
 *  - Text:       #374151 / #6B7280
 *  - Accent:     #1E90CF
 */

function Logo({ size = 64 }) {
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

export default function ResetPasswordPage() {
  const { success: toastSuccess, error: toastError } = useToast();

  const [form, setForm] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.email || !form.newPassword || !form.confirmPassword) {
      return "Please fill in all required fields.";
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      return "Please enter a valid email address.";
    }
    if (form.newPassword.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (form.newPassword !== form.confirmPassword) {
      return "Passwords do not match.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await axios.post(`${BASE_URL}/reset-password`, {
        email: form.email,
        newPassword: form.newPassword,
      });
      const msg =
        data.message ||
        "Your password has been updated successfully. You can now sign in with your new password.";
      setSuccess(msg);
      toastSuccess("Password Updated", msg);
      setForm({ email: "", newPassword: "", confirmPassword: "" });
    } catch (axiosErr) {
      const msg =
        axiosErr?.response?.data?.message ||
        "We couldn't reset your password. Please try again.";
      setError(msg);
      toastError("Reset Failed", msg);
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
        <div className="flex justify-center mb-8">
          <Logo size={64} />
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
            Reset Password
          </h1>
          <p className="mt-2 text-center text-sm" style={{ color: "#6B7280" }}>
            Enter your email and choose a new password for your{" "}
            <span style={{ color: "#1669A9", fontWeight: 500 }}>Partner</span> account.
          </p>

          {/* Divider */}
          <div className="mt-6 mb-6 border-t" style={{ borderColor: "#E5EAF0" }} />

          {/* Alerts */}
          {error && (
            <div
              className="mb-5 rounded-lg px-4 py-3 text-sm"
              style={{
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
                color: "#DC2626",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="mb-5 rounded-lg px-4 py-3 text-sm"
              style={{
                backgroundColor: "#EFF6FF",
                border: "1px solid rgba(22, 105, 169, 0.3)",
                color: "#1669A9",
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: "#374151" }}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
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

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-2" style={{ color: "#374151" }}>
                New password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  className="w-full h-12 px-4 pr-20 rounded-lg text-sm transition"
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
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 px-3 text-sm font-medium transition"
                  style={{ color: "#1669A9" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#1E90CF")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#1669A9")}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: "#374151" }}>
                Confirm new password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your new password"
                  className="w-full h-12 px-4 pr-20 rounded-lg text-sm transition"
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
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 px-3 text-sm font-medium transition"
                  style={{ color: "#1669A9" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#1E90CF")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#1669A9")}
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-lg text-sm font-semibold text-white transition disabled:opacity-60"
              style={{ backgroundColor: "#1669A9" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1E90CF")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1669A9")}
            >
              {submitting ? "Updating password…" : "Update password"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1" style={{ backgroundColor: "#E5EAF0" }} />
            <span className="text-xs uppercase tracking-wide" style={{ color: "#9CA3AF" }}>or</span>
            <div className="h-px flex-1" style={{ backgroundColor: "#E5EAF0" }} />
          </div>

          {/* Links */}
          <div className="text-center flex flex-col gap-3">
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Remembered your password?{" "}
              <a
                href="/app/"
                className="font-medium transition"
                style={{ color: "#1669A9" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#1E90CF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#1669A9")}
              >
                Sign in
              </a>
            </p>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Don't have an account?{" "}
              <a
                href="/app/register"
                className="font-medium transition"
                style={{ color: "#1669A9" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#1E90CF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#1669A9")}
              >
                Create one
              </a>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: "#9CA3AF" }}>
          Questions? Call us at{" "}
          <a
            href="tel:+10000000000"
            className="transition"
            style={{ color: "#6B7280" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#1669A9")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
          >
            (000) 000-0000
          </a>
        </p>

        <p className="mt-3 text-center text-xs" style={{ color: "#9CA3AF" }}>
          © {new Date().getFullYear()} Lasting Legacy Cleaners
        </p>
      </div>
    </main>
  );
}