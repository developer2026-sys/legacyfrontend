import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../baseurl";
import { useToast } from "../components/useToast";
import { useNavigate, Link } from "react-router-dom";

function ShieldLogo({ size = 64 }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="https://res.cloudinary.com/dbjwbveqn/image/upload/v1789646047/cleanerlogo_fvdkle.jpg"
        alt="Lasting Legacy Cleaners"
        style={{ height: size, width: "auto", display: "block" }}
      />
    </div>
  );
}

const inputStyles = {
  backgroundColor: "#F9FAFB",
  border: "1px solid #D1D5DB",
  color: "#1A1A2E",
  outline: "none",
};

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium mb-2"
        style={{ color: "#374151" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export default function AdminResetPasswordPage() {
  const { success: toastSuccess, error: toastError } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });


  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const focusStyle = (e) => {
    e.target.style.borderColor = "#1669A9";
    e.target.style.boxShadow = "0 0 0 3px rgba(22, 105, 169, 0.12)";
  };
  const blurStyle = (e) => {
    e.target.style.borderColor = "#D1D5DB";
    e.target.style.boxShadow = "none";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.newPassword || !form.confirmPassword) {
      setError("All fields are required.");
      return;
    }


    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
   

    try {
      setSubmitting(true);
      await axios.post(`${BASE_URL}/admin/reset-password`, {
        email: form.email,
        newPassword: form.newPassword,
      });

      toastSuccess("Password updated", "Your admin password has been changed.");
      setDone(true);
    } catch (axiosErr) {
      const msg = axiosErr?.response?.data?.message || "Update failed. Please try again.";
      setError(msg);
      toastError("Update Failed", msg);
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

        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-widest uppercase border"
            style={{
              backgroundColor: "rgba(22,105,169,0.08)",
              borderColor: "rgba(22,105,169,0.2)",
              color: "#1669A9",
            }}
          >
            <span>⬡</span> Change Password
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
          {done ? (
            /* ── Success state ── */
            <div className="text-center py-4 space-y-4">
              <div
                className="mx-auto w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                style={{
                  backgroundColor: "rgba(22,105,169,0.08)",
                  border: "1px solid rgba(22,105,169,0.2)",
                  color: "#1669A9",
                }}
              >
                ✓
              </div>
              <h2 className="text-xl font-semibold" style={{ color: "#1A1A2E" }}>
                Password Updated
              </h2>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                Your admin password has been changed successfully.
              </p>
              <button
                onClick={() => navigate("/admin")}
                className="mt-4 w-full h-12 rounded-lg text-sm font-semibold text-white tracking-wider uppercase transition"
                style={{ backgroundColor: "#1669A9" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1E90CF")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1669A9")}
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <h1
                className="text-xl sm:text-2xl font-semibold text-center"
                style={{ color: "#1A1A2E" }}
              >
                Change Admin Password
              </h1>
              <p className="mt-2 text-center text-sm" style={{ color: "#6B7280" }}>
                Enter your email, current password and a new password
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
                <Field label="Admin Email" htmlFor="reset-email">
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="admin@example.com"
                    className="w-full h-12 px-4 rounded-lg text-sm transition"
                    style={inputStyles}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </Field>

              
                <Field label="New Password" htmlFor="reset-new-password">
                  <input
                    id="reset-new-password"
                    type="password"
                    autoComplete="new-password"
                    value={form.newPassword}
                    onChange={set("newPassword")}
                    placeholder="Min. 8 characters"
                    className="w-full h-12 px-4 rounded-lg text-sm transition"
                    style={inputStyles}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </Field>

                <Field label="Confirm New Password" htmlFor="reset-confirm-password">
                  <input
                    id="reset-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={set("confirmPassword")}
                    placeholder="Re-enter new password"
                    className="w-full h-12 px-4 rounded-lg text-sm transition"
                    style={inputStyles}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </Field>

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

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-lg text-sm font-semibold text-white tracking-wider uppercase transition disabled:opacity-60"
                  style={{ backgroundColor: "#1669A9" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1E90CF")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1669A9")}
                >
                  {submitting ? "Updating Password…" : "Update Password"}
                </button>

                <p className="text-center">
                  <Link
                    to="/admin"
                    className="text-sm font-medium transition"
                    style={{ color: "#1669A9" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#1E90CF")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#1669A9")}
                  >
                    ← Back to Sign In
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: "#9CA3AF" }}>
          © {new Date().getFullYear()} Lasting Legacy Cleaners &nbsp;·&nbsp; Admin Portal
        </p>
      </div>
    </main>
  );
}