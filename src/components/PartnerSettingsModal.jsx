import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "./useToast";
import { BASE_URL } from "../baseurl";
// ─── Partner Settings Modal ───────────────────────────────────────────────────
// ─── Shared Design Tokens ────────────────────────────────────────────────────
const primary = "#1669A9";
const primaryHover = "#1E90CF";
const surface = "#FFFFFF";
const border = "#E5EAF0";
const borderPrimary = "rgba(22,105,169,0.25)";
const textPrimary = "#1A1A2E";
const textSecondary = "#374151";
const textMuted = "#9CA3AF";


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
  
  const selectStyle = { ...inputStyle, appearance: "none" };


  function GhostBtn({ onClick, children, danger, style = {} }) {
    const [hov, setHov] = useState(false);
    const c = danger ? (hov ? "#b91c1c" : "#DC2626") : (hov ? primary : textMuted);
    return (
      <button onClick={onClick}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          backgroundColor: "transparent", color: c,
          border: `1px solid ${hov ? (danger ? "#DC2626" : borderPrimary) : border}`,
          borderRadius: 8, padding: "8px 16px", fontSize: 12.5, fontWeight: 500,
          cursor: "pointer", transition: "all .2s", ...style,
        }}>{children}</button>
    );
  }


  function ActionBtn({ onClick, color = primary, hoverColor = primaryHover, textColor = "#fff", children, disabled, style = {} }) {
    const [hov, setHov] = useState(false);
    return (
      <button onClick={onClick} disabled={disabled}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          backgroundColor: hov ? hoverColor : color, color: textColor,
          border: "none", borderRadius: 8, padding: "8px 16px",
          fontSize: 12.5, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1, transition: "all .2s", ...style,
        }}>{children}</button>
    );
  }
function Modal({ title, subtitle, onClose, children }) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 60, display: "flex",
        alignItems: "center", justifyContent: "center", padding: 16,
        backgroundColor: "rgba(26,26,46,0.5)", backdropFilter: "blur(4px)",
      }} onClick={onClose}>
        <div style={{
          backgroundColor: surface, border: `1px solid ${border}`, borderRadius: 16,
          width: "100%", maxWidth: 540, maxHeight: "90vh", display: "flex", flexDirection: "column",
          boxShadow: "0 20px 60px rgba(22,105,169,0.12), 0 4px 16px rgba(0,0,0,0.08)",
        }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: "24px 28px 16px", borderBottom: `1px solid ${border}`, flexShrink: 0 }}>
            <div style={{ color: textPrimary, fontSize: 18, fontWeight: 700 }}>{title}</div>
            {subtitle && <div style={{ color: textMuted, fontSize: 12.5, marginTop: 3 }}>{subtitle}</div>}
          </div>
          <div style={{ overflowY: "auto", flex: 1, padding: "20px 28px 28px" }}>{children}</div>
        </div>
      </div>
    );
  }

function PartnerSettingsModal({ partner, token, onClose }) {
    const { success: ok, error: err } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [completed, setCompleted] = useState(0);
    const [form, setForm] = useState({
      annualGoal: 500,
      emailRemindersEnabled: true,
      emailSendTime: "07:00",
    });
    useEffect(() => {
      const fetchSettings = async () => {
        try {
          setLoading(true);
          const { data } = await axios.get(
            `${BASE_URL}/admin/partners/${partner.id}/settings`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const s = data.settings;
          setCompleted(Number(data.completedMemorials ?? 0)); // adjust to your API field
          setForm({
            annualGoal: s.annualGoal,
            emailRemindersEnabled: s.emailRemindersEnabled,
            emailSendTime: s.emailSendTime,
          });
        } catch {
          err("Error", "Failed to load partner settings.");
        } finally {
          setLoading(false);
        }
      };
      fetchSettings();
    }, [err, partner.id, token]);
  
    const handleSave = async () => {
      try {
        setSaving(true);
        await axios.patch(
          `${BASE_URL}/admin/partners/${partner.id}/settings`,
          {
            annualGoal: Number(form.annualGoal),
            emailRemindersEnabled: form.emailRemindersEnabled,
            emailSendTime: form.emailSendTime,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        ok("Settings updated", `Partnership settings saved for ${partner.username}.`);
        onClose();
      } catch (e) {
        console.log(e.message)
        err("Update failed", e?.response?.data?.message || "Could not update settings.");
      } finally {
        setSaving(false);
      }
    };
  
    return (
      <Modal title="Partnership Settings" subtitle={`${partner.username} — ID #${partner.id}`} onClose={onClose}>
        {loading ? (
          <div style={{ padding: "20px 0", textAlign: "center", color: textMuted, fontSize: 13 }}>Loading settings…</div>
        ) : (
          <>
           <Field label="Annual Memorial Goal">
  {/* Progress summary */}
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
      <span style={{ color: textPrimary, fontSize: 22, fontWeight: 700 }}>
        {completed}
        <span style={{ color: textMuted, fontSize: 13, fontWeight: 500 }}> completed</span>
      </span>
      <span style={{ color: textMuted, fontSize: 12.5 }}>
        Goal: {Number(form.annualGoal) || 0}
      </span>
    </div>
    <div style={{ height: 6, borderRadius: 999, backgroundColor: border, overflow: "hidden" }}>
      <div style={{
        height: "100%",
        width: `${Math.min(100, (completed / (Number(form.annualGoal) || 1)) * 100)}%`,
        backgroundColor: primary,
        transition: "width .3s",
      }} />
    </div>
  </div>

  {/* Single goal input + quick presets */}
  <input
    type="number"
    min="1"
    style={inputStyle}
    value={form.annualGoal}
    onChange={(e) => setForm((p) => ({ ...p, annualGoal: e.target.value }))}
  />
  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
    {[300, 500].map((n) => (
      <GhostBtn
        key={n}
        onClick={() => setForm((p) => ({ ...p, annualGoal: n }))}
        style={{ padding: "4px 12px" }}
      >
        {n}
      </GhostBtn>
    ))}
  </div>
</Field>
  
            <Field label="Daily Email Reminder Time">
              <input
                type="time"
                style={inputStyle}
                value={form.emailSendTime}
                onChange={(e) => setForm((p) => ({ ...p, emailSendTime: e.target.value }))}
              />
            </Field>
  
            <Field label="Email Reminders">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="checkbox"
                  checked={form.emailRemindersEnabled}
                  onChange={(e) => setForm((p) => ({ ...p, emailRemindersEnabled: e.target.checked }))}
                  style={{ width: 16, height: 16 }}
                />
                <span style={{ color: textSecondary, fontSize: 13 }}>
                  {form.emailRemindersEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </Field>
  
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <GhostBtn onClick={onClose}>Cancel</GhostBtn>
              <ActionBtn onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Settings"}</ActionBtn>
            </div>
          </>
        )}
      </Modal>
    );
  }

  export default PartnerSettingsModal