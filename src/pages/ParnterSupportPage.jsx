import { useState } from "react";

/**
 * Contact Form — Restyled to Collections Connector theme
 *
 * Brand (Collections Connector aligned):
 *  - Background: #F5F7FA
 *  - Card:       #FFFFFF
 *  - Primary:    #1669A9
 *  - Hover:      #1E90CF
 *  - Dark:       #1A1A2E
 *  - Labels:     #374151
 *  - Body:       #333333
 *  - Secondary:  #6B7280
 *  - Muted:      #9CA3AF
 *  - Input bg:   #F9FAFB
 *  - Input bdr:  #D1D5DB
 *  - Card border:#E5EAF0
 *  - Card shadow: 0 4px 24px rgba(22,105,169,0.08), 0 1px 3px rgba(0,0,0,0.06)
 *  - Error:      #DC2626  bg:#FEF2F2  border:#FECACA
 *  - Fonts:      Poppins (headings), Roboto (body)
 */

const inputStyle = {
  width: "100%",
  height: "44px",
  padding: "0 12px",
  borderRadius: "8px",
  border: "1px solid #D1D5DB",
  backgroundColor: "#F9FAFB",
  color: "#333333",
  fontSize: "14px",
  fontFamily: "'Roboto', system-ui, sans-serif",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: 500,
  color: "#374151",
  marginBottom: "6px",
  letterSpacing: "0.02em",
  fontFamily: "'Roboto', system-ui, sans-serif",
};

function Field({ label, required, children, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <label style={labelStyle}>
        {label}
        {required && (
          <span style={{ color: "#1669A9", marginLeft: "3px" }}>*</span>
        )}
      </label>
      {children}
      {hint && (
        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#9CA3AF" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

function FocusInput({ as: Tag = "input", ...props }) {
  const [focused, setFocused] = useState(false);
  const baseStyle = Tag === "textarea"
    ? { ...inputStyle, height: "auto", padding: "10px 12px", resize: "none", lineHeight: "1.6" }
    : inputStyle;

  return (
    <Tag
      {...props}
      style={{
        ...baseStyle,
        borderColor: focused ? "#1669A9" : "#D1D5DB",
        boxShadow: focused ? "0 0 0 3px rgba(22,105,169,0.12)" : "none",
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function SelectField({ children, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select
        {...props}
        style={{
          ...inputStyle,
          appearance: "none",
          paddingRight: "36px",
          cursor: "pointer",
          borderColor: focused ? "#1669A9" : "#D1D5DB",
          boxShadow: focused ? "0 0 0 3px rgba(22,105,169,0.12)" : "none",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {children}
      </select>
      <svg
        style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        width="14" height="14" viewBox="0 0 14 14" fill="none"
      >
        <path d="M3 5l4 4 4-4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function StatusMessage({ type, message }) {
  const isSuccess = type === "success";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        padding: "14px 16px",
        borderRadius: "8px",
        border: `1px solid ${isSuccess ? "rgba(22,105,169,0.3)" : "#FECACA"}`,
        backgroundColor: isSuccess ? "rgba(22,105,169,0.06)" : "#FEF2F2",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: "1px" }}>
        {isSuccess ? (
          <>
            <circle cx="9" cy="9" r="8" stroke="#1669A9" strokeWidth="1.5" />
            <path d="M5.5 9l2.5 2.5L12.5 6" stroke="#1669A9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : (
          <>
            <circle cx="9" cy="9" r="8" stroke="#DC2626" strokeWidth="1.5" />
            <path d="M9 5.5v4M9 12.5v.5" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}
      </svg>
      <p style={{ margin: 0, fontSize: "14px", color: isSuccess ? "#1669A9" : "#DC2626", lineHeight: "1.5", fontFamily: "'Roboto', system-ui, sans-serif" }}>
        {message}
      </p>
    </div>
  );
}

function Logo({ size = 64 }) {
  return (
    <div className="flex items-center gap-3">
    <img src="https://res.cloudinary.com/dbjwbveqn/image/upload/v1789646047/cleanerlogo_fvdkle.jpg" alt="Lasting Legacy Cleaners" style={{ height: size, width: "auto", display: "block" }} />
    </div>
  );
}

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    preferredContact: "email",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = "First name is required.";
    if (!formData.lastName.trim()) e.lastName = "Last name is required.";
    if (!formData.email.trim()) {
      e.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = "Please enter a valid email address.";
    }
    if (!formData.subject) e.subject = "Please select a subject.";
    if (!formData.message.trim()) e.message = "Message is required.";
    else if (formData.message.trim().length < 20) e.message = "Message must be at least 20 characters.";
    return e;
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setStatus(null);
    await new Promise((r) => setTimeout(r, 1400));
    setSubmitting(false);
    setStatus({ type: "success", message: "Thank you for reaching out. A member of our team will be in touch within 1–2 business days." });
    setFormData({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "", preferredContact: "email" });
    setErrors({});
  };

  const fieldError = (field) =>
    errors[field] ? (
      <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#DC2626" }}>{errors[field]}</p>
    ) : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F5F7FA",
        fontFamily: "'Roboto', system-ui, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "560px" }}>

        {/* Decorative gradient bar */}
        <div style={{ height: "4px", borderRadius: "2px", background: "linear-gradient(90deg, #1669A9, #1E90CF, #1669A9)", marginBottom: "32px" }} />

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <Logo />
          <div style={{ marginTop: "24px" }}>
            <h1 style={{ margin: "0 0 8px", fontSize: "26px", fontWeight: 600, color: "#1A1A2E", letterSpacing: "-0.02em", fontFamily: "'Poppins', system-ui, sans-serif" }}>
              Get in Touch
            </h1>
            <p style={{ margin: 0, fontSize: "14px", color: "#6B7280", lineHeight: "1.6" }}>
              Our team is here to help with memorial restoration services, partner inquiries, and general support.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, rgba(22,105,169,0.3), rgba(22,105,169,0.1), transparent)", marginBottom: "32px" }} />

        {/* Card */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5EAF0",
            borderLeft: "4px solid #1669A9",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 4px 24px rgba(22,105,169,0.08), 0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          {status && (
            <div style={{ marginBottom: "24px" }}>
              <StatusMessage type={status.type} message={status.message} />
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Name row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <Field label="First Name" required>
                    <FocusInput
                      name="firstName"
                      placeholder="Jane"
                      value={formData.firstName}
                      onChange={handleChange("firstName")}
                      autoComplete="given-name"
                    />
                  </Field>
                  {fieldError("firstName")}
                </div>
                <div>
                  <Field label="Last Name" required>
                    <FocusInput
                      name="lastName"
                      placeholder="Smith"
                      value={formData.lastName}
                      onChange={handleChange("lastName")}
                      autoComplete="family-name"
                    />
                  </Field>
                  {fieldError("lastName")}
                </div>
              </div>

              {/* Email */}
              <div>
                <Field label="Email Address" required>
                  <FocusInput
                    type="email"
                    name="email"
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={handleChange("email")}
                    autoComplete="email"
                  />
                </Field>
                {fieldError("email")}
              </div>

              {/* Phone */}
              <div>
                <Field label="Phone Number" hint="Optional — include if you prefer a callback.">
                  <FocusInput
                    type="tel"
                    name="phone"
                    placeholder="(000) 000-0000"
                    value={formData.phone}
                    onChange={handleChange("phone")}
                    autoComplete="tel"
                  />
                </Field>
              </div>

              {/* Subject */}
              <div>
                <Field label="Subject" required>
                  <SelectField
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange("subject")}
                  >
                    <option value="" disabled>Select a topic…</option>
                    <option value="restoration">Memorial Restoration Services</option>
                    <option value="partner">Partner Program Inquiry</option>
                    <option value="pricing">Pricing & Packages</option>
                    <option value="existing">Existing Request Follow-Up</option>
                    <option value="general">General Question</option>
                  </SelectField>
                </Field>
                {fieldError("subject")}
              </div>

              {/* Preferred contact */}
              <div>
                <label style={labelStyle}>Preferred Contact Method</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["email", "phone"].map((opt) => {
                    const active = formData.preferredContact === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, preferredContact: opt }))}
                        style={{
                          flex: 1,
                          height: "38px",
                          borderRadius: "8px",
                          border: `1px solid ${active ? "#1669A9" : "#D1D5DB"}`,
                          backgroundColor: active ? "rgba(22,105,169,0.08)" : "#F9FAFB",
                          color: active ? "#1669A9" : "#6B7280",
                          fontSize: "13px",
                          fontFamily: "'Roboto', system-ui, sans-serif",
                          fontWeight: active ? 500 : 400,
                          cursor: "pointer",
                          transition: "all 0.15s",
                          textTransform: "capitalize",
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div>
                <Field label="Message" required>
                  <FocusInput
                    as="textarea"
                    name="message"
                    rows={5}
                    placeholder="Describe how we can help you…"
                    value={formData.message}
                    onChange={handleChange("message")}
                  />
                </Field>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                  {fieldError("message")}
                  <span style={{ marginLeft: "auto", fontSize: "12px", color: "#9CA3AF" }}>
                    {formData.message.length} chars
                  </span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  height: "46px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: submitting ? "#12578a" : "#1669A9",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: 600,
                  fontFamily: "'Poppins', system-ui, sans-serif",
                  cursor: submitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "background-color 0.2s",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = "#1E90CF"; }}
                onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = "#1669A9"; }}
              >
                {submitting ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                      <path d="M8 2a6 6 0 016 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Sending…
                  </>
                ) : (
                  <>
                    Send Message
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M2 7.5h10M9 4l4 3.5L9 11" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>

            </div>
          </form>
        </div>

        {/* Footer note */}
        <p style={{ marginTop: "20px", textAlign: "center", fontSize: "12px", color: "#9CA3AF", lineHeight: "1.6" }}>
          By submitting, you agree to our privacy policy. We typically respond within 1–2 business days.
        </p>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::placeholder { color: #9CA3AF !important; }
        select option { background-color: #ffffff; color: #333333; }
      `}</style>
    </div>
  );
}