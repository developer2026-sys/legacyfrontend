import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../baseurl";
import { useToast } from "../components/toast";

/**
 * Lasting Legacy Cleaners — Partner Registration Page
 * Matches LoginPage theme:
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

const inputStyles = {
  backgroundColor: "#F9FAFB",
  border: "1px solid #D1D5DB",
  color: "#1A1A2E",
  outline: "none",
};

function Field({ id, label, type = "text", autoComplete, value, onChange, placeholder }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2" style={{ color: "#374151" }}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
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
  );
}

function PasswordField({ id, label, autoComplete, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2" style={{ color: "#374151" }}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={onChange}
          placeholder={placeholder}
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
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 px-3 text-sm font-medium transition"
          style={{ color: "#1669A9" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#1E90CF")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#1669A9")}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

export default function RegistrationPage({ onSuccess }) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [form, setForm] = useState({
    fullName: "",
    organization: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef(null);

  useEffect(() => {
    const renderCaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.render && captchaRef.current && captchaRef.current.childElementCount === 0) {
        window.grecaptcha.render(captchaRef.current, {
          sitekey: "6LcicX0tAAAAACH3GmVbziwFeQ9Mo2ZAyIbV3XtN", // <-- replace with your actual site key
          callback: (token) => setCaptchaToken(token),
          "expired-callback": () => setCaptchaToken(""),
        });
      }
    };

    if (window.grecaptcha && window.grecaptcha.render) {
      renderCaptcha();
    } else {
      const interval = setInterval(() => {
        if (window.grecaptcha && window.grecaptcha.render) {
          renderCaptcha();
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    if (!form.fullName || !form.organization || !form.email || !form.phone || !form.password || !form.confirmPassword)
      return "Please fill in all required fields.";
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      return "Please enter a valid email address.";
    if (form.password.length < 8)
      return "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword)
      return "Passwords do not match.";
    if (!form.agree)
      return "Please agree to the Terms and Privacy Policy.";
    if (!captchaToken)
      return "Please complete the reCAPTCHA verification.";
    return "";
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const err = validate();
    if (err) { setError(err); return; }
    try {
      setSubmitting(true);
      const payload = {
        username: form.email,
        password: form.password,
        fullName: form.fullName,
        organization: form.organization,
        phone: form.phone,
        captchaToken,
      };
      const { data } = await axios.post(`${BASE_URL}/register`, payload);
      const successMsg = data.message || "Your access request has been submitted. Our team will review and contact you shortly.";
      setSuccess(successMsg);
      toastSuccess("Account Created", successMsg);
      setForm({ fullName: "", organization: "", email: "", phone: "", password: "", confirmPassword: "", agree: false });
      setCaptchaToken("");
      if (window.grecaptcha && captchaRef.current) {
        window.grecaptcha.reset(captchaRef.current);
      }
      if (typeof onSuccess === "function") onSuccess(data);
    } catch (axiosErr) {
      const msg = axiosErr?.response?.data?.message || "We couldn't complete your registration. Please try again.";
      setError(msg);
      toastError("Registration Failed", msg);
      setCaptchaToken("");
      if (window.grecaptcha && captchaRef.current) {
        window.grecaptcha.reset(captchaRef.current);
      }
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
            Request Partner Access
          </h1>
          <p className="mt-2 text-center text-sm" style={{ color: "#6B7280" }}>
            Create an account to manage memorial restoration requests
           
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
            <Field
              id="fullName"
              label="Full Name"
              autoComplete="name"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Jane Doe"
            />
            <Field
              id="organization"
              label="Organization"
              autoComplete="organization"
              value={form.organization}
              onChange={handleChange}
              placeholder="Anderson Memorial Park"
            />
            <Field
              id="email"
              label="Email Address"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
            <Field
              id="phone"
              label="Phone Number"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="(000) 000-0000"
            />
            <PasswordField
              id="password"
              label="Password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
            />
            <PasswordField
              id="confirmPassword"
              label="Confirm Password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
            />

            {/* Agree */}
            <div className="flex items-start gap-3 pt-1">
              <input
                id="agree"
                name="agree"
                type="checkbox"
                checked={form.agree}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded"
                style={{ accentColor: "#1669A9" }}
              />
              <label htmlFor="agree" className="text-sm select-none" style={{ color: "#6B7280" }}>
                I agree to the{" "}
                <a href="/app/terms" style={{ color: "#1669A9" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#1E90CF")} onMouseLeave={(e) => (e.currentTarget.style.color = "#1669A9")}>
                  Terms
                </a>{" "}
                and{" "}
                <a href="/app/terms" style={{ color: "#1669A9" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#1E90CF")} onMouseLeave={(e) => (e.currentTarget.style.color = "#1669A9")}>
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            {/* Submit */}
           {/* reCAPTCHA */}
           <div className="pt-1 flex justify-center">
              <div ref={captchaRef} />
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
              {submitting ? "Submitting request…" : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1" style={{ backgroundColor: "#E5EAF0" }} />
            <span className="text-xs uppercase tracking-wide" style={{ color: "#9CA3AF" }}>or</span>
            <div className="h-px flex-1" style={{ backgroundColor: "#E5EAF0" }} />
          </div>

          {/* Sign in link */}
          <p className="text-center text-sm" style={{ color: "#6B7280" }}>
            Already have an account?{" "}
            <a
              href="/app"
              className="font-medium transition"
              style={{ color: "#1669A9" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1E90CF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#1669A9")}
            >
              Sign in
            </a>
          </p>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs" style={{ color: "#9CA3AF" }}>
          Questions? Call us at{" "}
          <a
            href="tel:+13179703904"
            className="transition"
            style={{ color: "#6B7280" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#1669A9")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
          >
            317.970.3904
          </a>
        </p>

        <p className="mt-3 text-center text-xs" style={{ color: "#9CA3AF" }}>
          © {new Date().getFullYear()} Lasting Legacy Cleaners
        </p>
      </div>
    </main>
  );
}