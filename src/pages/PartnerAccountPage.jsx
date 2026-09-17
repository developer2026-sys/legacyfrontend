import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../baseurl";
import { useToast } from "../components/toast";

/**
 * Partner Account Page — Restyled to Collections Connector theme
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
 *  - Fonts:      Poppins (headings), Roboto (body)
 */

function Logo({ size = 64 }) {
  return (
    <div className="flex items-center gap-3">
    <img src="https://res.cloudinary.com/dbjwbveqn/image/upload/v1789646047/cleanerlogo_fvdkle.jpg" alt="Lasting Legacy Cleaners" style={{ height: size, width: "auto", display: "block" }} />
    </div>
  );
}

function InputField({ label, name, type = "text", value, onChange, placeholder, disabled, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium" style={{ color: "#374151", fontFamily: "'Roboto', system-ui, sans-serif" }}>{label}</label>
      {hint && <p className="text-xs" style={{ color: "#9CA3AF" }}>{hint}</p>}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-11 px-3 rounded-lg text-sm border focus:outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: disabled ? "rgba(249,250,251,0.5)" : "#F9FAFB",
          borderColor: "#D1D5DB",
          color: "#333333",
          fontFamily: "'Roboto', system-ui, sans-serif",
        }}
        onFocus={(e) => { if (!disabled) { e.target.style.borderColor = "#1669A9"; e.target.style.boxShadow = "0 0 0 3px rgba(22,105,169,0.12)"; }}}
        onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

function SectionCard({ title, description, children, accent }) {
  return (
    <section
      className="rounded-2xl border overflow-hidden"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "#E5EAF0",
        borderLeft: accent ? "4px solid #1669A9" : undefined,
        boxShadow: "0 4px 24px rgba(22,105,169,0.08), 0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <div className="px-6 py-5 border-b" style={{ borderColor: "#E5EAF0" }}>
        <h2 className="text-lg font-semibold" style={{ color: "#1A1A2E", fontFamily: "'Poppins', system-ui, sans-serif" }}>{title}</h2>
        {description && (
          <p className="text-sm mt-0.5" style={{ color: "#6B7280", fontFamily: "'Roboto', system-ui, sans-serif" }}>
            {description}
          </p>
        )}
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

export default function AccountPage({ token, onLogout }) {
  console.log(token);
  const { success: toastSuccess, error: toastError } = useToast();

  const [profile, setProfile] = useState({ username: "", email: "", role: "" });
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [profileForm, setProfileForm] = useState({ username: "", email: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // Fetch current account info
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const { data } = await axios.get(`${BASE_URL}/getAccount`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const p = data.partner || data;
        setProfile({ username: p.username || "", email: p.email || "", role: p.role || "partner" });
        setProfileForm({ username: p.username || "", email: p.email || "" });
      } catch (err) {
        toastError("Failed to load", "Could not fetch account details.");
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.username.trim()) return toastError("Validation", "Username is required.");
    try {
      setSavingProfile(true);
      await axios.put(
        `${BASE_URL}/update-account`,
        { username: profileForm.username, email: profileForm.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile((prev) => ({ ...prev, username: profileForm.username, email: profileForm.email }));
      toastSuccess("Profile updated", "Your account information has been saved.");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update profile.";
      toastError("Update failed", msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword) return toastError("Validation", "Current password is required.");
    if (pwForm.newPassword.length < 8) return toastError("Validation", "New password must be at least 8 characters.");
    if (pwForm.newPassword !== pwForm.confirmPassword) return toastError("Validation", "New passwords do not match.");
    try {
      setSavingPw(true);
      await axios.put(
        `${BASE_URL}/password`,
        { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toastSuccess("Password changed", "Your password has been updated successfully.");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to change password.";
      toastError(msg, "Please try again.");
    } finally {
      setSavingPw(false);
    }
  };

  const handleLogout = () => {
    if (typeof onLogout === "function") onLogout();
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#F5F7FA", fontFamily: "'Roboto', system-ui, sans-serif" }}
    >
      {/* Top nav */}
      <header
        className="border-b backdrop-blur sticky top-0 z-30"
        style={{ borderColor: "rgba(22,105,169,0.15)", backgroundColor: "rgba(255,255,255,0.9)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Logo size={40} />
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="hidden sm:block text-sm" style={{ color: "#333333" }}>
              <span className="font-medium" style={{ color: "#1669A9" }}>{profile.username || "Account"}</span>
            </span>
            <button
              onClick={() => { window.location.href = "/app/dashboard"; }}
              className="text-xs sm:text-sm transition"
              style={{ color: "#6B7280" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1669A9")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
            >
              ← Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="text-xs sm:text-sm transition"
              style={{ color: "#6B7280" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1669A9")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* Decorative gradient bar */}
        <div style={{ height: "4px", borderRadius: "2px", background: "linear-gradient(90deg, #1669A9, #1E90CF, #1669A9)", marginBottom: "8px" }} />

        {/* Page header */}
        <div className="mb-2">
          <h1 className="text-2xl sm:text-3xl font-semibold" style={{ color: "#1A1A2E", fontFamily: "'Poppins', system-ui, sans-serif" }}>My Account</h1>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            Manage your profile information and security settings.
          </p>
        </div>

        {/* Account overview pill */}
        {!loadingProfile && (
          <div
            className="flex items-center gap-4 rounded-2xl border px-5 py-4"
            style={{ backgroundColor: "#FFFFFF", borderColor: "rgba(22,105,169,0.2)", boxShadow: "0 2px 12px rgba(22,105,169,0.06)" }}
          >
            {/* Avatar initials */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
              style={{ backgroundColor: "rgba(22,105,169,0.1)", color: "#1669A9", border: "1px solid rgba(22,105,169,0.3)" }}
            >
              {(profile.username?.[0] || "?").toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate" style={{ color: "#1A1A2E" }}>{profile.username}</p>
              <p className="text-sm truncate" style={{ color: "#6B7280" }}>{profile.email || "No email set"}</p>
            </div>
            <div className="ml-auto flex-shrink-0">
              <span
                className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize"
                style={{
                  backgroundColor: "rgba(22,105,169,0.08)",
                  color: "#1669A9",
                  borderColor: "rgba(22,105,169,0.3)",
                }}
              >
                {profile.role}
              </span>
            </div>
          </div>
        )}

        {/* Profile Info */}
        <SectionCard
          title="Profile Information"
          description="Update your display name and email address."
          accent
        >
          {loadingProfile ? (
            <div className="text-sm text-center py-6" style={{ color: "#9CA3AF" }}>Loading…</div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <InputField
                label="Username"
                name="username"
                value={profileForm.username}
                onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
                placeholder="your_username"
              />
              <InputField
                label="Email Address"
                name="email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                hint="Used for notifications and account recovery."
              />

              {/* Read-only role */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium" style={{ color: "#374151", fontFamily: "'Roboto', system-ui, sans-serif" }}>Role</label>
                <p className="text-xs" style={{ color: "#9CA3AF" }}>
                  Your role is managed by an administrator.
                </p>
                <div
                  className="h-11 px-3 rounded-lg border flex items-center capitalize text-sm"
                  style={{ backgroundColor: "rgba(249,250,251,0.5)", borderColor: "#D1D5DB", color: "#9CA3AF" }}
                >
                  {profile.role}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="h-11 px-6 rounded-lg font-semibold transition disabled:opacity-60 text-sm"
                  style={{ backgroundColor: "#1669A9", color: "#ffffff", fontFamily: "'Poppins', system-ui, sans-serif" }}
                  onMouseEnter={(e) => !savingProfile && (e.currentTarget.style.backgroundColor = "#1E90CF")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1669A9")}
                >
                  {savingProfile ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </SectionCard>

        {/* Change Password */}
        <SectionCard
          title="Change Password"
          description="Choose a strong password with at least 8 characters."
        >
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: "#374151", fontFamily: "'Roboto', system-ui, sans-serif" }}>Current Password</label>
              <input
                type={showPasswords ? "text" : "password"}
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                placeholder="••••••••"
                className="w-full h-11 px-3 rounded-lg text-sm border focus:outline-none transition"
                style={{ backgroundColor: "#F9FAFB", borderColor: "#D1D5DB", color: "#333333" }}
                onFocus={(e) => { e.target.style.borderColor = "#1669A9"; e.target.style.boxShadow = "0 0 0 3px rgba(22,105,169,0.12)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: "#374151", fontFamily: "'Roboto', system-ui, sans-serif" }}>New Password</label>
              <input
                type={showPasswords ? "text" : "password"}
                value={pwForm.newPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="••••••••"
                className="w-full h-11 px-3 rounded-lg text-sm border focus:outline-none transition"
                style={{ backgroundColor: "#F9FAFB", borderColor: "#D1D5DB", color: "#333333" }}
                onFocus={(e) => { e.target.style.borderColor = "#1669A9"; e.target.style.boxShadow = "0 0 0 3px rgba(22,105,169,0.12)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: "#374151", fontFamily: "'Roboto', system-ui, sans-serif" }}>Confirm New Password</label>
              <input
                type={showPasswords ? "text" : "password"}
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="••••••••"
                className="w-full h-11 px-3 rounded-lg text-sm border focus:outline-none transition"
                style={{ backgroundColor: "#F9FAFB", borderColor: "#D1D5DB", color: "#333333" }}
                onFocus={(e) => { e.target.style.borderColor = "#1669A9"; e.target.style.boxShadow = "0 0 0 3px rgba(22,105,169,0.12)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#D1D5DB"; e.target.style.boxShadow = "none"; }}
              />
              {pwForm.newPassword && pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
                <p className="text-xs mt-1" style={{ color: "#DC2626" }}>Passwords do not match.</p>
              )}
            </div>

            {/* Show/hide toggle */}
            <button
              type="button"
              onClick={() => setShowPasswords((v) => !v)}
              className="flex items-center gap-2 text-xs transition"
              style={{ color: "#6B7280" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1669A9")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
            >
              <span style={{ fontSize: "14px" }}>{showPasswords ? "🙈" : "👁"}</span>
              {showPasswords ? "Hide passwords" : "Show passwords"}
            </button>

            {/* Strength indicator */}
            {pwForm.newPassword.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => {
                    const strength = Math.min(
                      4,
                      [pwForm.newPassword.length >= 8, /[A-Z]/.test(pwForm.newPassword), /[0-9]/.test(pwForm.newPassword), /[^A-Za-z0-9]/.test(pwForm.newPassword)].filter(Boolean).length
                    );
                    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
                    return (
                      <div
                        key={level}
                        className="h-1 flex-1 rounded-full transition-all"
                        style={{
                          backgroundColor: level <= strength ? colors[strength - 1] : "#D1D5DB",
                        }}
                      />
                    );
                  })}
                </div>
                <p className="text-xs" style={{ color: "#6B7280" }}>
                  {(() => {
                    const strength = [pwForm.newPassword.length >= 8, /[A-Z]/.test(pwForm.newPassword), /[0-9]/.test(pwForm.newPassword), /[^A-Za-z0-9]/.test(pwForm.newPassword)].filter(Boolean).length;
                    return ["", "Weak", "Fair", "Good", "Strong"][strength];
                  })()}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={savingPw}
                className="h-11 px-6 rounded-lg font-semibold transition disabled:opacity-60 text-sm border"
                style={{ backgroundColor: "transparent", color: "#1669A9", borderColor: "rgba(22,105,169,0.4)", fontFamily: "'Poppins', system-ui, sans-serif" }}
                onMouseEnter={(e) => !savingPw && (e.currentTarget.style.backgroundColor = "rgba(22,105,169,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {savingPw ? "Changing…" : "Change Password"}
              </button>
            </div>
          </form>
        </SectionCard>

        {/* Danger zone */}
        <SectionCard title="Session" description="Manage your active session.">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium" style={{ color: "#1A1A2E" }}>Sign out of your account</p>
              <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                You will be returned to the login screen.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="h-11 px-6 rounded-lg border text-sm font-medium transition flex-shrink-0"
              style={{ borderColor: "#D1D5DB", color: "#374151", backgroundColor: "transparent" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#ef4444";
                e.currentTarget.style.color = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#D1D5DB";
                e.currentTarget.style.color = "#374151";
              }}
            >
              Sign Out
            </button>
          </div>
        </SectionCard>

        <p className="text-center text-xs pb-4" style={{ color: "#9CA3AF" }}>
          Partner Portal
        </p>
      </main>
    </div>
  );
}