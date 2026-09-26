import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../baseurl";
import { useToast } from "../components/useToast";

const inputStyles = {
  backgroundColor: "#F9FAFB",
  border: "1px solid #D1D5DB",
  color: "#1A1A2E",
  outline: "none",
};

function Logo({ size = 64 }) {
  return (
    <img
      src="https://res.cloudinary.com/dbjwbveqn/image/upload/v1789646047/cleanerlogo_fvdkle.jpg"
      alt="Lasting Legacy Cleaners"
      style={{ height: size, width: "auto", display: "block" }}
    />
  );
}

export default function FirstLoginPasswordPage({ token, partner, onComplete }) {
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.newPassword.length < 8) {
      setError("Your new password must be at least 8 characters.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await axios.post(
        `${BASE_URL}/reset-password`,
        {
          email: partner.email || partner.username,
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onComplete?.();
      toastSuccess("Password updated", data.message || "Your new password is ready.");
      navigate("/dashboard", { replace: true });
    } catch (axiosErr) {
      const message = axiosErr?.response?.data?.message
        || "We couldn't update your password. Please try again.";
      setError(message);
      toastError("Password update failed", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ backgroundColor: "#F5F7FA", fontFamily: "'Poppins', 'Roboto', system-ui, sans-serif" }}
    >
      <div
        className="fixed top-0 left-0 right-0 h-1"
        style={{ background: "linear-gradient(90deg, #1669A9, #1E90CF, #1669A9)" }}
      />
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8"><Logo /></div>
        <div
          className="rounded-2xl p-7 sm:p-9"
          style={{
            backgroundColor: "#FFFFFF",
            boxShadow: "0 4px 24px rgba(22, 105, 169, 0.08), 0 1px 3px rgba(0,0,0,0.06)",
            border: "1px solid #E5EAF0",
          }}
        >
          <h1 className="text-xl sm:text-2xl font-semibold text-center" style={{ color: "#1A1A2E" }}>
            Create your new password
          </h1>
          <p className="mt-2 text-center text-sm" style={{ color: "#6B7280" }}>
            This is required the first time you sign in with your temporary password.
          </p>

          {error && (
            <div
              className="mt-6 rounded-lg px-4 py-3 text-sm"
              style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-2" style={{ color: "#374151" }}>
                Temporary password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                value={form.currentPassword}
                onChange={update}
                className="w-full h-12 px-4 rounded-lg text-sm"
                style={inputStyles}
                required
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-2" style={{ color: "#374151" }}>
                New password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={form.newPassword}
                onChange={update}
                className="w-full h-12 px-4 rounded-lg text-sm"
                style={inputStyles}
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: "#374151" }}>
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={update}
                className="w-full h-12 px-4 rounded-lg text-sm"
                style={inputStyles}
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: "#1669A9" }}
            >
              {submitting ? "Updating password…" : "Set new password"}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-xs" style={{ color: "#9CA3AF" }}>
          © {new Date().getFullYear()} Lasting Legacy Cleaners
        </p>
      </div>
    </main>
  );
}