import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BASE_URL } from "../baseurl";
import { useToast } from "../components/useToast";

// ─── Shared Design Tokens (mirrored from AdminDashboard / TeamMembers) ────────
const primary       = "#1669A9";
const primaryHover  = "#1E90CF";
const bg            = "#F5F7FA";
const surface       = "#FFFFFF";
const border        = "#E5EAF0";
const borderPrimary = "rgba(22,105,169,0.25)";
const textPrimary   = "#1A1A2E";
const textSecondary = "#374151";
const textMuted     = "#9CA3AF";

// ─── Status Badge Styles ───────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:  { bg: "rgba(234,179,8,0.1)",  color: "#92400E", border: "rgba(234,179,8,0.4)",  label: "Pending Approval" },
  approved: { bg: "rgba(22,105,169,0.08)", color: primary,   border: "rgba(22,105,169,0.3)", label: "Approved" },
  denied:   { bg: "rgba(220,38,38,0.08)",  color: "#DC2626", border: "rgba(220,38,38,0.25)", label: "Denied" },
};

function StatusPill({ status, requestType }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  const requestLabel = status === "pending" && requestType === "deactivate"
    ? "Deactivation Pending Approval"
    : status === "pending" && requestType === "remove"
      ? "Removal Pending Approval"
      : null;
  return (
    <span style={{
      fontSize: 11, letterSpacing: "0.06em", padding: "3px 10px", borderRadius: 999,
      backgroundColor: s.bg, color: s.color,
      border: `1px solid ${s.border}`, fontWeight: 600, whiteSpace: "nowrap",
    }}>{requestLabel || s.label}</span>
  );
}

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
  const [form, setForm] = useState({ email: "", password: "", role: "family_advisor" });
  const [showPassword, setShowPassword] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleInvite = async () => {
    if (!form.email || !form.password)
      return err("Validation", "Email and password are required.");

    try {
      setSaving(true);
      await axios.post(
        `${BASE_URL}/partner/team-members/invite`,
         { email: form.email, password: form.password, role: form.role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      ok("Family advisor invited", `${form.email} has been added. Share the temporary password with them; they will be required to replace it after their first login.`);
      onInvited();
      onClose();
    } catch (e) {
      err("Invite failed", e?.response?.data?.message || "Could not add family advisor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Add family advisor" subtitle="They'll be able to log in once an admin approves the account." onClose={onClose}>
      <Field label="Email Address">
        <input
          style={inputStyle} type="email"
          placeholder="teammate@example.com"
          value={form.email} onChange={set("email")}
        />
      </Field>
      <Field label="Account Role">
        <select style={inputStyle} value={form.role} onChange={set("role")}>
          <option value="family_advisor">Family Advisor</option>
          <option value="client_admin">Client Admin</option>
        </select>
      </Field>
      <Field label="Temporary Password">
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
          You can add a maximum of <strong>3 family advisors</strong>. Family advisors must replace their temporary password after signing in for the first time.
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
function SlotCard({ member, index, onInvite, onRequestChange, isEmpty }) {
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
            <div style={{ color: textMuted, fontSize: 11.5, marginTop: 2 }}>No family advisors yet</div>
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
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Avatar email={member?.partner?.email} />
        <div>
          <div style={{ color: textPrimary, fontSize: 13.5, fontWeight: 600 }}>{member?.partner?.email}</div>
          <div style={{ color: textMuted, fontSize: 11.5, marginTop: 2 }}>
            Added {new Date(member.createdAt || member.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            {member?.invitedByPartner?.email && (
              <span> · by <span style={{ color: primary }}>{member.invitedByPartner.email}</span></span>
            )}
            {member?.member_role && (
              <span> · {member.member_role === "client_admin" ? "Client Admin" : "Family Advisor"}</span>
            )}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        <StatusPill status={member.status} requestType={member.request_type} />
        {member.status === "approved" && member.partner?.status === "active" && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <GhostBtn onClick={() => onRequestChange(member, "deactivate")} style={{ padding: "6px 9px", fontSize: 11 }}>
              Request deactivation
            </GhostBtn>
            <GhostBtn onClick={() => onRequestChange(member, "remove")} danger style={{ padding: "6px 9px", fontSize: 11 }}>
              Request removal
            </GhostBtn>
          </div>
        )}
        {member.partner?.status === "inactive" && (
          <span style={{ color: textMuted, fontSize: 11 }}>User access inactive</span>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PartnerTeamMembers({ token }) {
  const { error: err, success: ok } = useToast();
  const [members, setMembers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [statusRequest, setStatusRequest] = useState(null);
  const [statusRequestReason, setStatusRequestReason] = useState("");
  const [requestingId, setRequestingId] = useState(null);

  const MAX_SLOTS = 3;

  const fetchMembers = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/partner/team-members`, {
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

  const latestMemberByPartner = new Map();
  for (const member of members) {
    const partnerId = member.partner_id || member.partner?.id;
    if (partnerId !== undefined && partnerId !== null) {
      latestMemberByPartner.set(String(partnerId), member);
    }
  }
  const isRemoved = (member) => {
    const requestType = member.request_type ?? member.requestType;
    return requestType === "remove" && member.status === "approved";
  };
  const visibleMembers = [...latestMemberByPartner.values()].filter((member) => !isRemoved(member));
  const slotsUsed = visibleMembers.length;
  const slotsLeft = MAX_SLOTS - slotsUsed;
  const canInvite = slotsLeft > 0;

  const slots = Array.from({ length: MAX_SLOTS }, (_, i) => ({
    member: visibleMembers[i] || null,
    isEmpty: !visibleMembers[i],
  }));

  const handleStatusRequest = async () => {
    const reason = statusRequestReason.trim();
    if (!reason) return err("Reason required", "Add a reason for the request.");
    const partnerId = statusRequest?.member?.partner?.id || statusRequest?.member?.partner_id;
    if (!partnerId) return err("Request failed", "Could not identify this family advisor.");

    try {
      setRequestingId(partnerId);
      await axios.post(
        `${BASE_URL}/partner/team-members/${partnerId}/status-request`,
        { action: statusRequest.action, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      ok("Request sent", `The Super Admin will review your ${statusRequest.action} request.`);
      setStatusRequest(null);
      setStatusRequestReason("");
      await fetchMembers();
    } catch (e) {
      err("Request failed", e?.response?.data?.message || "Could not submit this request.");
    } finally {
      setRequestingId(null);
    }
  };

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
              Manage who has access to your partner account alongside you.
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
                onRequestChange={(selectedMember, action) => {
                  setStatusRequest({ member: selectedMember, action });
                  setStatusRequestReason("");
                }}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && visibleMembers.length === 0 && (
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
              Add up to 3 teammates. They'll need admin approval before they can log in.
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
      {statusRequest && (
        <Modal
          title={statusRequest.action === "remove" ? "Request User Removal" : "Request User Deactivation"}
          subtitle={`${statusRequest.member?.partner?.email || "family advisor"} · Super Admin approval required`}
          onClose={() => {
            if (!requestingId) {
              setStatusRequest(null);
              setStatusRequestReason("");
            }
          }}
        >
          <p style={{ color: textSecondary, fontSize: 13, lineHeight: 1.5, marginTop: 0 }}>
            This request will be reviewed by a Super Admin. If approved, access is disabled; the user’s account and history are retained.
          </p>
          <Field label="Reason (required)">
            <textarea
              autoFocus
              required
              rows={4}
              maxLength={2000}
              value={statusRequestReason}
              onChange={(event) => setStatusRequestReason(event.target.value)}
              placeholder="Explain why this access change is needed."
              style={{ ...inputStyle, height: "auto", padding: 10, resize: "vertical" }}
            />
          </Field>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <GhostBtn
              onClick={() => {
                setStatusRequest(null);
                setStatusRequestReason("");
              }}
            >Cancel</GhostBtn>
            <ActionBtn onClick={handleStatusRequest} disabled={!statusRequestReason.trim() || requestingId !== null}>
              {requestingId ? "Sending…" : "Send for approval"}
            </ActionBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}