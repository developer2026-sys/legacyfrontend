  import { useState, useEffect, useCallback } from "react";
  import axios from "axios";
  import { BASE_URL } from "../baseurl";
  import { useToast } from "../components/useToast";
  import React from "react";
  import { useNavigate } from "react-router-dom";
  import TeammemberButton from "../components/teamemberbutton";
  import PartnerSettingsModal from "../components/PartnerSettingsModal";
  import { MonumentSettingTab } from "./MonumentSettingAdminTab";
  import PricingAdminTab from "./PricingAdminTab";
  import {
    REQUEST_STATUSES,
    REQUEST_STATUS_COLORS,
    REQUEST_STATUS_TRANSITIONS,
    getRequestStatusLabel,
  } from "../utils/requestStatus";

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
        <img src="https://res.cloudinary.com/dbjwbveqn/image/upload/v1789646047/cleanerlogo_fvdkle.jpg" alt="Lasting Legacy Cleaners" style={{ height: size, width: "auto", display: "block" }} />
      </div>
    );
  }

  const STATUS_STYLES = {
    ...Object.fromEntries(REQUEST_STATUSES.map(status => [
      status,
      { ...REQUEST_STATUS_COLORS[status], label: getRequestStatusLabel(status) },
    ])),
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
    const s = STATUS_STYLES[status] || { bg: "rgba(0,0,0,0.04)", color: textMuted, border: border, label: getRequestStatusLabel(status) };
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

  function Th({ children }) {
    return (
      <th style={{ padding: "11px 16px", textAlign: "left", color: textMuted, fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, whiteSpace: "nowrap", backgroundColor: "#F8FAFC" }}>
        {children}
      </th>
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

  function DeactivatePartnerModal({ partner, reason, setReason, onConfirm, onClose, loading }) {
    return (
      <Modal title="Deactivate Partner" subtitle="Their session will be invalidated immediately." onClose={onClose}>
        <p style={{ color: textSecondary, fontSize: 13.5, lineHeight: 1.6, marginBottom: 16 }}>
          You are about to deactivate <strong style={{ color: textPrimary }}>{partner.username}</strong>
          {partner.email ? ` (${partner.email})` : ""}. They will be logged out and unable to log back in.
          Their existing requests will remain visible in history.
        </p>
        <Field label="Reason (required)">
          <textarea
            autoFocus
            required
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Why is this user being deactivated?"
            style={{ ...inputStyle, height: "auto", padding: 10, resize: "vertical" }}
          />
        </Field>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12 }}>
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <ActionBtn onClick={onConfirm} disabled={loading || !reason.trim()} color="#DC2626" hoverColor="#b91c1c" textColor="#fff">
            {loading ? "Deactivating…" : "Deactivate Partner"}
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
  function RequestDetailModal({ request, token, onClose, onStatusChange }) {
    const { success: ok, error: err } = useToast();
    const [updating, setUpdating] = useState(false);
    const [status, setStatus] = useState(request.status);
    const [decisionReason, setDecisionReason] = useState("");
    const [statusHistory, setStatusHistory] = useState(request.statusHistory || []);
    const [documents, setDocuments] = useState([]);
    const [docsLoading, setDocsLoading] = useState(true);
    const schedule = request.workOrder?.schedules?.[0] || {};
    const [scheduledDate, setScheduledDate] = useState(schedule.scheduledDate || "");
    const [technicianName, setTechnicianName] = useState(request.workOrder?.assignedTechnicianName || "");
    const [internalNotes, setInternalNotes] = useState(request.workOrder?.internalNotes || "");
    const [serviceNotes, setServiceNotes] = useState(request.workOrder?.serviceNotes || "");
    const [completionDetails, setCompletionDetails] = useState(request.workOrder?.completionDetails || "");
    const [completionChecklist, setCompletionChecklist] = useState({
      serviceCompleted: Boolean(request.workOrder?.completionChecklist?.serviceCompleted),
      areaRestored: Boolean(request.workOrder?.completionChecklist?.areaRestored),
      finalInspection: Boolean(request.workOrder?.completionChecklist?.finalInspection),
    });
    const [beforePhoto, setBeforePhoto] = useState(null);
    const [afterPhoto, setAfterPhoto] = useState(null);
    const [operationSaving, setOperationSaving] = useState(false);

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
        const { data } = await axios.patch(
          `${BASE_URL}/admin/requests/${request.id}/status`,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const updatedRequest = { ...request, ...data.request };
        setStatus(updatedRequest.status);
        setStatusHistory(prev => [...prev, ...(data.request.statusHistory || [])]);
        ok("Status updated", `Request #${request.id} is now ${getRequestStatusLabel(newStatus)}.`);
        onStatusChange(updatedRequest);
      } catch (e) {
        err("Update failed", e?.response?.data?.message || "Could not update status.");
      } finally { setUpdating(false); }
    };

    const performReviewAction = async (action) => {
      const requiresReason = action === "deny" || action === "request-information";
      if (requiresReason && !decisionReason.trim()) {
        err("Reason required", action === "deny" ? "Add a reason before denying this request." : "Add a note describing the information needed.");
        return;
      }
      const endpoints = {
        approve: "approve",
        deny: "deny",
        "request-information": "request-information",
      };
      try {
        setUpdating(true);
        const { data } = await axios.patch(
          `${BASE_URL}/admin/requests/${request.id}/${endpoints[action]}`,
          requiresReason ? { reason: decisionReason.trim() } : {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const updatedRequest = { ...request, ...data.request };
        const nextHistory = [...statusHistory, ...(data.request.statusHistory || [])];
        updatedRequest.statusHistory = nextHistory;
        setStatus(updatedRequest.status);
        setStatusHistory(nextHistory);
        setDecisionReason("");
        onStatusChange(updatedRequest);
        ok("Request updated", `Request #${request.id} is now ${getRequestStatusLabel(updatedRequest.status)}.`);
      } catch (e) {
        err("Update failed", e?.response?.data?.message || "Could not update this request.");
      } finally { setUpdating(false); }
    };

    const updateOperations = async (operation) => {
      try {
        setOperationSaving(true);
        const formData = new FormData();
        formData.append("operation", operation);
        if (scheduledDate) formData.append("scheduledDate", scheduledDate);
        if (technicianName) formData.append("technicianName", technicianName);

        if (internalNotes) formData.append("internalNotes", internalNotes);
        if (serviceNotes) formData.append("serviceNotes", serviceNotes);
        if (completionDetails) formData.append("completionDetails", completionDetails);
        formData.append("completionChecklist", JSON.stringify(completionChecklist));
        if (beforePhoto) formData.append("beforePhoto", beforePhoto);
        if (afterPhoto) formData.append("afterPhoto", afterPhoto);
        const { data } = await axios.patch(
          `${BASE_URL}/admin/requests/${request.id}/operations`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const updatedRequest = data.request;
        setStatus(updatedRequest.status);
        setStatusHistory(updatedRequest.statusHistory || []);
        onStatusChange(updatedRequest);
        ok("Operations updated", operation === "complete" ? "The request is now complete." : "The request lifecycle was updated.");
      } catch (e) {
        err("Could not update operations", e?.response?.data?.message || "Save the required scheduling or completion details and try again.");
      } finally {
        setOperationSaving(false);
      }
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
        title={`Request ${request.requestNumber || `#${request.id}`}`}
        subtitle={`Submitted ${new Date(request.submittedAt || request.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
        onClose={onClose}
      >
      <DetailRow label="Status" value={<StatusBadge status={status} />} />
        <DetailRow label="Request ID" value={request.requestNumber || `#${request.id}`} />
        <DetailRow label="Submitted At" value={request.submittedAt ? new Date(request.submittedAt).toLocaleString() : "—"} />
        <DetailRow label="Family / Contact" value={request.customerName} />
        <DetailRow label="Phone" value={request.customerPhone} />
        <DetailRow label="Email" value={request.customerEmail} />
        <DetailRow label="Name on Memorial" value={request.nameOnMemorial} />
        <DetailRow label="Memorial Size" value={request.memorialSize} />
        <DetailRow label="Memorial Type / Material" value={request.memorialType} />
        <DetailRow label="Memorial Location / Park" value={request.memorialLocation} />
        <DetailRow label="Section / Garden" value={request.section} />
        <DetailRow label="Lot Number" value={request.lot} />
        <DetailRow label="Space Number" value={request.space} />
        <DetailRow label="Vase Information" value={request.vaseInfo} />
        <DetailRow label="Package" value={request.packageNameSnapshot || request.package?.name || request.packageType} />
        <DetailRow label="Client / Property ID" value={`${request.clientAccountId ?? "—"} / ${request.locationId ?? "—"}`} />
        <DetailRow label="Package ID" value={request.packageId ?? "—"} />
        <DetailRow label="Restoration Price" value={`$${Number(request.restorationPrice ?? request.packagePrice ?? 0).toFixed(2)}`} />
        <DetailRow label="Revenue Share" value={`$${Number(request.revenueShare || 0).toFixed(2)}`} />
        <DetailRow label="Invoice Amount" value={`$${Number(request.invoiceAmount ?? request.packagePrice ?? 0).toFixed(2)}`} />
        <DetailRow label="Pricing Effective Date" value={request.pricingEffectiveDate} />
        <DetailRow label="Invoice Status" value={request.invoice?.paymentStatus || "Not generated"} />
        <DetailRow label="Invoice Number" value={request.invoice?.invoiceNumber} />
        <DetailRow label="Payment Confirmed" value={request.invoice?.paidDate ? `${request.invoice.paidDate} ${request.invoice.paidTime || ""}` : "Pending"} />
        <DetailRow label="Submitting User ID" value={request.submittedByUserId ? `#${request.submittedByUserId}` : "—"} />
        <DetailRow label="Approved By" value={request.approvedBy} />
        <DetailRow label="Approved At" value={request.approvedAt ? new Date(request.approvedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null} />
        <DetailRow label="Denied By" value={request.deniedBy} />
        <DetailRow label="Denied At" value={request.deniedAt ? new Date(request.deniedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null} />
        <DetailRow label="Family Notes / Special Concerns" value={request.notes} />

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

        {["PAID", "PENDING_SCHEDULING", "SCHEDULED", "IN_PROGRESS", "COMPLETED"].includes(status) && (
          <div style={{ marginTop: 22, padding: 16, borderRadius: 10, border: `1px solid ${borderPrimary}`, backgroundColor: "rgba(22,105,169,0.035)" }}>
            <div style={{ color: textPrimary, fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Scheduling & completion</div>
            <div style={{ color: textMuted, fontSize: 12, marginBottom: 14 }}>
              This updates the work order linked to this Memorial Request.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
              <Field label="Service date">
                <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Technician / provider">
                <input value={technicianName} onChange={e => setTechnicianName(e.target.value)} placeholder="Assigned provider" style={inputStyle} />
              </Field>
            </div>
            <Field label="Internal scheduling notes">
              <textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} rows={2} style={{ ...inputStyle, height: "auto", padding: 10, resize: "vertical" }} />
            </Field>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              {["PAID", "PENDING_SCHEDULING", "SCHEDULED"].includes(status) && (
                <ActionBtn onClick={() => updateOperations("schedule")} disabled={operationSaving} color={primary} hoverColor={primaryHover}>
                  {operationSaving ? "Saving…" : "Save & schedule"}
                </ActionBtn>
              )}
              {status === "SCHEDULED" && (
                <ActionBtn onClick={() => updateOperations("start")} disabled={operationSaving} color="#D97706" hoverColor="#B45309">
                  Start service
                </ActionBtn>
              )}
            </div>

            {["IN_PROGRESS", "COMPLETED"].includes(status) && (
              <div style={{ borderTop: `1px solid ${border}`, paddingTop: 14 }}>
                <div style={{ color: textPrimary, fontSize: 12.5, fontWeight: 700, marginBottom: 10 }}>Completion evidence</div>
                <Field label="Technician / provider">
                  <input value={technicianName} onChange={e => setTechnicianName(e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Service notes">
                  <textarea value={serviceNotes} onChange={e => setServiceNotes(e.target.value)} rows={3} style={{ ...inputStyle, height: "auto", padding: 10, resize: "vertical" }} />
                </Field>
                <Field label="Completion details">
                  <textarea value={completionDetails} onChange={e => setCompletionDetails(e.target.value)} rows={2} placeholder="Describe the completed service and final condition." style={{ ...inputStyle, height: "auto", padding: 10, resize: "vertical" }} />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 8, marginBottom: 12 }}>
                  {[
                    ["serviceCompleted", "Service completed"],
                    ["areaRestored", "Area restored / clean"],
                    ["finalInspection", "Final inspection complete"],
                  ].map(([key, label]) => (
                    <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, color: textSecondary, fontSize: 12 }}>
                      <input
                        type="checkbox"
                        checked={completionChecklist[key]}
                        onChange={e => setCompletionChecklist(prev => ({ ...prev, [key]: e.target.checked }))}
                        style={{ accentColor: primary }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Field label={`Before photo${request.photos?.some(p => p.attachmentType === "before_photo") ? " (uploaded)" : " *"}`}>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setBeforePhoto(e.target.files?.[0] || null)} style={{ ...inputStyle, padding: "8px 10px" }} />
                  </Field>
                  <Field label={`After photo${request.photos?.some(p => p.attachmentType === "after_photo") ? " (uploaded)" : " *"}`}>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setAfterPhoto(e.target.files?.[0] || null)} style={{ ...inputStyle, padding: "8px 10px" }} />
                  </Field>
                </div>
                {status === "IN_PROGRESS" && (
                  <ActionBtn onClick={() => updateOperations("complete")} disabled={operationSaving} color="#059669" hoverColor="#047857">
                    {operationSaving ? "Completing…" : "Mark completed"}
                  </ActionBtn>
                )}
              </div>
            )}
          </div>
        )}

        {["SUBMITTED", "UNDER_REVIEW", "NEEDS_INFORMATION"].includes(status) ? (
          <div style={{ marginTop: 20, padding: 16, borderRadius: 10, border: `1px solid ${border}`, backgroundColor: "#FAFBFC" }}>
            <div style={{ color: textPrimary, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Review decision</div>
            <label style={{ display: "block", color: textMuted, fontSize: 11.5, marginBottom: 6 }}>
              Decision note (required for Deny and Request More Information)
            </label>
            <textarea
              value={decisionReason}
              onChange={e => setDecisionReason(e.target.value)}
              rows={3}
              placeholder="Add a reason or explain what information is needed…"
              style={{ ...inputStyle, height: "auto", padding: 10, resize: "vertical", marginBottom: 12 }}
            />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <ActionBtn onClick={() => performReviewAction("approve")} disabled={updating} color="#059669" hoverColor="#047857">
                {updating ? "Saving…" : "Approve"}
              </ActionBtn>
              <ActionBtn onClick={() => performReviewAction("deny")} disabled={updating} color="#DC2626" hoverColor="#B91C1C">
                Deny
              </ActionBtn>
              <ActionBtn onClick={() => performReviewAction("request-information")} disabled={updating} color="#D97706" hoverColor="#B45309">
                Request More Information
              </ActionBtn>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 20 }}>
            <div style={{ color: textMuted, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Update Status</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(REQUEST_STATUS_TRANSITIONS[status] || []).map(s => (
                <ActionBtn
                  key={s}
                  disabled={updating || status === s}
                  onClick={() => updateStatus(s)}
                  color={status === s ? "rgba(22,105,169,0.12)" : surfaceMid}
                  hoverColor="rgba(22,105,169,0.1)"
                  textColor={status === s ? primary : textMuted}
                  style={{ border: `1px solid ${status === s ? borderPrimary : border}`, fontSize: 12 }}
                >
                  {getRequestStatusLabel(s)}
                </ActionBtn>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 22 }}>
          <div style={{ color: textMuted, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Status History</div>
          {statusHistory.length === 0 ? (
            <div style={{ color: textMuted, fontSize: 12.5 }}>No status changes recorded yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...statusHistory].sort((a, b) =>
                (new Date(a.createdAt || a.created_at) - new Date(b.createdAt || b.created_at))
                  || Number(a.id || 0) - Number(b.id || 0)
              ).map((event, index) => (
                <div key={event.id || `${event.toStatus}-${index}`} style={{ borderLeft: `3px solid ${primary}`, padding: "4px 0 6px 12px" }}>
                  <div style={{ color: textPrimary, fontSize: 12.5, fontWeight: 600 }}>
                    {getRequestStatusLabel(event.fromStatus || "SUBMITTED")} → {getRequestStatusLabel(event.toStatus)}
                  </div>
                  <div style={{ color: textMuted, fontSize: 11.5, marginTop: 3 }}>
                    {event.changedByRole || "Unknown"}{event.changedByUserId ? ` · User #${event.changedByUserId}` : ""} · {new Date(event.createdAt || event.created_at).toLocaleString()}
                  </div>
                  {event.reason && <div style={{ color: textSecondary, fontSize: 12, marginTop: 4 }}>{event.reason}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
          <GhostBtn onClick={onClose}>Close</GhostBtn>
        </div>
      </Modal>
    );
  }

  // ─── Stat Card ────────────────────────────────────────────────────────────────
  // ─── Stat Card ────────────────────────────────────────────────────────────────
  function StatCard({ label, value, sublabel, icon, onClick }) {
    const [hov, setHov] = useState(false);
    const clickable = typeof onClick === "function";
    return (
      <div
        onClick={onClick}
        onMouseEnter={() => clickable && setHov(true)}
        onMouseLeave={() => clickable && setHov(false)}
        style={{
          backgroundColor: surface,
          border: `1px solid ${clickable && hov ? borderPrimary : border}`,
          borderRadius: 14, padding: "20px 22px",
          display: "flex", alignItems: "flex-start", gap: 16,
          boxShadow: clickable && hov ? "0 4px 14px rgba(22,105,169,0.12)" : "0 1px 4px rgba(0,0,0,0.05)",
          cursor: clickable ? "pointer" : "default",
          transform: clickable && hov ? "translateY(-1px)" : "none",
          transition: "all .15s",
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
          backgroundColor: primary, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
        }}>{icon}</div>
        <div>
          <div style={{ color: textPrimary, fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
          <div style={{ color: clickable ? primary : textPrimary, fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>{label}</div>
          {sublabel && <div style={{ color: textMuted, fontSize: 11.5, marginTop: 2 }}>{sublabel}</div>}
        </div>
      </div>
    );
  }


  // ─── Main Admin Dashboard ─────────────────────────────────────────────────────
  export default function AdminDashboard({ token, adminName, onLogout }) {
    const { success: ok, error: err } = useToast();
    const navigate = useNavigate();
    const [tab, setTab] = useState("approvalQueue");

    const displayName = adminName || (() => {
      try { return JSON.parse(localStorage.getItem("admin"))?.email || "Admin"; }
      catch { return "Admin"; }
    })();

    const [requests, setRequests] = useState([]);
    const [emailToggleId, setEmailToggleId] = useState(null);
    const [reqLoading, setReqLoading] = useState(true);
    const [paymentInvoices, setPaymentInvoices] = useState([]);
    const [paymentQueueLoading, setPaymentQueueLoading] = useState(true);
    const [paymentConfirmingId, setPaymentConfirmingId] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchQ, setSearchQ] = useState("");
    const [queueFilters, setQueueFilters] = useState({
      clientId: "all",
      locationId: "all",
      advisorId: "all",
      userId: "all",
      invoiceStatus: "all",
      paymentStatus: "all",
      serviceType: "all",
      fromDate: "",
      toDate: "",
    });
    const [queueReasonAction, setQueueReasonAction] = useState(null);
    const [queueReason, setQueueReason] = useState("");
    const [queueActioningId, setQueueActioningId] = useState(null);
    const [partners, setPartners] = useState([]);
    const [partLoading, setPartLoading] = useState(true);
    const [editPartner, setEditPartner] = useState(null);
    const [deletePartner, setDeletePartner] = useState(null);
  const [settingsPartner, setSettingsPartner] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [deactivatePartner, setDeactivatePartner] = useState(null);
    const [deactivatingId, setDeactivatingId] = useState(null);
    const [deactivateReason, setDeactivateReason] = useState("");
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
    }, [token, err]);

    const fetchPaymentConfirmationQueue = useCallback(async () => {
      try {
        setPaymentQueueLoading(true);
        const { data } = await axios.get(
          `${BASE_URL}/admin/invoices/payment-confirmation-queue`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPaymentInvoices(data.invoices || []);
      } catch { err("Error", "Failed to load payment confirmation queue."); }
      finally { setPaymentQueueLoading(false); }
    }, [token, err]);

    const fetchPartners = useCallback(async () => {
      try {
        setPartLoading(true);
        const { data } = await axios.get(`${BASE_URL}/admin/partners`, { headers: { Authorization: `Bearer ${token}` } });
        setPartners(data.partners || []);
      } catch { err("Error", "Failed to load partners."); }
      finally { setPartLoading(false); }
    }, [token, err]);

    const fetchPartnerTeamMembers = useCallback(async () => {
      try {
        setPtmLoading(true);
        const { data } = await axios.get(`${BASE_URL}/admin/partner-team-members`, { headers: { Authorization: `Bearer ${token}` } });
        setPartnerTeamMembers(data.partnerTeamMembers || []);
      } catch { err("Error", "Failed to load partner team members."); }
      finally { setPtmLoading(false); }
    }, [token, err]);

    const fetchMonumentRequests = useCallback(async () => {
      try {
        setMonumentLoading(true);
        const { data } = await axios.get(`${BASE_URL}/admin/monument-setting`, { headers: { Authorization: `Bearer ${token}` } });
        setMonumentRequests(data.requests || []);
      } catch { err("Error", "Failed to load monument setting requests."); }
      finally { setMonumentLoading(false); }
    }, [token, err]);


    useEffect(() => {
      const timer = window.setTimeout(() => {
        void fetchRequests();
        void fetchPaymentConfirmationQueue();
        void fetchPartners();
        void fetchPartnerTeamMembers();
        void fetchMonumentRequests();
      }, 0);
      return () => window.clearTimeout(timer);
    }, [
      fetchRequests,
      fetchPaymentConfirmationQueue,
      fetchPartners,
      fetchPartnerTeamMembers,
      fetchMonumentRequests,
    ]);

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


    const handleDeactivatePartner = async (partner, reason) => {
      try {
        setDeactivatingId(partner.id);
        await axios.patch(
          `${BASE_URL}/admin/partners/${partner.id}/status`,
          { status: "inactive", reason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        ok("Partner deactivated", `${partner.username} has been deactivated.`);
        setDeactivatePartner(null);
        fetchPartners();
      } catch (e) {
        err("Deactivate failed", e?.response?.data?.message || "Could not deactivate this partner.");
      } finally { setDeactivatingId(null); }
    };

    useEffect(() => {
      if (partnerTeamMembers.length > 0) {
        console.log("PTM sample row:", partnerTeamMembers[0]);
      }
    }, [partnerTeamMembers]);

    const handleReactivatePartner = async (partner) => {
      try {
        setDeactivatingId(partner.id);
        await axios.patch(
          `${BASE_URL}/admin/partners/${partner.id}/status`,
          { status: "active", reason: "Reactivated by Super Admin." },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        ok("Partner reactivated", `${partner.username} can now log in again.`);
        fetchPartners();
      } catch (e) {
        err("Reactivate failed", e?.response?.data?.message || "Could not reactivate this partner.");
      } finally { setDeactivatingId(null); }
    };

    const handleStatusChange = (updatedRequest) => {
      const mergeHistory = (existing = [], incoming = []) => {
        const merged = [...existing, ...incoming];
        return merged.filter((event, index) =>
          !event.id || merged.findIndex(candidate => candidate.id === event.id) === index
        );
      };
      setRequests(prev => prev.map(r => r.id === updatedRequest.id
        ? { ...r, ...updatedRequest, statusHistory: mergeHistory(r.statusHistory, updatedRequest.statusHistory) }
        : r
      ));
      setSelectedRequest(prev => prev?.id === updatedRequest.id
        ? { ...prev, ...updatedRequest, statusHistory: mergeHistory(prev.statusHistory, updatedRequest.statusHistory) }
        : prev
      );
    };

    const handleOpenRequest = async (request) => {
      try {
        if (request.status === "SUBMITTED") {
          await axios.patch(`${BASE_URL}/admin/requests/${request.id}/review`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        const { data } = await axios.get(`${BASE_URL}/admin/requests/${request.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        handleStatusChange(data.request);
        setSelectedRequest(data.request);
      } catch (e) {
        err("Could not open request", e?.response?.data?.message || "The request could not be opened for review.");
      }
    };

    const handleQueueAction = async (request, action, reason = "") => {
      const endpoint = {
        approve: "approve",
        deny: "deny",
        "request-information": "request-information",
      }[action];
      try {
        setQueueActioningId(request.id);
        const { data } = await axios.patch(
          `${BASE_URL}/admin/requests/${request.id}/${endpoint}`,
          reason ? { reason } : {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        handleStatusChange(data.request);
        setQueueReasonAction(null);
        setQueueReason("");
        ok("Request updated", `Request #${request.id} is now ${getRequestStatusLabel(data.request.status)}.`);
      } catch (e) {
        err("Update failed", e?.response?.data?.message || "Could not update this request.");
      } finally {
        setQueueActioningId(null);
      }
    };

    const handleConfirmInvoicePayment = async (invoice) => {
      const request = invoice.memorialRequest;
      const label = request?.requestNumber || `#${request?.id ?? invoice.requestId}`;
      if (!window.confirm(`Confirm that payment for ${label} has been received?`)) return;
      try {
        setPaymentConfirmingId(invoice.id);
        const { data } = await axios.patch(
          `${BASE_URL}/admin/invoices/${invoice.id}/confirm-payment`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPaymentInvoices((previous) => previous.filter((item) => item.id !== invoice.id));
        setRequests((previous) => previous.map((item) => (
          item.id === data.request.id
            ? { ...item, ...data.request, invoice: data.invoice }
            : item
        )));
        await fetchRequests();
        ok("Payment confirmed", `${label} is now pending scheduling.`);
      } catch (e) {
        err("Confirmation failed", e?.response?.data?.message || "Could not confirm this payment.");
      } finally {
        setPaymentConfirmingId(null);
      }
    };


    const handleApprovePartner = async (partner) => {
      try {
        await axios.patch(
          `${BASE_URL}/admin/partners/${partner.id}/approve`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        ok("Approved", `${partner.username} is now active.`);
        fetchPartners();
      } catch (e) { 
        err("Failed", e?.response?.data?.message || "Could not approve this user.");
      }
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

    const goToRequestsFiltered = (nextFilterStatus) => {
      setTab("requests");
      setFilterStatus(nextFilterStatus || "all");
      setSearchQ("");
    };

    const filteredRequests = requests.filter(r => {


      const matchStatus = filterStatus === "all" || r.status === filterStatus;
      const q = searchQ.toLowerCase();
      const matchSearch = !q ||
        r.customerName?.toLowerCase().includes(q) ||
        r.memorialLocation?.toLowerCase().includes(q) ||
        r.customerEmail?.toLowerCase().includes(q) ||
        String(r.requestNumber || r.id).toLowerCase().includes(q);
      const submitted = new Date(r.submittedAt || r.createdAt);
      const date = Number.isNaN(submitted.getTime()) ? "" : submitted.toISOString().slice(0, 10);
      return matchStatus
        && matchSearch
        && (queueFilters.clientId === "all" || String(r.clientAccountId) === queueFilters.clientId)
        && (queueFilters.locationId === "all" || String(r.locationId) === queueFilters.locationId)
        && (queueFilters.userId === "all" || String(r.submittedByUserId || r.partnerId) === queueFilters.userId)
        && (queueFilters.invoiceStatus === "all" || String(r.invoice?.status || "") === queueFilters.invoiceStatus)
        && (queueFilters.paymentStatus === "all" || String(r.invoice?.paymentStatus || "") === queueFilters.paymentStatus)
        && (queueFilters.serviceType === "all" || String(r.packageType || r.packageNameSnapshot || "").toLowerCase() === queueFilters.serviceType.toLowerCase())
        && (!queueFilters.fromDate || date >= queueFilters.fromDate)
        && (!queueFilters.toDate || date <= queueFilters.toDate);
    });

    const queueRequests = requests.filter(r => ["SUBMITTED", "UNDER_REVIEW"].includes(r.status));
    const distinctQueueOptions = (getId, getLabel) => {
      const options = new Map();
      queueRequests.forEach(request => {
        const id = getId(request);
        const label = getLabel(request);
        if (id != null && label) options.set(String(id), label);
      });
      return [...options.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    };
    const clientFilterOptions = distinctQueueOptions(
      r => r.clientAccountId,
      r => r.clientAccount?.name || (r.clientAccountId ? `Client #${r.clientAccountId}` : "")
    );
    const propertyFilterOptions = distinctQueueOptions(
      r => r.locationId,
      r => r.location?.name || r.memorialLocation
    );
    const advisorFilterOptions = distinctQueueOptions(
      r => r.partner?.accountRole === "family_advisor" ? r.partnerId : null,
      r => r.partner?.accountRole === "family_advisor" ? (r.partner?.username || r.partner?.email || `Advisor #${r.partnerId}`) : ""
    );
    const requestFilterOptions = (getId, getLabel) => {
      const options = new Map();
      requests.forEach(request => {
        const id = getId(request);
        const label = getLabel(request);
        if (id != null && label) options.set(String(id), label);
      });
      return [...options.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    };
    const requestClientOptions = requestFilterOptions(
      r => r.clientAccountId,
      r => r.clientAccount?.name || (r.clientAccountId ? `Client #${r.clientAccountId}` : ""),
    );
    const requestPropertyOptions = requestFilterOptions(
      r => r.locationId,
      r => r.location?.name || r.memorialLocation,
    );
    const requestUserOptions = requestFilterOptions(
      r => r.submittedByUserId || r.partnerId,
      r => r.partner?.username || r.partner?.email || `User #${r.submittedByUserId || r.partnerId}`,
    );
    const requestServiceOptions = [...new Set(requests.map(r => r.packageType || r.packageNameSnapshot).filter(Boolean))].sort();
    const filteredQueueRequests = queueRequests.filter(request => {
      const submitted = new Date(request.submittedAt || request.createdAt);
      const date = Number.isNaN(submitted.getTime()) ? "" : submitted.toISOString().slice(0, 10);
      return (queueFilters.clientId === "all" || String(request.clientAccountId) === queueFilters.clientId)
        && (queueFilters.locationId === "all" || String(request.locationId) === queueFilters.locationId)
        && (queueFilters.advisorId === "all" || String(request.partnerId) === queueFilters.advisorId)
        && (!queueFilters.fromDate || date >= queueFilters.fromDate)
        && (!queueFilters.toDate || date <= queueFilters.toDate);
    });

    const now = new Date();
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
    const stats = {
      total: requests.length,
      pending: requests.filter(r => ["SUBMITTED", "UNDER_REVIEW", "NEEDS_INFORMATION"].includes(r.status)).length,
      approved: requests.filter(r => ["APPROVED", "INVOICE_PENDING"].includes(r.status)).length,
      completed: requests.filter(r => r.status === "COMPLETED").length,
      partners: partners.length,
      revenue: requests.filter(r => !["DRAFT", "SUBMITTED", "UNDER_REVIEW", "NEEDS_INFORMATION", "REJECTED", "CANCELLED"].includes(r.status)).reduce((s, r) => s + Number(r.invoiceAmount ?? r.packagePrice ?? 0), 0),
  
      // ── Newly added metrics (11.1) ──
      totalClients: new Set(requests.map(r => r.clientAccountId).filter(Boolean)).size,
      activeUsers: partners.filter(p => p.status === "active").length,
      newRequestsThisWeek: requests.filter(r => new Date(r.submittedAt || r.createdAt) >= startOfWeek).length,
      awaitingApproval: requests.filter(r => ["SUBMITTED", "UNDER_REVIEW"].includes(r.status)).length,
      invoicesAwaitingPayment: paymentInvoices.length,
      pendingScheduling: requests.filter(r => r.status === "PENDING_SCHEDULING").length,
      scheduled: requests.filter(r => r.status === "SCHEDULED").length,
      inProgress: requests.filter(r => r.status === "IN_PROGRESS").length,
      completedThisMonth: requests.filter(r =>
        r.status === "COMPLETED" &&
        r.completedAt &&
        new Date(r.completedAt) >= startOfMonth
      ).length,
      userApprovalQueue: partners.filter(p => p.status === "pending_approval").length + partnerTeamMembers.filter(m => m.status === "pending").length,
    };

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
          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 28 }}>
          <StatCard label="Total Clients"              value={stats.totalClients} sublabel="Distinct client accounts" icon="🏢" onClick={() => goToRequestsFiltered("all")} />
          <StatCard label="Active Users"                value={stats.activeUsers} sublabel="Partners currently active" icon="👤" onClick={() => setTab("partners")} />
          <StatCard label="Pending Approvals"           value={stats.userApprovalQueue} sublabel="Users + team members awaiting approval" icon="🕓" onClick={() => setTab("partnerTeamMembers")} />
          <StatCard label="New Requests"                value={stats.newRequestsThisWeek} sublabel="Submitted in the last 7 days" icon="🆕" onClick={() => goToRequestsFiltered("all")} />
          <StatCard label="Awaiting Approval"           value={stats.awaitingApproval} sublabel="Submitted or under review" icon="⏳" onClick={() => setTab("approvalQueue")} />
          <StatCard label="Invoices Awaiting Payment"   value={stats.invoicesAwaitingPayment} sublabel="Pending payment confirmation" icon="🧾" onClick={() => setTab("paymentConfirmationQueue")} />
          <StatCard label="Pending Scheduling"          value={stats.pendingScheduling} sublabel="Paid, not yet scheduled" icon="🗓️" onClick={() => goToRequestsFiltered("PENDING_SCHEDULING")} />
          <StatCard label="Scheduled"                   value={stats.scheduled} sublabel="Service date set" icon="📅" onClick={() => goToRequestsFiltered("SCHEDULED")} />
          <StatCard label="In Progress"                 value={stats.inProgress} sublabel="Service underway" icon="🔧" onClick={() => goToRequestsFiltered("IN_PROGRESS")} />
          <StatCard label="Completed This Month"        value={stats.completedThisMonth} sublabel="Finished this calendar month" icon="✅" onClick={() => goToRequestsFiltered("COMPLETED")} />
          <StatCard label="Total Completed"             value={stats.completed} sublabel="All-time completed" icon="✓" onClick={() => goToRequestsFiltered("COMPLETED")} />
          <StatCard label="Total Requests"              value={stats.total} sublabel="All requests in your inventory" icon="📋" onClick={() => goToRequestsFiltered("all")} />
          <StatCard label="Revenue"                     value={`$${stats.revenue.toLocaleString()}`} sublabel="Across all completed requests" icon="$" onClick={() => goToRequestsFiltered("all")} />
        </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
            <Tab label="Approval Queue" active={tab === "approvalQueue"} onClick={() => setTab("approvalQueue")} count={queueRequests.length} />
            <Tab label="Payment Confirmation Queue" active={tab === "paymentConfirmationQueue"} onClick={() => setTab("paymentConfirmationQueue")} count={paymentInvoices.length} />
            <Tab label="Requests" active={tab === "requests"} onClick={() => setTab("requests")} count={requests.length} />
            <Tab label="Pricing" active={tab === "pricing"} onClick={() => setTab("pricing")} />
            <Tab label="Partners" active={tab === "partners"} onClick={() => setTab("partners")} count={partners.length} />
            <Tab label="Partner Team Members" active={tab === "partnerTeamMembers"} onClick={() => setTab("partnerTeamMembers")} count={partnerTeamMembers.length} />
            <Tab label="Monument Setting" active={tab === "monumentSetting"} onClick={() => setTab("monumentSetting")} count={monumentRequests.length} />
          </div>

          {tab === "pricing" && <PricingAdminTab token={token} />}

          {tab === "approvalQueue" && (
            <div style={{ backgroundColor: surface, border: `1px solid ${border}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", borderTop: "3px solid #059669" }}>
              <div style={{ padding: "18px 20px", borderBottom: `1px solid ${border}` }}>
                <div style={{ color: textPrimary, fontSize: 16, fontWeight: 700 }}>Super Admin Approval Queue</div>
                <div style={{ color: textMuted, fontSize: 12.5, marginTop: 4 }}>Submitted requests across all client accounts, including items already under review.</div>
              </div>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${border}`, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", backgroundColor: "#FAFBFC" }}>
                <select aria-label="Filter by client" value={queueFilters.clientId} onChange={e => setQueueFilters(prev => ({ ...prev, clientId: e.target.value }))} style={{ ...selectStyle, width: 190, height: 36, fontSize: 12.5 }}>
                  <option value="all">All Clients</option>
                  {clientFilterOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
                <select aria-label="Filter by property" value={queueFilters.locationId} onChange={e => setQueueFilters(prev => ({ ...prev, locationId: e.target.value }))} style={{ ...selectStyle, width: 190, height: 36, fontSize: 12.5 }}>
                  <option value="all">All Properties</option>
                  {propertyFilterOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
                <select aria-label="Filter by advisor" value={queueFilters.advisorId} onChange={e => setQueueFilters(prev => ({ ...prev, advisorId: e.target.value }))} style={{ ...selectStyle, width: 190, height: 36, fontSize: 12.5 }}>
                  <option value="all">All Advisors</option>
                  {advisorFilterOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
                <label style={{ color: textMuted, fontSize: 11.5 }}>From <input aria-label="From date" type="date" value={queueFilters.fromDate} onChange={e => setQueueFilters(prev => ({ ...prev, fromDate: e.target.value }))} style={{ ...inputStyle, width: 145, height: 36, fontSize: 12 }} /></label>
                <label style={{ color: textMuted, fontSize: 11.5 }}>To <input aria-label="To date" type="date" value={queueFilters.toDate} onChange={e => setQueueFilters(prev => ({ ...prev, toDate: e.target.value }))} style={{ ...inputStyle, width: 145, height: 36, fontSize: 12 }} /></label>
                <span style={{ color: textMuted, fontSize: 12, marginLeft: "auto" }}>{filteredQueueRequests.length} request{filteredQueueRequests.length !== 1 ? "s" : ""}</span>
              </div>
              {reqLoading ? (
                <div style={{ padding: "48px 0", textAlign: "center", color: textMuted, fontSize: 13 }}>Loading approval queue…</div>
              ) : filteredQueueRequests.length === 0 ? (
                <div style={{ padding: "48px 0", textAlign: "center", color: textMuted, fontSize: 13 }}>No submitted requests match these filters.</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead><tr><Th>Request</Th><Th>Client</Th><Th>Property</Th><Th>Advisor</Th><Th>Customer</Th><Th>Submitted</Th><Th>Status</Th><Th>Actions</Th></tr></thead>
                    <tbody>
                      {filteredQueueRequests.map((request, index) => (
                        <tr key={request.id} style={{ borderTop: `1px solid ${border}`, backgroundColor: index % 2 === 0 ? surface : "#FAFBFC" }}>
                          <td style={{ padding: "13px 16px", color: textMuted, fontSize: 12 }}>{request.requestNumber || `#${request.id}`}</td>
                          <td style={{ padding: "13px 16px", color: textSecondary }}>{request.clientAccount?.name || (request.clientAccountId ? `Client #${request.clientAccountId}` : "—")}</td>
                          <td style={{ padding: "13px 16px", color: textSecondary }}>{request.location?.name || request.memorialLocation || "—"}</td>
                          <td style={{ padding: "13px 16px", color: textSecondary }}>
                            {request.partner?.accountRole === "family_advisor"
                              ? (request.partner.username || request.partner.email)
                              : request.partner?.username ? `Client Admin · ${request.partner.username}` : "—"}
                          </td>
                          <td style={{ padding: "13px 16px", color: textPrimary, fontWeight: 600 }}>{request.customerName || "—"}</td>
                          <td style={{ padding: "13px 16px", color: textSecondary, whiteSpace: "nowrap", fontSize: 12 }}>{new Date(request.submittedAt || request.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                          <td style={{ padding: "13px 16px" }}><StatusBadge status={request.status} /></td>
                          <td style={{ padding: "10px 12px" }}>
                            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                              <ActionBtn onClick={() => handleOpenRequest(request)} disabled={queueActioningId === request.id} color={primary} hoverColor={primaryHover}>View</ActionBtn>
                              <ActionBtn onClick={() => handleQueueAction(request, "approve")} disabled={queueActioningId === request.id} color="#059669" hoverColor="#047857">{queueActioningId === request.id ? "Saving…" : "Approve"}</ActionBtn>
                              <ActionBtn onClick={() => { setQueueReasonAction({ request, action: "deny" }); setQueueReason(""); }} disabled={queueActioningId === request.id} color="#DC2626" hoverColor="#B91C1C">Deny</ActionBtn>
                              <ActionBtn onClick={() => { setQueueReasonAction({ request, action: "request-information" }); setQueueReason(""); }} disabled={queueActioningId === request.id} color="#D97706" hoverColor="#B45309">Request More Information</ActionBtn>
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

          {tab === "paymentConfirmationQueue" && (
            <div style={{ backgroundColor: surface, border: `1px solid ${border}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", borderTop: "3px solid #059669" }}>
              <div style={{ padding: "18px 20px", borderBottom: `1px solid ${border}` }}>
                <div style={{ color: textPrimary, fontSize: 16, fontWeight: 700 }}>Super Admin Payment Confirmation Queue</div>
                <div style={{ color: textMuted, fontSize: 12.5, marginTop: 4 }}>Manually confirm received payments before requests move to scheduling.</div>
              </div>
              {paymentQueueLoading ? (
                <div style={{ padding: "48px 0", textAlign: "center", color: textMuted, fontSize: 13 }}>Loading payment confirmation queue…</div>
              ) : paymentInvoices.length === 0 ? (
                <div style={{ padding: "48px 0", textAlign: "center", color: textMuted, fontSize: 13 }}>No invoices are waiting for payment confirmation.</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr><Th>Invoice</Th><Th>Request</Th><Th>Client</Th><Th>Customer</Th><Th>Amount</Th><Th>Request Status</Th><Th>Action</Th></tr>
                    </thead>
                    <tbody>
                      {paymentInvoices.map((invoice, index) => {
                        const request = invoice.memorialRequest || {};
                        return (
                          <tr key={invoice.id} style={{ borderTop: `1px solid ${border}`, backgroundColor: index % 2 === 0 ? surface : "#FAFBFC" }}>
                            <td style={{ padding: "13px 16px", color: textMuted }}>INV-{invoice.id}</td>
                            <td style={{ padding: "13px 16px", color: textSecondary }}>{request.requestNumber || `#${request.id || invoice.requestId}`}</td>
                            <td style={{ padding: "13px 16px", color: textSecondary }}>{request.clientAccount?.name || (request.clientAccountId ? `Client #${request.clientAccountId}` : "—")}</td>
                            <td style={{ padding: "13px 16px", color: textPrimary, fontWeight: 600 }}>{request.customerName || "—"}</td>
                            <td style={{ padding: "13px 16px", color: textSecondary }}>${Number(invoice.amount ?? request.invoiceAmount ?? request.packagePrice ?? 0).toFixed(2)}</td>
                            <td style={{ padding: "13px 16px" }}><StatusBadge status={request.status} /></td>
                            <td style={{ padding: "10px 12px" }}>
                              <ActionBtn
                                onClick={() => handleConfirmInvoicePayment(invoice)}
                                disabled={paymentConfirmingId === invoice.id}
                                color="#059669"
                                hoverColor="#047857"
                              >
                                {paymentConfirmingId === invoice.id ? "Confirming…" : "Confirm Payment"}
                              </ActionBtn>
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
                  {REQUEST_STATUSES.filter(status => status !== "DRAFT").map(status => (
                    <option key={status} value={status}>{getRequestStatusLabel(status)}</option>
                  ))}
                </select>
                <select aria-label="Filter requests by client" value={queueFilters.clientId} onChange={e => setQueueFilters(prev => ({ ...prev, clientId: e.target.value }))} style={{ ...selectStyle, width: 160, height: 36, fontSize: 12.5 }}>
                  <option value="all">All Clients</option>
                  {requestClientOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
                <select aria-label="Filter requests by property" value={queueFilters.locationId} onChange={e => setQueueFilters(prev => ({ ...prev, locationId: e.target.value }))} style={{ ...selectStyle, width: 160, height: 36, fontSize: 12.5 }}>
                  <option value="all">All Properties</option>
                  {requestPropertyOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
                <select aria-label="Filter requests by user" value={queueFilters.userId} onChange={e => setQueueFilters(prev => ({ ...prev, userId: e.target.value }))} style={{ ...selectStyle, width: 160, height: 36, fontSize: 12.5 }}>
                  <option value="all">All Users</option>
                  {requestUserOptions.map(([id, label]) => <option key={id} value={label ? id : id}>{label}</option>)}
                </select>
                <select aria-label="Filter requests by invoice status" value={queueFilters.invoiceStatus} onChange={e => setQueueFilters(prev => ({ ...prev, invoiceStatus: e.target.value }))} style={{ ...selectStyle, width: 160, height: 36, fontSize: 12.5 }}>
                  <option value="all">All Invoice Statuses</option>
                  <option value="SENT">Sent to AP</option>
                </select>
                <select aria-label="Filter requests by payment status" value={queueFilters.paymentStatus} onChange={e => setQueueFilters(prev => ({ ...prev, paymentStatus: e.target.value }))} style={{ ...selectStyle, width: 160, height: 36, fontSize: 12.5 }}>
                  <option value="all">All Payment Statuses</option>
                  <option value="PENDING">Payment Pending</option>
                  <option value="PAID">Paid</option>
                </select>
                <select aria-label="Filter requests by service type" value={queueFilters.serviceType} onChange={e => setQueueFilters(prev => ({ ...prev, serviceType: e.target.value }))} style={{ ...selectStyle, width: 160, height: 36, fontSize: 12.5 }}>
                  <option value="all">All Service Types</option>
                  {requestServiceOptions.map(service => <option key={service} value={service}>{service}</option>)}
                </select>
                <label style={{ color: textMuted, fontSize: 11.5 }}>From <input aria-label="Request from date" type="date" value={queueFilters.fromDate} onChange={e => setQueueFilters(prev => ({ ...prev, fromDate: e.target.value }))} style={{ ...inputStyle, width: 130, height: 36, fontSize: 12 }} /></label>
                <label style={{ color: textMuted, fontSize: 11.5 }}>To <input aria-label="Request to date" type="date" value={queueFilters.toDate} onChange={e => setQueueFilters(prev => ({ ...prev, toDate: e.target.value }))} style={{ ...inputStyle, width: 130, height: 36, fontSize: 12 }} /></label>
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
                        <Th>Request ID</Th><Th>Customer</Th><Th>Email</Th><Th>Location</Th>
                        <Th>Package</Th><Th>Partner</Th><Th>Status</Th>
                        <Th>Approved By</Th><Th>Approved At</Th>
                        <Th>Denied By</Th><Th>Denied At</Th>
                        <Th>Submitted</Th><Th>Action</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((r, i) => (
                        <tr key={r.id} style={{ borderTop: `1px solid ${border}`, backgroundColor: i % 2 === 0 ? surface : "#FAFBFC" }}>
                          <td style={{ padding: "13px 16px", color: textMuted, fontSize: 12 }}>{r.requestNumber || `#${r.id}`}</td>
                          <td style={{ padding: "13px 16px", color: textPrimary, fontWeight: 600 }}>{r.customerName}</td>
                          <td style={{ padding: "13px 16px", color: textSecondary, fontSize: 12 }}>{r.customerEmail}</td>
                          <td style={{ padding: "13px 16px", color: textSecondary, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.memorialLocation}</td>
                          <td style={{ padding: "13px 16px", color: textPrimary, whiteSpace: "nowrap" }}>
                            {r.packageNameSnapshot || r.package?.name || r.packageType || "—"}
                            {" · Invoice "}
                            ${Number(r.invoiceAmount ?? r.packagePrice ?? 0).toFixed(2)}
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
                            {new Date(r.submittedAt || r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td style={{ padding: "13px 16px" }}>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              {["APPROVED", "INVOICE_PENDING"].includes(r.status) && (
                                <button
                                  onClick={() => setUploadRequest(r)}
                                  style={btnBlue.base}
                                  onMouseEnter={e => Object.assign(e.currentTarget.style, btnBlue.enter)}
                                  onMouseLeave={e => Object.assign(e.currentTarget.style, btnBlue.leave)}
                                >Upload</button>
                              )}
                              <button
                                onClick={() => handleOpenRequest(r)}
                                style={btnGold.base}
                                onMouseEnter={e => Object.assign(e.currentTarget.style, btnGold.enter)}
                                onMouseLeave={e => Object.assign(e.currentTarget.style, btnGold.leave)}
                              >View</button>
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
                      <tr><Th>ID</Th><Th>Username</Th><Th>Email</Th><Th>Role</Th><Th>Status</Th><Th>Client</Th><Th>Email Reminders</Th><Th>Requests</Th><Th>Created</Th><Th>Actions</Th></tr>
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
                              <span style={{
                                fontSize: 11, letterSpacing: "0.06em", padding: "3px 9px", borderRadius: 999,
                                backgroundColor: "rgba(2,132,199,0.08)",
                                color: "#0284C7",
                                border: "1px solid rgba(2,132,199,0.25)",
                              }}>{p.accountRole || p.role}</span>
                            </td>
                            <td style={{ padding: "13px 16px" }}>
                              <span style={{
                                fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999,
                                backgroundColor: p.status === "active" ? "rgba(5,150,105,0.1)" : "rgba(234,179,8,0.12)",
                                color: p.status === "active" ? "#059669" : "#92400E",
                                border: `1px solid ${p.status === "active" ? "rgba(5,150,105,0.3)" : "rgba(234,179,8,0.4)"}`,
                                whiteSpace: "nowrap",
                              }}>{(p.status || "active").replace("_", " ")}</span>
                            </td>
                            <td style={{ padding: "13px 16px", color: textSecondary, fontSize: 12 }}>
                              {p.clientAccountId ? `Client #${p.clientAccountId}` : "—"}
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
                            <td style={{ padding: "13px 16px", color: textSecondary, fontSize: 12, whiteSpace: "nowrap" }}>
                              {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </td>
                            <td style={{ padding: "13px 16px" }}>
                            <div style={{ display: "flex", gap: 7 }}>
                              {p.status === "pending_approval" && (
                                <button onClick={() => handleApprovePartner(p)}
                                  style={btnGreen.base}
                                  onMouseEnter={e => Object.assign(e.currentTarget.style, btnGreen.enter)}
                                  onMouseLeave={e => Object.assign(e.currentTarget.style, btnGreen.leave)}
                                >Approve</button>
                              )}
                                                      {p.status === "active" && (
                                <button onClick={() => { setDeactivatePartner(p); setDeactivateReason(""); }}
                                  style={btnRed.base}
                                  onMouseEnter={e => Object.assign(e.currentTarget.style, btnRed.enter)}
                                  onMouseLeave={e => Object.assign(e.currentTarget.style, btnRed.leave)}
                                >Deactivate</button>
                              )}
                              {["inactive", "suspended"].includes(p.status) && (
                                <button
                                  disabled={deactivatingId === p.id}
                                  onClick={() => handleReactivatePartner(p)}
                                  style={btnGreen.base}
                                  onMouseEnter={e => Object.assign(e.currentTarget.style, btnGreen.enter)}
                                  onMouseLeave={e => Object.assign(e.currentTarget.style, btnGreen.leave)}
                                >{deactivatingId === p.id ? "…" : "Reactivate"}</button>
                              )}
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
                        <Th>ID</Th><Th>Email</Th><Th>Request</Th><Th>Reason</Th><Th>Invited By</Th>
                        <Th>Status</Th><Th>Created</Th><Th>Approved At</Th><Th>Action</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {partnerTeamMembers.map((m, i) => (
                        <tr key={m.id} style={{ borderTop: `1px solid ${border}`, backgroundColor: i % 2 === 0 ? surface : "#FAFBFC" }}>
                          <td style={{ padding: "13px 16px", color: textMuted, fontSize: 12 }}>#{m.id}</td>
                          <td style={{ padding: "13px 16px", color: textPrimary, fontWeight: 600 }}>{m.partner?.email || "—"}</td>
                          <td style={{ padding: "13px 16px", color: textSecondary, whiteSpace: "nowrap" }}>
    {(() => {
      const type = m.request_type ?? m.requestType ?? "activate";
      if (type === "deactivate") return "Deactivate user";
      if (type === "remove") return "Remove user";
      return "Activate new user";
    })()}
  </td>
                          <td style={{ padding: "13px 16px", color: textSecondary, maxWidth: 260 }}>
                            {m.reason || <span style={{ color: textMuted }}>—</span>}
                          </td>
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
        
        {queueReasonAction && (
          <Modal
            title={queueReasonAction.action === "deny" ? "Deny Request" : "Request More Information"}
            subtitle={queueReasonAction.request.requestNumber || `Request #${queueReasonAction.request.id}`}
            onClose={() => { setQueueReasonAction(null); setQueueReason(""); }}
          >
            <Field label={queueReasonAction.action === "deny" ? "Denial reason (required)" : "Information needed (required)"}>
              <textarea
                autoFocus
                required
                value={queueReason}
                onChange={e => setQueueReason(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder={queueReasonAction.action === "deny" ? "Explain why this request is being denied…" : "Describe what the advisor needs to provide…"}
                style={{ ...inputStyle, height: "auto", padding: 10, resize: "vertical" }}
              />
            </Field>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <GhostBtn onClick={() => { setQueueReasonAction(null); setQueueReason(""); }}>Cancel</GhostBtn>
              <ActionBtn
                onClick={() => handleQueueAction(queueReasonAction.request, queueReasonAction.action, queueReason.trim())}
                disabled={!queueReason.trim() || queueActioningId === queueReasonAction.request.id}
                color={queueReasonAction.action === "deny" ? "#DC2626" : "#D97706"}
                hoverColor={queueReasonAction.action === "deny" ? "#B91C1C" : "#B45309"}
              >
                {queueActioningId === queueReasonAction.request.id ? "Saving…" : queueReasonAction.action === "deny" ? "Confirm Deny" : "Send Request"}
              </ActionBtn>
            </div>
          </Modal>
        )}
        {selectedRequest && <RequestDetailModal request={selectedRequest} token={token} onClose={() => setSelectedRequest(null)} onStatusChange={handleStatusChange} />}
        {settingsPartner && <PartnerSettingsModal partner={settingsPartner} token={token} onClose={() => setSettingsPartner(null)} />}
        {editPartner && <EditPartnerModal partner={editPartner} token={token} onClose={() => setEditPartner(null)} onSaved={fetchPartners} />}
        {deletePartner && <ConfirmDeleteModal partner={deletePartner} loading={!!deletingId} onClose={() => setDeletePartner(null)} onConfirm={handleDeletePartner} />}
        {deactivatePartner && (
          <DeactivatePartnerModal
            partner={deactivatePartner}
            reason={deactivateReason}
            setReason={setDeactivateReason}
            loading={deactivatingId === deactivatePartner.id}
            onClose={() => setDeactivatePartner(null)}
            onConfirm={() => handleDeactivatePartner(deactivatePartner, deactivateReason.trim())}
          />
        )}
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