import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BASE_URL } from "../baseurl";
import { useToast } from "../components/useToast";

// ─── Shared Design Tokens (mirrored from AdminDashboard) ──────────────────────
const primary       = "#1669A9";
const primaryHover  = "#1E90CF";
const bg            = "#F5F7FA";
const surface       = "#FFFFFF";
const border        = "#E5EAF0";
const borderPrimary = "rgba(22,105,169,0.25)";
const textPrimary   = "#1A1A2E";
const textSecondary = "#374151";
const textMuted     = "#9CA3AF";

// ─── Reusable UI Primitives ───────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 60, display: "flex",
      alignItems: "center", justifyContent: "center", padding: 16,
      backgroundColor: "rgba(26,26,46,0.5)", backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div style={{
        backgroundColor: surface, border: `1px solid ${border}`, borderRadius: 16,
        width: "100%", maxWidth: 480, display: "flex", flexDirection: "column",
        boxShadow: "0 20px 60px rgba(22,105,169,0.12), 0 4px 16px rgba(0,0,0,0.08)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: "24px 28px 16px", borderBottom: `1px solid ${border}` }}>
          <div style={{ color: textPrimary, fontSize: 18, fontWeight: 700 }}>{title}</div>
          {subtitle && <div style={{ color: textMuted, fontSize: 12.5, marginTop: 3 }}>{subtitle}</div>}
        </div>
        <div style={{ padding: "20px 28px 28px" }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", color: textSecondary, fontSize: 12, fontWeight: 500, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", height: 42, padding: "0 12px", borderRadius: 8,
  backgroundColor: "#F9FAFB", border: `1px solid #D1D5DB`, color: textPrimary,
  fontSize: 13.5, outline: "none", boxSizing: "border-box",
};

function ActionBtn({ onClick, color = primary, hoverColor = primaryHover, textColor = "#fff", children, disabled, style = {} }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        backgroundColor: hov ? hoverColor : color, color: textColor,
        border: "none", borderRadius: 8, padding: "8px 18px",
        fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1, transition: "all .2s", ...style,
      }}
    >{children}</button>
  );
}

function GhostBtn({ onClick, children, danger, style = {} }) {
  const [hov, setHov] = useState(false);
  const c = danger ? (hov ? "#b91c1c" : "#DC2626") : (hov ? primary : textMuted);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        backgroundColor: "transparent", color: c,
        border: `1px solid ${hov ? (danger ? "#DC2626" : borderPrimary) : border}`,
        borderRadius: 8, padding: "8px 16px", fontSize: 12.5, fontWeight: 500,
        cursor: "pointer", transition: "all .2s", ...style,
      }}
    >{children}</button>
  );
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────
function InviteModal({ token, onClose, onInvited }) {
  const { success: ok, error: err } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleInvite = async () => {
    if (!form.email || !form.password)
      return err("Validation", "Email and password are required.");

    try {
      setSaving(true);
      await axios.post(
        `${BASE_URL}/admin/team-members/invite`,
        { email: form.email, password: form.password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      ok("family advisor invited", `${form.email} has been added to your team.`);
      onInvited();
      onClose();
    } catch (e) {
      err("Invite failed", e?.response?.data?.message || "Could not add family advisor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Add family advisor" subtitle="They will be able to log in using these credentials." onClose={onClose}>
      <Field label="Email Address">
        <input
          style={inputStyle} type="email"
          placeholder="teammate@example.com"
          value={form.email} onChange={set("email")}
        />
      </Field>
      <Field label="Password">
        <div style={{ position: "relative" }}>
          <input
            style={{ ...inputStyle, paddingRight: 44 }}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={form.password} onChange={set("password")}
          />
          <button
            onClick={() => setShowPassword(p => !p)}
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: textMuted, fontSize: 12, padding: 0,
            }}
          >{showPassword ? "Hide" : "Show"}</button>
        </div>
      </Field>

      <div style={{
        backgroundColor: "rgba(22,105,169,0.05)", border: `1px solid ${borderPrimary}`,
        borderRadius: 8, padding: "10px 14px", marginBottom: 20,
      }}>
        <div style={{ color: primary, fontSize: 12, fontWeight: 600, marginBottom: 2 }}>Add limit</div>
        <div style={{ color: textSecondary, fontSize: 12 }}>
          You can add a maximum of <strong>3 family advisors</strong>. Each family advisor shares your admin access level.
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <GhostBtn onClick={onClose}>Cancel</GhostBtn>
        <ActionBtn onClick={handleInvite} disabled={saving}>
          {saving ? "Adding…" : "Add member"}
        </ActionBtn>
      </div>
    </Modal>
  );
}

// ─── Avatar Initials ──────────────────────────────────────────────────────────
function Avatar({ email }) {
  const initials = email ? email[0].toUpperCase() : "?";
  return (
    <div style={{
      width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
      backgroundColor: "rgba(22,105,169,0.1)", border: `1px solid ${borderPrimary}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: primary, fontSize: 13, fontWeight: 700,
    }}>{initials}</div>
  );
}

// ─── Slot Card ────────────────────────────────────────────────────────────────
function SlotCard({ member, index, onInvite, isEmpty }) {
  if (isEmpty) {
    return (
      <div style={{
        backgroundColor: surface, border: `1px dashed ${borderPrimary}`,
        borderRadius: 12, padding: "20px 22px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        opacity: 0.7,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
            backgroundColor: "rgba(22,105,169,0.05)", border: `1px dashed ${borderPrimary}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: borderPrimary, fontSize: 18,
          }}>+</div>
          <div>
            <div style={{ color: textMuted, fontSize: 13.5, fontWeight: 500 }}>Slot {index + 1} — Available</div>
            <div style={{ color: textMuted, fontSize: 11.5, marginTop: 2 }}>No family advisor yet</div>
          </div>
        </div>
        <ActionBtn onClick={onInvite} style={{ fontSize: 12, padding: "6px 14px" }}>
          + Add
        </ActionBtn>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: surface, border: `1px solid ${border}`,
      borderRadius: 12, padding: "20px 22px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Avatar email={member?.admin?.email} />
        <div>
          <div style={{ color: textPrimary, fontSize: 13.5, fontWeight: 600 }}>{member?.admin?.email}</div>
          <div style={{ color: textMuted, fontSize: 11.5, marginTop: 2 }}>
            Added {new Date(member.createdAt || member.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            {member?.invitedByAdmin?.email && (
              <span> · by <span style={{ color: primary }}>{member.invitedByAdmin.email}</span></span>
            )}
          </div>
        </div>
      </div>
      <span style={{
        fontSize: 11, letterSpacing: "0.06em", padding: "3px 10px", borderRadius: 999,
        backgroundColor: "rgba(22,105,169,0.08)", color: primary,
        border: `1px solid ${borderPrimary}`, fontWeight: 600,
      }}>family advisor</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TeamMembers({ token }) {
  const { error: err } = useToast();
  const [members, setMembers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  const MAX_SLOTS = 3;

  const fetchMembers = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/admin/team-members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(data.teamMembers || []);
    } catch (e) {
      err("Error", e?.response?.data?.message || "Failed to load family advisors.");
    } finally {
      setLoading(false);
    }
  }, [token, err]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchMembers(); }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchMembers]);

  const slotsUsed = members.length;
  const slotsLeft = MAX_SLOTS - slotsUsed;
  const canInvite = slotsLeft > 0;

  const slots = Array.from({ length: MAX_SLOTS }, (_, i) => ({
    member: members[i] || null,
    isEmpty: !members[i],
  }));

  return (
    <div style={{ minHeight: "100vh", backgroundColor: bg, fontFamily: "'Inter', system-ui, sans-serif", color: textPrimary }}>

      {/* Top accent bar */}
      <div style={{ height: 4, background: "linear-gradient(90deg, #1669A9, #1E90CF, #1669A9)" }} />

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "36px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: textPrimary, margin: 0 }}>family advisors</h1>
            <p style={{ color: textMuted, fontSize: 13, marginTop: 5, marginBottom: 0 }}>
              Manage who has access to the admin panel alongside you.
            </p>
          </div>
          <ActionBtn
            onClick={() => setShowInvite(true)}
            disabled={!canInvite || loading}
            style={{ flexShrink: 0 }}
          >
            + Add Member
          </ActionBtn>
        </div>

        {/* Usage bar */}
        <div style={{
          backgroundColor: surface, border: `1px solid ${border}`, borderRadius: 12,
          padding: "16px 20px", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 20,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: textSecondary, fontSize: 12.5, fontWeight: 500 }}>Add slots used</span>
              <span style={{ color: primary, fontSize: 12.5, fontWeight: 700 }}>{slotsUsed} / {MAX_SLOTS}</span>
            </div>
            <div style={{ height: 6, backgroundColor: "rgba(22,105,169,0.1)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99, transition: "width .4s ease",
                width: `${(slotsUsed / MAX_SLOTS) * 100}%`,
                backgroundColor: slotsUsed === MAX_SLOTS ? "#DC2626" : primary,
              }} />
            </div>
          </div>
          <div style={{
            textAlign: "right", flexShrink: 0,
            color: slotsLeft === 0 ? "#DC2626" : textMuted,
            fontSize: 12, fontWeight: slotsLeft === 0 ? 600 : 400,
          }}>
            {slotsLeft === 0 ? "No slots left" : `${slotsLeft} slot${slotsLeft !== 1 ? "s" : ""} remaining`}
          </div>
        </div>

        {/* Slot cards */}
        {loading ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: textMuted, fontSize: 13 }}>
            Loading family advisors…
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {slots.map(({ member, isEmpty }, i) => (
              <SlotCard
                key={i}
                index={i}
                member={member}
                isEmpty={isEmpty}
                onInvite={() => setShowInvite(true)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && members.length === 0 && (
          <div style={{
            marginTop: 24, textAlign: "center",
            padding: "32px 20px",
            backgroundColor: "rgba(22,105,169,0.03)",
            border: `1px dashed ${borderPrimary}`,
            borderRadius: 12,
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>👥</div>
            <div style={{ color: textPrimary, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No family advisors yet</div>
            <div style={{ color: textMuted, fontSize: 12.5, marginBottom: 16 }}>
              Add up to 3 admins to collaborate with you.
            </div>
            <ActionBtn onClick={() => setShowInvite(true)}>+ Add your first member</ActionBtn>
          </div>
        )}

      </main>

      {showInvite && (
        <InviteModal
          token={token}
          onClose={() => setShowInvite(false)}
          onInvited={fetchMembers}
        />
      )}
    </div>
  );
}