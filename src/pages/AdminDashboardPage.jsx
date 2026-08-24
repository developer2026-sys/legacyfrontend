import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BASE_URL } from "../baseurl";
import { useToast } from "../components/toast";
import React from "react";
import { useNavigate } from "react-router-dom";
import TeammemberButton from "../components/teamemberbutton";
import PartnerSettingsModal from "../components/PartnerSettingsModal";
import { MonumentSettingTab } from "./MonumentSettingAdminTab";

const primary = "#1669A9";
const primaryHover = "#1E90CF";
const bg = "#F5F7FA";
const surface = "#FFFFFF";
const surfaceMid = "#F0F4F8";
const border = "#E5EAF0";
const borderPrimary = "rgba(22,105,169,0.25)";
const textPrimary = "#1A1A2E";
const textSecondary = "#374151";
const textMuted = "#9CA3AF";

function Logo({ size = 64 }) {
  return (
    <div className="flex items-center gap-3">
      <img src="/app/cleanerlogo.jpg" alt="Lasting Legacy Cleaners" style={{ height: size, width: "auto", display: "block" }} />
    </div>
  );
}

const STATUS_STYLES = {
  pending_approval: { bg: "rgba(234,179,8,0.1)",   color: "#92400E", border: "rgba(234,179,8,0.4)",    label: "Pending Approval" },
  approved:         { bg: "rgba(22,105,169,0.08)",  color: primary,   border: "rgba(22,105,169,0.3)",   label: "Approved" },
  completed:        { bg: "rgba(16,185,129,0.08)",  color: "#065F46", border: "rgba(16,185,129,0.3)",   label: "Completed" },
  denied:           { bg: "rgba(220,38,38,0.08)",   color: "#DC2626", border: "rgba(220,38,38,0.25)",   label: "Denied" },
};

const PTM_STATUS_STYLES = {
  pending:  { bg: "rgba(234,179,8,0.1)",   color: "#92400E", border: "rgba(234,179,8,0.4)",  label: "Pending Approval" },
  approved: { bg: "rgba(22,105,169,0.08)", color: primary,   border: "rgba(22,105,169,0.3)", label: "Approved" },
  denied:   { bg: "rgba(220,38,38,0.08)",  color: "#DC2626", border: "rgba(220,38,38,0.25)", label: "Denied" },
};

function PtmStatusBadge({ status }) {
  const s = PTM_STATUS_STYLES[status] || { bg: "rgba(0,0,0,0.04)", color: textMuted, border: border, label: status };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", borderRadius: 999,
      border: `1px solid ${s.border}`, backgroundColor: s.bg, color: s.color,
      padding: "3px 10px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
      letterSpacing: "0.04em",
    }}>
      {s.label}
    </span>
  );
}


function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { bg: "rgba(0,0,0,0.04)", color: textMuted, border: border, label: status };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", borderRadius: 999,
      border: `1px solid ${s.border}`, backgroundColor: s.bg, color: s.color,
      padding: "3px 10px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
      letterSpacing: "0.04em",
    }}>
      {s.label}
    </span>
  );
}

function Tab({ label, active, onClick, count }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer",
      border: `1px solid ${active ? borderPrimary : border}`,
      backgroundColor: active ? "rgba(22,105,169,0.08)" : surface,
      color: active ? primary : textMuted, transition: "all .2s",
      boxShadow: active ? "none" : "0 1px 2px rgba(0,0,0,0.04)",
    }}>
      {label}{count !== undefined && <span style={{ marginLeft: 6, opacity: 0.6, fontSize: 11 }}>({count})</span>}
    </button>
  );
}

// ─── Modal Wrapper ────────────────────────────────────────────────────────────
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

// ─── Form Field ───────────────────────────────────────────────────────────────
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

// ─── Action Button ────────────────────────────────────────────────────────────
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

// ─── Upload Documents Modal ───────────────────────────────────────────────────
function UploadDocumentsModal({ request, token, onClose }) {
  const { success: ok, error: err } = useToast();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState([]);
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected]);
    e.target.value = "";
  };

  const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));

  const handleUpload = async () => {
    if (!files.length) return;
    const formData = new FormData();
    files.forEach(f => formData.append("documents", f));
    try {
      setUploading(true);
      const { data } = await axios.post(
        `${BASE_URL}/admin/requests/${request.id}/documents`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      ok("Uploaded", `${files.length} document${files.length !== 1 ? "s" : ""} uploaded successfully.`);
      setUploaded(prev => [...prev, ...(data.files || [])]);
      setFiles([]);
    } catch (e) {
      err("Upload failed", e?.response?.data?.message || "Could not upload documents.");
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Modal title="Upload Documents" subtitle={`Request #${request.id} — ${request.customerName}`} onClose={onClose}>
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${borderPrimary}`, borderRadius: 10, padding: "32px 20px",
          textAlign: "center", cursor: "pointer", backgroundColor: "rgba(22,105,169,0.03)",
          transition: "background .2s", marginBottom: 16,
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(22,105,169,0.07)"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(22,105,169,0.03)"}
        onDragOver={e => { e.preventDefault(); e.currentTarget.style.backgroundColor = "rgba(22,105,169,0.1)"; }}
        onDragLeave={e => e.currentTarget.style.backgroundColor = "rgba(22,105,169,0.03)"}
        onDrop={e => {
          e.preventDefault();
          e.currentTarget.style.backgroundColor = "rgba(22,105,169,0.03)";
          setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
        <div style={{ color: primary, fontSize: 13.5, fontWeight: 500, marginBottom: 4 }}>Click to browse or drag & drop</div>
        <div style={{ color: textMuted, fontSize: 12 }}>PDF, images, Word documents, etc.</div>
        <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={handleFileChange} />
      </div>

      {files.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: textMuted, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Queued ({files.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {files.map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                backgroundColor: "#F9FAFB", border: `1px solid ${border}`, borderRadius: 8, padding: "8px 12px",
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: textPrimary, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                  <div style={{ color: textMuted, fontSize: 11 }}>{formatSize(f.size)}</div>
                </div>
                <button onClick={() => removeFile(i)} style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: 15, padding: "0 4px" }}>×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploaded.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: "#065F46", fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>✓ Uploaded this session ({uploaded.length})</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {uploaded.map((u, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8,
                backgroundColor: "rgba(16,185,129,0.05)", border: `1px solid rgba(16,185,129,0.2)`,
                borderRadius: 8, padding: "7px 12px",
              }}>
                <span style={{ color: "#10B981", fontSize: 13 }}>✓</span>
                <span style={{ color: textSecondary, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {u.originalName || u.filename || u}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <GhostBtn onClick={onClose}>Close</GhostBtn>
        <ActionBtn onClick={handleUpload} disabled={uploading || files.length === 0}>
          {uploading ? "Uploading…" : `Upload${files.length > 0 ? ` (${files.length})` : ""}`}
        </ActionBtn>
      </div>
    </Modal>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
function ConfirmDeleteModal({ partner, onConfirm, onClose, loading }) {
  return (
    <Modal title="Delete Partner" subtitle="This action cannot be undone." onClose={onClose}>
      <p style={{ color: textSecondary, fontSize: 13.5, lineHeight: 1.6, marginBottom: 24 }}>
        You are about to permanently delete partner <strong style={{ color: textPrimary }}>{partner.username}</strong>
        {partner.email ? ` (${partner.email})` : ""}. All associated requests will be unlinked.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <GhostBtn onClick={onClose}>Cancel</GhostBtn>
        <ActionBtn onClick={onConfirm} disabled={loading} color="#DC2626" hoverColor="#b91c1c" textColor="#fff">
          {loading ? "Deleting…" : "Delete Partner"}
        </ActionBtn>
      </div>
    </Modal>
  );
}

// ─── Edit Partner Modal ───────────────────────────────────────────────────────
function EditPartnerModal({ partner, token, onClose, onSaved }) {
  const { success: ok, error: err } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    username: partner.username || "",
    email: partner.email || "",
    role: partner.role || "partner",
    password: "",
  });

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    const payload = { username: form.username, email: form.email, role: form.role };
    if (form.password) payload.password = form.password;
    try {
      setSaving(true);
      await axios.put(`${BASE_URL}/admin/partners/${partner.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      ok("Partner updated", `${form.username} has been updated.`);
      onSaved();
      onClose();
    } catch (e) {
      err("Update failed", e?.response?.data?.message || "Could not update partner.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Edit Partner" subtitle={`ID #${partner.id}`} onClose={onClose}>
      <Field label="Username"><input style={inputStyle} value={form.username} onChange={set("username")} /></Field>
      <Field label="Email"><input style={inputStyle} type="email" value={form.email} onChange={set("email")} /></Field>
      <Field label="Role">
        <select style={selectStyle} value={form.role} onChange={set("role")}>
          <option value="partner">Partner</option>
          <option value="admin">Admin</option>
        </select>
      </Field>
      <Field label="New Password (leave blank to keep)">
        <input style={inputStyle} type="password" placeholder="••••••••" value={form.password} onChange={set("password")} />
      </Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <GhostBtn onClick={onClose}>Cancel</GhostBtn>
        <ActionBtn onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</ActionBtn>
      </div>
    </Modal>
  );
}

// ─── Request Detail Modal ─────────────────────────────────────────────────────
// ─── Detail Row (stable component, defined outside modal to preserve identity across re-renders) ──
function DetailRow({ label, value, children }) {
  return (
    <div style={{
      display: "flex", gap: 12, padding: "10px 0",
      borderBottom: `1px solid ${border}`, alignItems: "flex-start",
    }}>
      <div style={{ color: textMuted, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 130, paddingTop: 1 }}>{label}</div>
      <div style={{ color: textPrimary, fontSize: 13.5, flex: 1, wordBreak: "break-word" }}>
        {children !== undefined ? children : (value || <span style={{ color: textMuted }}>—</span>)}
      </div>
    </div>
  );
}

// ─── Request Detail Modal ─────────────────────────────────────────────────────
function RequestDetailModal({ request, token, onClose, onStatusChange, onPriceChange }) {
  const { success: ok, error: err } = useToast();
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState(request.status);
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [price, setPrice] = useState(request.packagePrice);
  const [priceInput, setPriceInput] = useState(String(request.packagePrice));
  const [savingPrice, setSavingPrice] = useState(false);
  const [settingsPartner, setSettingsPartner] = useState(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setDocsLoading(true);
        const { data } = await axios.get(
          `${BASE_URL}/admin/requests/${request.id}/documents`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDocuments(data.documents || data.files || []);
      } catch { setDocuments([]); }
      finally { setDocsLoading(false); }
    };
    fetchDocs();
  }, [request.id, token]);

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await axios.patch(
        `${BASE_URL}/admin/requests/${request.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus(newStatus);
      ok("Status updated", `Request #${request.id} is now ${newStatus}.`);
      onStatusChange(request.id, newStatus);
    } catch (e) {
      err("Update failed", e?.response?.data?.message || "Could not update status.");
    } finally { setUpdating(false); }
  };

  const updatePrice = async () => {
    const newPrice = parseFloat(priceInput);
    if (isNaN(newPrice) || newPrice < 0) {
      err("Invalid price", "Please enter a valid positive number.");
      return;
    }
    try {
      setSavingPrice(true);
      await axios.patch(
        `${BASE_URL}/admin/requests/${request.id}/price`,
        { packagePrice: newPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPrice(newPrice);
      ok("Price updated", `Request #${request.id} price set to $${newPrice.toFixed(2)}.`);
      if (typeof onPriceChange === "function") onPriceChange(request.id, newPrice);
    } catch (e) {
      console.log(e.message)
      err("Update failed", e?.response?.data?.message || "Could not update price.");
    } finally { setSavingPrice(false); }
  };
 

  const getFileIcon = (filename = "") => {
    const ext = filename.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "🖼️";
    if (ext === "pdf") return "📄";
    if (["doc", "docx"].includes(ext)) return "📝";
    return "📎";
  };

  return (
    <Modal
      title={`Request #${request.id}`}
      subtitle={`Submitted ${new Date(request.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
      onClose={onClose}
    >
    <DetailRow label="Status" value={<StatusBadge status={status} />} />
      <DetailRow label="Customer" value={request.customerName} />
      <DetailRow label="Phone" value={request.customerPhone} />
      <DetailRow label="Email" value={request.customerEmail} />
      <DetailRow label="Location" value={request.memorialLocation} />
      <DetailRow label="Package" value={request.packageType === "basic_annual" ? "Basic Annual — $549" : "Premium Annual — $749"} />
      <DetailRow label="Price">
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative", width: 140 }}>
            <span style={{ position: "absolute", left: 12, top: 0, height: "100%", display: "flex", alignItems: "center", color: textMuted, fontSize: 13 }}>$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={priceInput}
              onChange={e => setPriceInput(e.target.value)}
              style={{ ...inputStyle, height: 36, paddingLeft: 22, fontSize: 13 }}
            />
          </div>
          <ActionBtn
            onClick={updatePrice}
            disabled={savingPrice || parseFloat(priceInput) === Number(price)}
            style={{ fontSize: 12, padding: "8px 14px" }}
          >
            {savingPrice ? "Saving…" : "Save"}
          </ActionBtn>
        </div>
      </DetailRow>
      <DetailRow label="Partner ID" value={request.partnerId ? `#${request.partnerId}` : "—"} />
      <DetailRow label="Approved By" value={request.approvedBy} />
      <DetailRow label="Approved At" value={request.approvedAt ? new Date(request.approvedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null} />
      <DetailRow label="Denied By" value={request.deniedBy} />
      <DetailRow label="Denied At" value={request.deniedAt ? new Date(request.deniedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null} />
      {request.notes && <DetailRow label="Notes" value={request.notes} />}
    

      {/* Documents */}
      <div style={{ marginTop: 20 }}>
        <div style={{ color: textMuted, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Uploaded Documents</div>
        {docsLoading ? (
          <div style={{ padding: "14px 0", color: textMuted, fontSize: 12.5 }}>Loading documents…</div>
        ) : documents.length === 0 ? (
          <div style={{ padding: "14px 16px", backgroundColor: "#F9FAFB", border: `1px dashed ${border}`, borderRadius: 8, color: textMuted, fontSize: 12.5, textAlign: "center" }}>
            No documents uploaded yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {documents.map((doc, i) => {
              const rawPath = doc.storagePath || doc.storage_path || "";
              const filename = rawPath.split(/[/\\]/).pop() || `File ${i + 1}`;
              const fileUrl = `http://localhost:5000/files/${filename}`;
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  backgroundColor: "#F9FAFB", border: `1px solid ${border}`,
                  borderRadius: 8, padding: "10px 14px", transition: "border-color .15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = borderPrimary}
                  onMouseLeave={e => e.currentTarget.style.borderColor = border}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 6, backgroundColor: "rgba(22,105,169,0.08)",
                    border: `1px solid ${borderPrimary}`, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 18, flexShrink: 0,
                  }}>{getFileIcon(filename)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: textPrimary, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{filename}</div>
                    {(doc.createdAt || doc.created_at) && (
                      <div style={{ color: textMuted, fontSize: 11, marginTop: 2 }}>
                        Uploaded {new Date(doc.createdAt || doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    )}
                  </div>
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{
                    color: primary, fontSize: 11.5, textDecoration: "none", flexShrink: 0,
                    border: `1px solid ${borderPrimary}`, borderRadius: 6, padding: "4px 10px",
                    backgroundColor: "rgba(22,105,169,0.06)", transition: "background .15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(22,105,169,0.14)"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(22,105,169,0.06)"}
                  >Open ↗</a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Update Status */}
      <div style={{ marginTop: 20 }}>
        <div style={{ color: textMuted, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Update Status</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["pending_approval", "approved", "completed", "denied"].map(s => (
            <ActionBtn
              key={s}
              disabled={updating || status === s}
              onClick={() => updateStatus(s)}
              color={status === s ? "rgba(22,105,169,0.12)" : surfaceMid}
              hoverColor="rgba(22,105,169,0.1)"
              textColor={status === s ? primary : textMuted}
              style={{ border: `1px solid ${status === s ? borderPrimary : border}`, fontSize: 12 }}
            >
              {STATUS_STYLES[s]?.label || s}
            </ActionBtn>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
        <GhostBtn onClick={onClose}>Close</GhostBtn>
      </div>
    </Modal>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sublabel, icon }) {
  return (
    <div style={{
      backgroundColor: surface, border: `1px solid ${border}`,
      borderRadius: 14, padding: "20px 22px",
      display: "flex", alignItems: "flex-start", gap: 16,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
        backgroundColor: primary, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20,
      }}>{icon}</div>
      <div>
        <div style={{ color: textPrimary, fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
        <div style={{ color: textPrimary, fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>{label}</div>
        {sublabel && <div style={{ color: textMuted, fontSize: 11.5, marginTop: 2 }}>{sublabel}</div>}
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function AdminDashboard({ token, adminName, onLogout }) {
  const { success: ok, error: err } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState("requests");

  const displayName = adminName || (() => {
    try { return JSON.parse(localStorage.getItem("admin"))?.email || "Admin"; }
    catch { return "Admin"; }
  })();

  const [requests, setRequests] = useState([]);
  const [emailToggleId, setEmailToggleId] = useState(null);
  const [reqLoading, setReqLoading] = useState(true);
  const [emailRemindersEnabled, setEmailRemindersEnabled] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [partners, setPartners] = useState([]);
  const [partLoading, setPartLoading] = useState(true);
  const [editPartner, setEditPartner] = useState(null);
  const [deletePartner, setDeletePartner] = useState(null);
 const [settingsPartner, setSettingsPartner] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [uploadRequest, setUploadRequest] = useState(null);
  const [partnerTeamMembers, setPartnerTeamMembers] = useState([]);
  const [ptmLoading, setPtmLoading] = useState(true);
  const [ptmActioningId, setPtmActioningId] = useState(null);
  const [monumentRequests, setMonumentRequests] = useState([]);
  const [monumentLoading, setMonumentLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      setReqLoading(true);
      const { data } = await axios.get(`${BASE_URL}/admin/requests`, { headers: { Authorization: `Bearer ${token}` } });
      setRequests(data.requests || []);
    } catch { err("Error", "Failed to load requests."); }
    finally { setReqLoading(false); }
  }, [token]);

  const fetchPartners = useCallback(async () => {
    try {
      setPartLoading(true);
      const { data } = await axios.get(`${BASE_URL}/admin/partners`, { headers: { Authorization: `Bearer ${token}` } });
      setPartners(data.partners || []);
    } catch { err("Error", "Failed to load partners."); }
    finally { setPartLoading(false); }
  }, [token]);

  const fetchPartnerTeamMembers = useCallback(async () => {
    try {
      setPtmLoading(true);
      const { data } = await axios.get(`${BASE_URL}/admin/partner-team-members`, { headers: { Authorization: `Bearer ${token}` } });
      setPartnerTeamMembers(data.partnerTeamMembers || []);
    } catch { err("Error", "Failed to load partner team members."); }
    finally { setPtmLoading(false); }
  }, [token]);

  const fetchMonumentRequests = useCallback(async () => {
    try {
      setMonumentLoading(true);
      const { data } = await axios.get(`${BASE_URL}/admin/monument-setting`, { headers: { Authorization: `Bearer ${token}` } });
      setMonumentRequests(data.requests || []);
    } catch { err("Error", "Failed to load monument setting requests."); }
    finally { setMonumentLoading(false); }
  }, [token]);


  const fetchEmailReminderSetting = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/admin/settings/email-reminders`, { headers: { Authorization: `Bearer ${token}` } });
      setEmailRemindersEnabled(!!data.emailRemindersEnabled);
    } catch {  }
  }, [token]);

  useEffect(() => { fetchRequests(); fetchPartners(); fetchPartnerTeamMembers(); fetchEmailReminderSetting(); fetchMonumentRequests(); }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    if (typeof onLogout === "function") onLogout();
    navigate("/admin");
  };

  const handleDeletePartner = async () => {
    try {
      setDeletingId(deletePartner.id);
      await axios.delete(`${BASE_URL}/admin/partners/${deletePartner.id}`, { headers: { Authorization: `Bearer ${token}` } });
      ok("Partner deleted", `${deletePartner.username} has been removed.`);
      setDeletePartner(null);
      fetchPartners();
    } catch (e) {
      err("Delete failed", e?.response?.data?.message || "Could not delete partner.");
    } finally { setDeletingId(null); }
  };

  const handleStatusChange = (id, newStatus) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  const handlePriceChange = (id, newPrice) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, packagePrice: newPrice } : r));
  };

  const handleTogglePartnerEmail = async (partner, nextValue) => {
    try {
      setEmailToggleId(partner.id);
      await axios.patch(
        `${BASE_URL}/admin/partners/${partner.id}/settings`,
        { emailRemindersEnabled: nextValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPartners(prev => prev.map(p =>
        p.id === partner.id
          ? { ...p, partnershipSettings: { ...(p.partnershipSettings || {}), emailRemindersEnabled: nextValue } }
          : p
      ));
      ok(nextValue ? "Reminders enabled" : "Reminders disabled",
        `${partner.username} will ${nextValue ? "now" : "no longer"} receive reminder emails.`);
    } catch (e) {
      err("Update failed", e?.response?.data?.message || "Could not update email setting.");
    } finally { setEmailToggleId(null); }
  };

  const handlePtmDecision = async (id, decision) => {
    try {
      setPtmActioningId(id);
      await axios.patch(`${BASE_URL}/admin/partner-team-members/${id}/${decision}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      ok(decision === "approve" ? "Approved" : "Denied", `Team member request has been ${decision === "approve" ? "approved" : "denied"}.`);
      setPartnerTeamMembers(prev => prev.map(m => m.id === id ? { ...m, status: decision === "approve" ? "approved" : "denied" } : m));
    } catch (e) {
      err("Failed", e?.response?.data?.message || `Could not ${decision} this request.`);
    } finally { setPtmActioningId(null); }
  };


  const filteredRequests = requests.filter(r => {
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const q = searchQ.toLowerCase();
    const matchSearch = !q ||
      r.customerName?.toLowerCase().includes(q) ||
      r.memorialLocation?.toLowerCase().includes(q) ||
      r.customerEmail?.toLowerCase().includes(q) ||
      String(r.id).includes(q);
    return matchStatus && matchSearch;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending_approval").length,
    approved: requests.filter(r => r.status === "approved").length,
    completed: requests.filter(r => r.status === "completed").length,
    partners: partners.length,
    revenue: requests.filter(r => r.status !== "pending_approval").reduce((s, r) => s + Number(r.packagePrice || 0), 0),
  };

  const Th = ({ children }) => (
    <th style={{ padding: "11px 16px", textAlign: "left", color: textMuted, fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, whiteSpace: "nowrap", backgroundColor: "#F8FAFC" }}>
      {children}
    </th>
  );

  // Shared inline action button style factory
  const inlineBtn = (color, hoverBg) => ({
    base: { background: "none", border: `1px solid ${border}`, color, borderRadius: 6, padding: "5px 12px", fontSize: 11.5, cursor: "pointer", transition: "all .15s" },
    enter: { borderColor: color, backgroundColor: hoverBg },
    leave: { borderColor: border, backgroundColor: "transparent" },
  });

  const btnGold   = inlineBtn(primary, "rgba(22,105,169,0.08)");
  const btnGreen  = inlineBtn("#059669", "rgba(5,150,105,0.07)");
  const btnRed    = inlineBtn("#DC2626", "rgba(220,38,38,0.07)");
  const btnBlue   = inlineBtn("#0284C7", "rgba(2,132,199,0.07)");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: bg, fontFamily: "'Inter', system-ui, sans-serif", color: textPrimary }}>

      {/* Top bar accent */}
      <div style={{ height: 4, background: "linear-gradient(90deg, #1669A9, #1E90CF, #1669A9)" }} />

      {/* ── Top Nav ── */}
      <header style={{
        borderBottom: `1px solid ${border}`, backgroundColor: surface,
        position: "sticky", top: 0, zIndex: 40,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
            <Logo />
           <TeammemberButton/>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            
            </label>
            <span style={{ color: textMuted, fontSize: 12.5 }}>
              Signed in as <span style={{ color: primary, fontWeight: 600 }}>{displayName}</span>
            </span>
            </div>
            <button
              onClick={handleLogout}
              style={{ background: "none", border: `1px solid ${border}`, color: textMuted, borderRadius: 8, padding: "7px 16px", fontSize: 12.5, cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = borderPrimary; e.currentTarget.style.color = primary; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = textMuted; }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px" }}>

        {/* Page title */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: textPrimary, margin: 0 }}>Admin Dashboard</h1>
          <p style={{ color: textMuted, fontSize: 13, marginTop: 4 }}>Manage all restoration requests and partners for the platform.</p>
        </div>

        {/* Stats */}
    {/* Stats */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 28 }}>
          <StatCard label="Total Requests" value={stats.total} sublabel="All requests in your inventory" icon="📋" />
          <StatCard label="Revenue"        value={`$${stats.revenue.toLocaleString()}`} sublabel="Across all completed requests" icon="$" />
          <StatCard label="Pending"        value={stats.pending} sublabel="Awaiting approval" icon="⏳" />
          <StatCard label="Approved"       value={stats.approved} sublabel="Currently in progress" icon="📅" />
          <StatCard label="Completed"      value={stats.completed} sublabel="All-time completed" icon="✓" />
        
        </div>

     {/* Tabs */}
     <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          <Tab label="Requests" active={tab === "requests"} onClick={() => setTab("requests")} count={requests.length} />
          <Tab label="Partners" active={tab === "partners"} onClick={() => setTab("partners")} count={partners.length} />
          <Tab label="Partner Team Members" active={tab === "partnerTeamMembers"} onClick={() => setTab("partnerTeamMembers")} count={partnerTeamMembers.length} />
          <Tab label="Monument Setting" active={tab === "monumentSetting"} onClick={() => setTab("monumentSetting")} count={monumentRequests.length} />
        </div>

        {/* ══ REQUESTS TAB ══ */}
        {tab === "requests" && (
          <div style={{ backgroundColor: surface, border: `1px solid ${border}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", borderTop: `3px solid ${primary}` }}>
            {/* Toolbar */}
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${border}`, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", backgroundColor: "#FAFBFC" }}>
              <input
                placeholder="Search customer, location, email, ID…"
                value={searchQ} onChange={e => setSearchQ(e.target.value)}
                style={{ ...inputStyle, width: 260, height: 36, fontSize: 12.5 }}
              />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                style={{ ...selectStyle, width: 175, height: 36, fontSize: 12.5 }}>
                <option value="all">All Statuses</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="denied">Denied</option>
              </select>
              <span style={{ color: textMuted, fontSize: 12, marginLeft: "auto" }}>{filteredRequests.length} result{filteredRequests.length !== 1 ? "s" : ""}</span>
            </div>

            {reqLoading ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: textMuted, fontSize: 13 }}>Loading requests…</div>
            ) : filteredRequests.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: textMuted, fontSize: 13 }}>No requests match your filters.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr>
                      <Th>ID</Th><Th>Customer</Th><Th>Email</Th><Th>Location</Th>
                      <Th>Package</Th><Th>Partner</Th><Th>Status</Th>
                      <Th>Approved By</Th><Th>Approved At</Th>
                      <Th>Denied By</Th><Th>Denied At</Th>
                      <Th>Submitted</Th><Th>Action</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((r, i) => (
                      <tr key={r.id} style={{ borderTop: `1px solid ${border}`, backgroundColor: i % 2 === 0 ? surface : "#FAFBFC" }}>
                        <td style={{ padding: "13px 16px", color: textMuted, fontSize: 12 }}>#{r.id}</td>
                        <td style={{ padding: "13px 16px", color: textPrimary, fontWeight: 600 }}>{r.customerName}</td>
                        <td style={{ padding: "13px 16px", color: textSecondary, fontSize: 12 }}>{r.customerEmail}</td>
                        <td style={{ padding: "13px 16px", color: textSecondary, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.memorialLocation}</td>
                        <td style={{ padding: "13px 16px", color: textPrimary, whiteSpace: "nowrap" }}>
                          {r.packageType === "basic_annual" ? "Basic $549" : "Premium $749"}
                        </td>
                        <td style={{ padding: "13px 16px", color: textMuted, fontSize: 12 }}>
                          {r.partner ? r.partner.username : (r.partnerId ? `#${r.partnerId}` : "—")}
                        </td>
                        <td style={{ padding: "13px 16px" }}><StatusBadge status={r.status} /></td>
                        <td style={{ padding: "13px 16px", color: textSecondary, fontSize: 12 }}>{r.approvedBy || <span style={{ color: textMuted }}>—</span>}</td>
                        <td style={{ padding: "13px 16px", color: textSecondary, whiteSpace: "nowrap", fontSize: 12 }}>
                          {r.approvedAt ? new Date(r.approvedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : <span style={{ color: textMuted }}>—</span>}
                        </td>
                        <td style={{ padding: "13px 16px", color: textSecondary, fontSize: 12 }}>{r.deniedBy || <span style={{ color: textMuted }}>—</span>}</td>
                        <td style={{ padding: "13px 16px", color: textSecondary, whiteSpace: "nowrap", fontSize: 12 }}>
                          {r.deniedAt ? new Date(r.deniedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : <span style={{ color: textMuted }}>—</span>}
                        </td>
                        <td style={{ padding: "13px 16px", color: textSecondary, whiteSpace: "nowrap", fontSize: 12 }}>
                          {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            {r.status === "approved" && (
                              <button
                                onClick={() => setUploadRequest(r)}
                                style={btnBlue.base}
                                onMouseEnter={e => Object.assign(e.currentTarget.style, btnBlue.enter)}
                                onMouseLeave={e => Object.assign(e.currentTarget.style, btnBlue.leave)}
                              >Upload</button>
                            )}
                            <button
                              onClick={async () => {
                                try {
                                  const { data } = await axios.get(`${BASE_URL}/admin/requests/${r.id}`, { headers: { Authorization: `Bearer ${token}` } });
                                  setSelectedRequest(data.request);
                                } catch { setSelectedRequest(r); }
                              }}
                              style={btnGold.base}
                              onMouseEnter={e => Object.assign(e.currentTarget.style, btnGold.enter)}
                              onMouseLeave={e => Object.assign(e.currentTarget.style, btnGold.leave)}
                            >View</button>
                            {r.status === "pending_approval" && (
                              <>
                                <button
                                  onClick={async () => {
                                    try {
                                      await axios.patch(`${BASE_URL}/admin/requests/${r.id}/status`, { status: "approved" }, { headers: { Authorization: `Bearer ${token}` } });
                                      ok("Approved", `Request #${r.id} has been approved.`);
                                      handleStatusChange(r.id, "approved");
                                    } catch (e) { err("Failed", e?.response?.data?.message || "Could not approve request."); }
                                  }}
                                  style={btnGreen.base}
                                  onMouseEnter={e => Object.assign(e.currentTarget.style, btnGreen.enter)}
                                  onMouseLeave={e => Object.assign(e.currentTarget.style, btnGreen.leave)}
                                >Approve</button>
                                <button
                                  onClick={async () => {
                                    try {
                                      await axios.patch(`${BASE_URL}/admin/requests/${r.id}/status`, { status: "denied" }, { headers: { Authorization: `Bearer ${token}` } });
                                      ok("Denied", `Request #${r.id} has been denied.`);
                                      handleStatusChange(r.id, "denied");
                                    } catch (e) { err("Failed", e?.response?.data?.message || "Could not update request."); }
                                  }}
                                  style={btnRed.base}
                                  onMouseEnter={e => Object.assign(e.currentTarget.style, btnRed.enter)}
                                  onMouseLeave={e => Object.assign(e.currentTarget.style, btnRed.leave)}
                                >Deny</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ PARTNERS TAB ══ */}
        {tab === "partners" && (
          <div style={{ backgroundColor: surface, border: `1px solid ${border}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", borderTop: `3px solid #0284C7` }}>
            <div style={{ padding: "14px 18px 13px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FAFBFC" }}>
              <div style={{ color: textPrimary, fontSize: 15, fontWeight: 700 }}>All Partners</div>
              <span style={{ color: textMuted, fontSize: 12 }}>{partners.length} registered</span>
            </div>

            {partLoading ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: textMuted, fontSize: 13 }}>Loading partners…</div>
            ) : partners.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: textMuted, fontSize: 13 }}>No partners found.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                    <tr><Th>ID</Th><Th>Username</Th><Th>Email</Th><Th>Role</Th><Th>Email Reminders</Th><Th>Requests</Th><Th>Created</Th><Th>Actions</Th></tr>
                  </thead>
                  <tbody>
                    {partners.map((p, i) => {
                      const reqCount = requests.filter(r => r.partnerId === p.id).length;
                      return (
                        <tr key={p.id} style={{ borderTop: `1px solid ${border}`, backgroundColor: i % 2 === 0 ? surface : "#FAFBFC" }}>
                          <td style={{ padding: "13px 16px", color: textMuted, fontSize: 12 }}>#{p.id}</td>
                          <td style={{ padding: "13px 16px", color: textPrimary, fontWeight: 600 }}>{p.username}</td>
                          <td style={{ padding: "13px 16px", color: textSecondary, fontSize: 12 }}>{p.email || <span style={{ color: textMuted }}>—</span>}</td>
                          <td style={{ padding: "13px 16px" }}>
                          <td style={{ padding: "13px 16px" }}>
                            <span style={{
                              fontSize: 11, letterSpacing: "0.06em", padding: "3px 9px", borderRadius: 999,
                              backgroundColor: p.role === "admin" ? "rgba(22,105,169,0.1)" : "rgba(2,132,199,0.08)",
                              color: p.role === "admin" ? primary : "#0284C7",
                              border: `1px solid ${p.role === "admin" ? borderPrimary : "rgba(2,132,199,0.25)"}`,
                            }}>{p.role}</span>
                          </td>
                          <td style={{ padding: "13px 16px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                              <input
                                type="checkbox"
                                checked={p.partnershipSettings?.emailRemindersEnabled !== false}
                                disabled={emailToggleId === p.id}
                                onChange={(e) => handleTogglePartnerEmail(p, e.target.checked)}
                                style={{ width: 16, height: 16, cursor: "pointer", accentColor: primary }}
                              />
                              <span style={{ fontSize: 11.5, color: textMuted }}>
                                {emailToggleId === p.id ? "Saving…" : (p.partnershipSettings?.emailRemindersEnabled !== false ? "On" : "Off")}
                              </span>
                            </label>
                          </td>
                          <td style={{ padding: "13px 16px", color: textSecondary }}>{reqCount}</td>
                          </td>
                          <td style={{ padding: "13px 16px", color: textSecondary }}>{reqCount}</td>
                          <td style={{ padding: "13px 16px", color: textSecondary, fontSize: 12, whiteSpace: "nowrap" }}>
                            {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td style={{ padding: "13px 16px" }}>
                            <div style={{ display: "flex", gap: 7 }}>
                            <button onClick={() => setSettingsPartner(p)}
                               style={btnBlue.base}
                               onMouseEnter={e => Object.assign(e.currentTarget.style, btnBlue.enter)}
                               onMouseLeave={e => Object.assign(e.currentTarget.style, btnBlue.leave)}
                             >Settings</button>
                              <button onClick={() => setEditPartner(p)}
                                style={btnGold.base}
                                onMouseEnter={e => Object.assign(e.currentTarget.style, btnGold.enter)}
                                onMouseLeave={e => Object.assign(e.currentTarget.style, btnGold.leave)}
                              >Edit</button>
                              <button onClick={() => setDeletePartner(p)}
                                style={btnRed.base}
                                onMouseEnter={e => Object.assign(e.currentTarget.style, btnRed.enter)}
                                onMouseLeave={e => Object.assign(e.currentTarget.style, btnRed.leave)}
                              >Delete</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

{tab === "partnerTeamMembers" && (
          <div style={{ backgroundColor: surface, border: `1px solid ${border}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", borderTop: `3px solid ${primary}` }}>
            <div style={{ padding: "14px 18px 13px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FAFBFC" }}>
              <div style={{ color: textPrimary, fontSize: 15, fontWeight: 700 }}>Partner Team Members</div>
              <span style={{ color: textMuted, fontSize: 12 }}>{partnerTeamMembers.length} total</span>
            </div>

            {ptmLoading ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: textMuted, fontSize: 13 }}>Loading partner team members…</div>
            ) : partnerTeamMembers.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: textMuted, fontSize: 13 }}>No partner team member requests yet.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr>
                      <Th>ID</Th><Th>Email</Th><Th>Invited By</Th>
                      <Th>Status</Th><Th>Created</Th><Th>Approved At</Th><Th>Action</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {partnerTeamMembers.map((m, i) => (
                      <tr key={m.id} style={{ borderTop: `1px solid ${border}`, backgroundColor: i % 2 === 0 ? surface : "#FAFBFC" }}>
                        <td style={{ padding: "13px 16px", color: textMuted, fontSize: 12 }}>#{m.id}</td>
                        <td style={{ padding: "13px 16px", color: textPrimary, fontWeight: 600 }}>{m.partner?.email || "—"}</td>
                        <td style={{ padding: "13px 16px", color: textSecondary, fontSize: 12 }}>{m.invitedByPartner?.email || "—"}</td>
                        <td style={{ padding: "13px 16px" }}><PtmStatusBadge status={m.status} /></td>
                        <td style={{ padding: "13px 16px", color: textSecondary, whiteSpace: "nowrap", fontSize: 12 }}>
                          {new Date(m.createdAt || m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td style={{ padding: "13px 16px", color: textSecondary, whiteSpace: "nowrap", fontSize: 12 }}>
                          {m.approved_at || m.approvedAt
                            ? new Date(m.approved_at || m.approvedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : <span style={{ color: textMuted }}>—</span>}
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          {m.status === "pending" ? (
                            <div style={{ display: "flex", gap: 6 }}>
                              <button
                                disabled={ptmActioningId === m.id}
                                onClick={() => handlePtmDecision(m.id, "approve")}
                                style={btnGreen.base}
                                onMouseEnter={e => Object.assign(e.currentTarget.style, btnGreen.enter)}
                                onMouseLeave={e => Object.assign(e.currentTarget.style, btnGreen.leave)}
                              >{ptmActioningId === m.id ? "…" : "Approve"}</button>
                              <button
                                disabled={ptmActioningId === m.id}
                                onClick={() => handlePtmDecision(m.id, "deny")}
                                style={btnRed.base}
                                onMouseEnter={e => Object.assign(e.currentTarget.style, btnRed.enter)}
                                onMouseLeave={e => Object.assign(e.currentTarget.style, btnRed.leave)}
                              >{ptmActioningId === m.id ? "…" : "Deny"}</button>
                            </div>
                          ) : (
                            <span style={{ color: textMuted, fontSize: 12 }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

         {/* ══ MONUMENT SETTING TAB ══ */}
                {/* ══ MONUMENT SETTING TAB ══ */}
                {tab === "monumentSetting" && (
          monumentLoading ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: textMuted, fontSize: 13 }}>Loading monument setting requests…</div>
          ) : (
            <MonumentSettingTab
              requests={monumentRequests}
              partners={partners}
              token={token}
              onRequestUpdated={(updated) =>
                setMonumentRequests(prev => prev.map(r => r.id === updated.id ? updated : r))
              }
            />
          )
        )}
      </main>

      

      {/* Modals */}
      
      {selectedRequest && <RequestDetailModal request={selectedRequest} token={token} onClose={() => setSelectedRequest(null)} onStatusChange={handleStatusChange} onPriceChange={handlePriceChange} />}
      {settingsPartner && <PartnerSettingsModal partner={settingsPartner} token={token} onClose={() => setSettingsPartner(null)} />}
      {editPartner && <EditPartnerModal partner={editPartner} token={token} onClose={() => setEditPartner(null)} onSaved={fetchPartners} />}
      {deletePartner && <ConfirmDeleteModal partner={deletePartner} loading={!!deletingId} onClose={() => setDeletePartner(null)} onConfirm={handleDeletePartner} />}
      {uploadRequest && (
        <UploadDocumentsModal
          request={uploadRequest}
          token={token}
          onClose={() => {
            setUploadRequest(null);
            if (selectedRequest && selectedRequest.id === uploadRequest.id) {
              axios.get(`${BASE_URL}/admin/requests/${uploadRequest.id}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(({ data }) => setSelectedRequest(data.request)).catch(() => {});
            }
          }}
        />
        
      )}
    </div>
  );
}