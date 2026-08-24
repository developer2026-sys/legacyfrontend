/* ============================================================================
   Monument Setting — Admin Tab (MOCK DATA — for UI review only)
   ----------------------------------------------------------------------------
   Drop-in additions for AdminDashboard.jsx:

   1. Add a new tab entry alongside Requests/Partners/Partner Team Members:
        <Tab label="Monument Setting" active={tab === "monumentSetting"}
             onClick={() => setTab("monumentSetting")} count={monumentRequests.length} />

   2. Add `const [monumentRequests, setMonumentRequests] = useState(MOCK_MONUMENT_REQUESTS);`
      (swap MOCK_MONUMENT_REQUESTS for a real fetchMonumentRequests() call once
      backend routes exist — see comments at the bottom.)

   3. Render <MonumentSettingTab requests={monumentRequests} partners={partners} />
      when tab === "monumentSetting".

   Everything below is self-contained and reuses your existing style tokens/
   components (Th, StatusBadge-style badges, ActionBtn, GhostBtn, Modal, Field,
   inputStyle, selectStyle) — just copy into the same file or import them.
   ============================================================================ */

   import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../baseurl";
import { useToast } from "../components/toast";

   /* ---------- style tokens (match AdminDashboard.jsx) ---------- */
   const primary = "#1669A9";
   const primaryHover = "#1E90CF";
   const surface = "#FFFFFF";
   const border = "#E5EAF0";
   const borderPrimary = "rgba(22,105,169,0.25)";
   const textPrimary = "#1A1A2E";
   const textSecondary = "#374151";
   const textMuted = "#9CA3AF";
   
   const inputStyle = {
     width: "100%", height: 42, padding: "0 12px", borderRadius: 8,
     backgroundColor: "#F9FAFB", border: `1px solid #D1D5DB`, color: textPrimary,
     fontSize: 13.5, outline: "none", boxSizing: "border-box",
   };
   const selectStyle = { ...inputStyle, appearance: "none" };
   
   /* ---------- status labels / colors (mirrors MonumentBadge on partner side) ---------- */
   const MS_STATUS_LABELS = {
     new: "New",
     under_review: "Under Review",
     cemetery_verification: "Cemetery Verification",
     quote_pending: "Quote Pending",
     awaiting_approval: "Awaiting Approval",
     approved: "Approved",
     scheduling: "Scheduling",
     scheduled: "Scheduled",
     in_progress: "In Progress",
     completed: "Completed",
     on_hold: "On Hold",
     cancelled: "Cancelled",
   };
   const MS_STATUS_ORDER = [
     "new", "under_review", "cemetery_verification", "quote_pending",
     "awaiting_approval", "approved", "scheduling", "scheduled",
     "in_progress", "completed", "on_hold", "cancelled",
   ];
   
   function MsStatusBadge({ status }) {
     const cancelledOrHold = status === "cancelled" || status === "on_hold";
     const completed = status === "completed";
     const bg = completed ? "rgba(16,185,129,0.08)" : cancelledOrHold ? "rgba(220,38,38,0.08)" : "rgba(22,105,169,0.08)";
     const color = completed ? "#065F46" : cancelledOrHold ? "#DC2626" : primary;
     const borderC = completed ? "rgba(16,185,129,0.3)" : cancelledOrHold ? "rgba(220,38,38,0.25)" : borderPrimary;
     return (
       <span style={{
         display: "inline-flex", alignItems: "center", borderRadius: 999,
         border: `1px solid ${borderC}`, backgroundColor: bg, color,
         padding: "3px 10px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
         letterSpacing: "0.04em",
       }}>
         {MS_STATUS_LABELS[status] || status}
       </span>
     );
   }
   
   /* ---------- shared small components (same shapes as AdminDashboard.jsx) ---------- */
   function Th({ children }) {
     return (
       <th style={{ padding: "11px 16px", textAlign: "left", color: textMuted, fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, whiteSpace: "nowrap", backgroundColor: "#F8FAFC" }}>
         {children}
       </th>
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
   
   function GhostBtn({ onClick, children, style = {} }) {
     const [hov, setHov] = useState(false);
     return (
       <button onClick={onClick}
         onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
         style={{
           backgroundColor: "transparent", color: hov ? primary : textMuted,
           border: `1px solid ${hov ? borderPrimary : border}`,
           borderRadius: 8, padding: "8px 16px", fontSize: 12.5, fontWeight: 500,
           cursor: "pointer", transition: "all .2s", ...style,
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
           width: "100%", maxWidth: 640, maxHeight: "90vh", display: "flex", flexDirection: "column",
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
   
   function Field({ label, children }) {
     return (
       <div style={{ marginBottom: 14 }}>
         <label style={{ display: "block", color: textSecondary, fontSize: 12, fontWeight: 500, marginBottom: 6 }}>{label}</label>
         {children}
       </div>
     );
   }
   
   function DetailRow({ label, value, children }) {
     return (
       <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${border}`, alignItems: "flex-start" }}>
         <div style={{ color: textMuted, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 140, paddingTop: 1 }}>{label}</div>
         <div style={{ color: textPrimary, fontSize: 13.5, flex: 1, wordBreak: "break-word" }}>
           {children !== undefined ? children : (value || <span style={{ color: textMuted }}>—</span>)}
         </div>
       </div>
     );
   }
   
   /* ---------- MOCK DATA — remove once wired to GET /admin/monument-setting ---------- */
   export const MOCK_MONUMENT_REQUESTS = [
     {
       id: 1,
       requestNumber: "MSR-000001",
       partner: { id: 12, username: "jarrett_monuments" },
       familyFirstName: "Diane", familyLastName: "Holloway",
       familyState: "IN", familyPhone: "(317) 555-0142", familyEmail: "diane.h@example.com",
       cemeteryName: "Washington Park Cemetery", cemeteryState: "IN",
       monumentType: "upright", settingRequested: "foundation_and_setting",
       carePackageOption: "care_549", careFamilyStatus: "purchased_549",
       status: "quote_pending",
       quoteAmount: null, scheduledDate: null,
       assignedSettingCompany: null, assignedCoordinator: null,
       internalNotes: "",
       createdAt: "2026-08-10T14:22:00Z",
     },
     {
       id: 2,
       requestNumber: "MSR-000002",
       partner: { id: 12, username: "jarrett_monuments" },
       familyFirstName: "Roland", familyLastName: "Ortiz",
       familyState: "IN", familyPhone: "(317) 555-0187", familyEmail: "rortiz@example.com",
       cemeteryName: "Flanner Buchanan - Oaklawn", cemeteryState: "IN",
       monumentType: "flat_marker", settingRequested: "setting_only",
       carePackageOption: "care_none", careFamilyStatus: "not_discussed_yet",
       status: "scheduled",
       quoteAmount: "480.00", scheduledDate: "2026-09-02",
       assignedSettingCompany: "Midwest Setting Co.", assignedCoordinator: "Alex R.",
       internalNotes: "Family requested morning slot only.",
       createdAt: "2026-08-05T09:10:00Z",
     },
     {
       id: 3,
       requestNumber: "MSR-000003",
       partner: { id: 27, username: "heritage_stoneworks" },
       familyFirstName: "Marlene", familyLastName: "Voss",
       familyState: "OH", familyPhone: "(614) 555-0199", familyEmail: "mvoss@example.com",
       cemeteryName: "Green Lawn Cemetery", cemeteryState: "OH",
       monumentType: "bench", settingRequested: "removal_and_reset",
       carePackageOption: "care_749", careFamilyStatus: "purchased_749",
       status: "completed",
       quoteAmount: "610.00", scheduledDate: "2026-07-18",
       assignedSettingCompany: "Buckeye Memorial Setting", assignedCoordinator: "Priya N.",
       internalNotes: "Completed ahead of anniversary deadline.",
       createdAt: "2026-06-30T11:45:00Z",
     },
   ];
   
   /* ============================================================================
      Detail modal — status, quote, schedule, assignment, notes, documents
      ============================================================================ */
      function MonumentDetailModal({ request, token, onClose, onSave }) {
        const { success: ok, error: err } = useToast();
        const [status, setStatus] = useState(request.status);
        const [quote, setQuote] = useState(request.quoteAmount || "");
        const [scheduledDate, setScheduledDate] = useState(request.scheduledDate || "");
        const [settingCompany, setSettingCompany] = useState(request.assignedSettingCompany || "");
        const [coordinator, setCoordinator] = useState(request.assignedCoordinator || "");
        const [notes, setNotes] = useState(request.internalNotes || "");
        const [saving, setSaving] = useState(false);
      
        const handleSaveAll = async () => {
          setSaving(true);
          try {
            const { data } = await axios.patch(
              `${BASE_URL}/admin/monument-setting/${request.id}`,
              {
                status,
                quoteAmount: quote,
                scheduledDate,
                assignedSettingCompany: settingCompany,
                assignedCoordinator: coordinator,
                internalNotes: notes,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            ok("Request updated", `${request.requestNumber} has been saved.`);
            onSave(data.request);
            onClose();
          } catch (e) {
            err("Save failed", e?.response?.data?.message || "Failed to save changes.");
          } finally {
            setSaving(false);
          }
        };
   
     return (
       <Modal
         title={`${request.requestNumber}`}
         subtitle={`${request.familyFirstName} ${request.familyLastName} — ${request.cemeteryName}`}
         onClose={onClose}
       >
         <DetailRow label="Partner" value={request.partner?.username} />
         <DetailRow label="Family" value={`${request.familyFirstName} ${request.familyLastName}`} />
         <DetailRow label="Family Contact" value={`${request.familyPhone} · ${request.familyEmail}`} />
         <DetailRow label="Cemetery" value={`${request.cemeteryName} (${request.cemeteryState})`} />
         <DetailRow label="Monument Type" value={MS_STATUS_LABELS[request.monumentType] || request.monumentType} />
         <DetailRow label="Care Package" value={
           request.carePackageOption === "care_549" ? "$549 Plan"
           : request.carePackageOption === "care_749" ? "$749 Plan"
           : "No Care Package"
         } />
   
         {/* Status */}
         <div style={{ marginTop: 20 }}>
           <div style={{ color: textMuted, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Status</div>
           <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
             {MS_STATUS_ORDER.map((s) => (
               <option key={s} value={s}>{MS_STATUS_LABELS[s]}</option>
             ))}
           </select>
         </div>
   
         {/* Quote + Schedule */}
         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 }}>
           <Field label="Quote Amount ($)">
             <input type="number" step="0.01" min="0" value={quote}
               onChange={(e) => setQuote(e.target.value)} style={inputStyle} placeholder="0.00" />
           </Field>
           <Field label="Scheduled Date">
             <input type="date" value={scheduledDate}
               onChange={(e) => setScheduledDate(e.target.value)} style={inputStyle} />
           </Field>
         </div>
   
         {/* Assignment */}
         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
           <Field label="Assigned Setting Company">
             <input value={settingCompany} onChange={(e) => setSettingCompany(e.target.value)}
               style={inputStyle} placeholder="e.g. Midwest Setting Co." />
           </Field>
           <Field label="Assigned Coordinator">
             <input value={coordinator} onChange={(e) => setCoordinator(e.target.value)}
               style={inputStyle} placeholder="e.g. Alex R." />
           </Field>
         </div>
   
         {/* Notes */}
         <Field label="Internal Notes">
           <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
             rows={3} style={{ ...inputStyle, height: "auto", padding: "10px 12px", resize: "vertical" }} />
         </Field>
   
         {/* Documents — mock placeholder, wire to same upload pattern as UploadDocumentsModal */}
         <div style={{ marginTop: 16 }}>
           <div style={{ color: textMuted, fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Documents</div>
           <div style={{ padding: "14px 16px", backgroundColor: "#F9FAFB", border: `1px dashed ${border}`, borderRadius: 8, color: textMuted, fontSize: 12.5, textAlign: "center" }}>
             Document upload/list wires in once backend routes exist.
           </div>
         </div>
   
         <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <GhostBtn onClick={onClose}>Cancel</GhostBtn>
        <ActionBtn onClick={handleSaveAll} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </ActionBtn>
      </div>
    </Modal>
  );
}
   
   /* ============================================================================
      Main tab — table + filters
      ============================================================================ */
      export function MonumentSettingTab({ requests, partners = [], token, onRequestUpdated }) {
        const rows = requests;
        const [selected, setSelected] = useState(null);
        const [filterPartner, setFilterPartner] = useState("all");
        const [filterState, setFilterState] = useState("all");
        const [filterTerritory, setFilterTerritory] = useState("all");
        const [filterStatus, setFilterStatus] = useState("all");
        const [searchQ, setSearchQ] = useState("");
      
        const states = [...new Set(rows.map((r) => r.familyState).filter(Boolean))].sort();
        const territories = [...new Set(rows.map((r) => r.territory).filter(Boolean))].sort();
      
        const filtered = rows.filter((r) => {
          const matchPartner = filterPartner === "all" || String(r.partner?.id) === filterPartner;
          const matchState = filterState === "all" || r.familyState === filterState;
          const matchTerritory = filterTerritory === "all" || r.territory === filterTerritory;
          const matchStatus = filterStatus === "all" || r.status === filterStatus;
          const q = searchQ.toLowerCase();
          const matchSearch = !q ||
            `${r.familyFirstName} ${r.familyLastName}`.toLowerCase().includes(q) ||
            r.cemeteryName?.toLowerCase().includes(q) ||
            r.requestNumber?.toLowerCase().includes(q);
          return matchPartner && matchState && matchTerritory && matchStatus && matchSearch;
        });
   
     const handleSave = (updated) => {
        if (typeof onRequestUpdated === "function") onRequestUpdated(updated);
      };


     return (
       <div style={{ backgroundColor: surface, border: `1px solid ${border}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", borderTop: `3px solid ${primary}` }}>
         {/* Toolbar */}
         <div style={{ padding: "14px 18px", borderBottom: `1px solid ${border}`, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", backgroundColor: "#FAFBFC" }}>
           <input
             placeholder="Search family, cemetery, request #…"
             value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
             style={{ ...inputStyle, width: 240, height: 36, fontSize: 12.5 }}
           />
           <select value={filterPartner} onChange={(e) => setFilterPartner(e.target.value)}
             style={{ ...selectStyle, width: 170, height: 36, fontSize: 12.5 }}>
             <option value="all">All Partners</option>
             {[...new Map(rows.map((r) => [r.partner?.id, r.partner])).values()].filter(Boolean).map((p) => (
               <option key={p.id} value={p.id}>{p.username}</option>
             ))}
           </select>
           <select value={filterState} onChange={(e) => setFilterState(e.target.value)}
            style={{ ...selectStyle, width: 130, height: 36, fontSize: 12.5 }}>
            <option value="all">All States</option>
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterTerritory} onChange={(e) => setFilterTerritory(e.target.value)}
            style={{ ...selectStyle, width: 150, height: 36, fontSize: 12.5 }}>
            <option value="all">All Territories</option>
            {territories.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
             style={{ ...selectStyle, width: 175, height: 36, fontSize: 12.5 }}>
             <option value="all">All Statuses</option>
             {MS_STATUS_ORDER.map((s) => <option key={s} value={s}>{MS_STATUS_LABELS[s]}</option>)}
           </select>
           <span style={{ color: textMuted, fontSize: 12, marginLeft: "auto" }}>
             {filtered.length} result{filtered.length !== 1 ? "s" : ""}
           </span>
         </div>
   
         {filtered.length === 0 ? (
           <div style={{ padding: "48px 0", textAlign: "center", color: textMuted, fontSize: 13 }}>
             No monument setting requests match your filters.
           </div>
         ) : (
           <div style={{ overflowX: "auto" }}>
             <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
               <thead>
                 <tr>
                 <Th>Request #</Th><Th>Partner</Th><Th>Family</Th><Th>Cemetery</Th>
                  <Th>State</Th><Th>Territory</Th><Th>Care Package</Th><Th>Status</Th>
                  <Th>Scheduled</Th><Th>Action</Th>
                 </tr>
               </thead>
               <tbody>
                 {filtered.map((r, i) => (
                   <tr key={r.id} style={{ borderTop: `1px solid ${border}`, backgroundColor: i % 2 === 0 ? surface : "#FAFBFC" }}>
                     <td style={{ padding: "13px 16px", color: textPrimary, fontWeight: 600 }}>{r.requestNumber}</td>
                     <td style={{ padding: "13px 16px", color: textMuted, fontSize: 12 }}>{r.partner?.username || "—"}</td>
                     <td style={{ padding: "13px 16px", color: textSecondary }}>{r.familyFirstName} {r.familyLastName}</td>
                     <td style={{ padding: "13px 16px", color: textSecondary, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.cemeteryName}</td>
                     <td style={{ padding: "13px 16px", color: textSecondary, fontSize: 12 }}>{r.familyState}</td>
                     <td style={{ padding: "13px 16px", color: textSecondary, fontSize: 12 }}>{r.territory || "—"}</td>
                     <td style={{ padding: "13px 16px", color: textSecondary, fontSize: 12 }}>
                       {r.carePackageOption === "care_549" ? "$549" : r.carePackageOption === "care_749" ? "$749" : "—"}
                     </td>
                     <td style={{ padding: "13px 16px" }}><MsStatusBadge status={r.status} /></td>
                     <td style={{ padding: "13px 16px", color: textSecondary, fontSize: 12, whiteSpace: "nowrap" }}>
                       {r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                     </td>
                     <td style={{ padding: "13px 16px" }}>
                       <button
                         onClick={() => setSelected(r)}
                         style={{ background: "none", border: `1px solid ${border}`, color: primary, borderRadius: 6, padding: "5px 12px", fontSize: 11.5, cursor: "pointer" }}
                       >View</button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}
   
   {selected && (
        <MonumentDetailModal request={selected} token={token} onClose={() => setSelected(null)} onSave={handleSave} />
      )}
      
       </div>
     );
   }
   
   /* ============================================================================
      NEXT STEP — wiring to backend (once you're ready):
   
      1. Replace MOCK_MONUMENT_REQUESTS with:
           const [monumentRequests, setMonumentRequests] = useState([]);
           const fetchMonumentRequests = useCallback(async () => {
             const { data } = await axios.get(`${BASE_URL}/admin/monument-setting`,
               { headers: { Authorization: `Bearer ${token}` } });
             setMonumentRequests(data.requests || []);
           }, [token]);
           useEffect(() => { fetchMonumentRequests(); }, []);
   
      2. In MonumentDetailModal.handleSaveAll, replace the mock delay with real
         PATCH calls (status / quote / schedule / assign / notes) — can be one
         combined PATCH /admin/monument-setting/:id endpoint that accepts a
         partial body, matching the pattern of your existing
         PATCH /admin/requests/:id/status and /price endpoints.
   
      3. Territory filter is intentionally omitted — no `territory` field
         exists on MonumentSettingRequest yet. Add a migration + model field
         once you decide whether it's manual entry or derived from state.
      ============================================================================ */