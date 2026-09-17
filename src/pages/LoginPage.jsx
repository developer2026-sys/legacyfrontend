import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../baseurl";
import { useToast } from "../components/toast";
import { useNavigate } from "react-router-dom";

/**
 * Lasting Legacy Cleaners — Partner Login Page
 * Restyled to match Collections Connector theme
 *
 * Brand (Collections Connector aligned):
 *  - Background: #F5F7FA
 *  - Card:       #FFFFFF
 *  - Primary:    #1669A9
 *  - Dark:       #1A1A2E
 *  - Text:       #333333 / #6B7280
 *  - Accent:     #1E90CF
 */

function Logo({ size = 64 }) {
  return (
    <div className="flex items-center gap-3">
<img src="https://res.cloudinary.com/dbjwbveqn/image/upload/v1789646047/cleanerlogo_fvdkle.jpg" alt="Lasting Legacy Cleaners" style={{ height: size, width: "auto", display: "block" }} />
</div>
  );
}

export default function LoginPage({ onLogin }) {
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
      const { data } = await axios.post(`${BASE_URL}/login`, { email, password });
      toastSuccess("Welcome back!", data.message || "Login successful.");
      if (typeof onLogin === "function") onLogin(data);
      navigate("/dashboard");
    } catch (axiosErr) {
      const msg =
        axiosErr?.response?.data?.message || "Login failed. Please try again.";
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
            Partner Sign In
          </h1>
          <p className="mt-2 text-center text-sm" style={{ color: "#6B7280" }}>
            Restoration partner portal
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: "#374151" }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full h-12 px-4 rounded-lg text-sm transition"
                style={{
                  backgroundColor: "#F9FAFB",
                  border: "1px solid #D1D5DB",
                  color: "#1A1A2E",
                  outline: "none",
                }}
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
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ color: "#374151" }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 px-4 rounded-lg text-sm transition"
                style={{
                  backgroundColor: "#F9FAFB",
                  border: "1px solid #D1D5DB",
                  color: "#1A1A2E",
                  outline: "none",
                }}
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
                className="rounded-lg px-4 py-3 text-sm"
                style={{
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#DC2626",
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-lg text-sm font-semibold text-white transition disabled:opacity-60"
              style={{ backgroundColor: "#1669A9" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#1E90CF")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#1669A9")
              }
            >
              {submitting ? "Signing in…" : "Login"}
            </button>

            {/* Links */}
            <div className="text-center flex flex-col gap-2 pt-1">
              <a
                href="/app/reset"
                className="text-sm font-medium transition"
                style={{ color: "#1669A9" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#1E90CF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#1669A9")}
              >
                Forgot Password?
              </a>
              <a
                href="/app/register"
                className="text-sm transition"
                style={{ color: "#6B7280" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#1669A9")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
              >
                Don't have an account?
              </a>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: "#9CA3AF" }}>
          © {new Date().getFullYear()} Lasting Legacy Cleaners
        </p>
      </div>
    </main>
  );
}