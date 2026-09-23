import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../baseurl";
import { useToast } from "../components/toast";
import PartnerTeammemberButton from "../components/partnerteammemberbutton";

/**
 * Lasting Legacy Cleaners — Partner Dashboard Page
 * Restyled to match Collections Connector theme (aligned with LoginPage)
 *
 * Brand:
 *  - Background: #F5F7FA
 *  - Card:       #FFFFFF
 *  - Primary:    #1669A9
 *  - Dark:       #1A1A2E
 *  - Text:       #333333 / #6B7280
 *  - Accent:     #1E90CF
 */
const BILLING_LINKS = {
  basic_annual: "https://link.waveapps.com/6s87u2-fhf6gt",
  premium_annual: "https://link.waveapps.com/7nvtce-ks963v",
 
};


function Logo({ size = 64 }) {
  return (
    <div className="flex items-center gap-3">
    <img src="https://res.cloudinary.com/dbjwbveqn/image/upload/v1789646047/cleanerlogo_fvdkle.jpg" alt="Lasting Legacy Cleaners" style={{ height: size, width: "auto", display: "block" }} />
    </div>
  );
}

function StatusBadge({ status }) {
  let bg = "#F3F4F6";
  let color = "#6B7280";
  let border = "#E5E7EB";
  if (status === "Pending Approval") {
    bg = "#FEF3C7";
    color = "#92400E";
    border = "#FDE68A";
  } else if (status === "Approved") {
    bg = "#DBEAFE";
    color = "#1669A9";
    border = "#BFDBFE";
  } else if (status === "Completed") {
    bg = "#D1FAE5";
    color = "#065F46";
    border = "#A7F3D0";
  }else if (status === "Denied") {
    bg = "#FEE2E2";
    color = "#991B1B";
    border = "#FECACA";
  }
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: bg, color, borderColor: border }}
    >
      {status}
    </span>
  );
}

function StatCard({ label, sublabel, value, icon }) {
  return (
    <div
      className="rounded-2xl flex items-start gap-4 p-5"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5EAF0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl"
        style={{ backgroundColor: "#1669A9", color: "#fff" }}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color: "#1A1A2E" }}>{value}</div>
        <div className="text-sm font-semibold mt-0.5" style={{ color: "#1A1A2E" }}>{label}</div>
        {sublabel && <div className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{sublabel}</div>}
      </div>
    </div>
  );
}

export default function DashboardPage({ partnerName = "Partner", partner = null, token, onLogout }) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [active, setActive] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [rawRequests, setRawRequests] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  const [submittedRequestId, setSubmittedRequestId] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
const [submittedPkg, setSubmittedPkg] = useState(null);

// Monument Setting — top-level dashboard section switch
const [mainView, setMainView] = useState("restoration"); // "restoration" | "monument"


// Add near submitNewRequest
const [paySending, setPaySending] = useState(false);


const sendPaymentRequest = async () => {
  if (!submittedPkg || !submittedRequestId) return;
  try {
    setPaySending(true);
    await axios.post(
      `${BASE_URL}/send-payment-request`,
      { packageType: submittedPkg, requestId: submittedRequestId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toastSuccess("Sent", "Payment request sent to our billing team.");
    setShowPayment(false);
  } catch (err) {
    const msg = err?.response?.data?.message || "Failed to send payment request.";
    toastError("Something went wrong", msg);
  } finally {
    setPaySending(false);
  }
};



/* ---------- Shared field helpers ---------- */

function fieldStyle() {
  return { backgroundColor: "#F9FAFB", border: "1px solid #D1D5DB", color: "#1A1A2E", outline: "none" };
}
function focusHandlers() {
  return {
    onFocus: (e) => { e.target.style.borderColor = "#1669A9"; e.target.style.boxShadow = "0 0 0 3px rgba(22,105,169,0.12)"; },
    onBlur: (e) => { e.target.style.borderColor = "#D1D5DB"; e.target.style.boxShadow = "none"; },
  };
}

function FieldLabel({ children }) {
  return <label className="block text-sm font-medium mb-2" style={{ color: "#374151" }}>{children}</label>;
}

function TextInput({ label, name, type = "text", required, placeholder, defaultValue }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full h-12 px-4 rounded-lg text-sm transition"
        style={fieldStyle()}
        {...focusHandlers()}
      />
    </div>
  );
}

function SelectInput({ label, name, options, required }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="w-full h-12 px-4 rounded-lg text-sm transition"
        style={fieldStyle()}
        {...focusHandlers()}
      >
        <option value="" disabled>Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function TextAreaInput({ label, name, placeholder, rows = 3 }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg text-sm transition resize-none"
        style={fieldStyle()}
        {...focusHandlers()}
      />
    </div>
  );
}

function RadioRow({ label, name, options, defaultValue }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="flex flex-wrap gap-4 h-12 items-center">
        {options.map((o) => (
          <label key={o} className="flex items-center gap-2 text-sm" style={{ color: "#374151" }}>
            <input type="radio" name={name} value={o} defaultChecked={o === defaultValue} style={{ accentColor: "#1669A9" }} />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}

function FileInput({ label, name, hint }) {
  return (
    <div>
      <FieldLabel>
        {label} {hint && <span className="text-xs font-normal" style={{ color: "#6B7280" }}>{hint}</span>}
      </FieldLabel>
      <input
        name={name}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        className="w-full text-sm"
        style={{ color: "#374151" }}
      />
    </div>
  );
}

function FormSection({ title, children }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5EAF0" }}>
      <h4 className="text-sm font-semibold mb-4" style={{ color: "#1669A9" }}>{title}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

/* ---------- Monument Setting: top section with sub-tabs ---------- */

const OPEN_STATUSES = [
  "new", "under_review", "cemetery_verification", "quote_pending",
  "awaiting_approval", "approved", "scheduling", "in_progress", "on_hold",
];
const STATUS_LABELS = {
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

function MonumentBadge({ status }) {
  const cancelledOrHold = status === "cancelled" || status === "on_hold";
  const bg = status === "completed" ? "#D1FAE5" : cancelledOrHold ? "#FEE2E2" : "#DBEAFE";
  const color = status === "completed" ? "#065F46" : cancelledOrHold ? "#991B1B" : "#1669A9";
  const border = status === "completed" ? "#A7F3D0" : cancelledOrHold ? "#FECACA" : "#BFDBFE";
  return (
    <span
      className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: bg, color, borderColor: border }}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function MonumentRequestTable({ requests, emptyLabel }) {
  if (requests.length === 0) {
    return (
      <section className="rounded-2xl p-10 text-center" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5EAF0" }}>
        <p className="text-sm" style={{ color: "#6B7280" }}>{emptyLabel}</p>
      </section>
    );
  }
  return (
    <section className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5EAF0" }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: "#F9FAFB" }}>
            <tr className="text-left" style={{ color: "#6B7280" }}>
              <th className="px-6 py-3 font-medium">Request #</th>
              <th className="px-6 py-3 font-medium">Family</th>
              <th className="px-6 py-3 font-medium">Cemetery</th>
              <th className="px-6 py-3 font-medium">Care Package</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Scheduled</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-t" style={{ borderColor: "#E5EAF0" }}>
                <td className="px-6 py-4 font-medium" style={{ color: "#1A1A2E" }}>{r.requestNumber}</td>
                <td className="px-6 py-4" style={{ color: "#333333" }}>{r.familyFirstName} {r.familyLastName}</td>
                <td className="px-6 py-4" style={{ color: "#333333" }}>{r.cemeteryName}</td>
                <td className="px-6 py-4" style={{ color: "#333333" }}>
                  {r.carePackageOption === "care_549" ? "$549" : r.carePackageOption === "care_749" ? "$749" : "—"}
                </td>
                <td className="px-6 py-4"><MonumentBadge status={r.status} /></td>
                <td className="px-6 py-4" style={{ color: "#333333" }}>
                  {r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MonumentSettingSection({ partnerName, partner, token }) {
  const { error: toastError } = useToast();
  const [tab, setTab] = useState("new"); // new | open | scheduled | completed
  const [allRequests, setAllRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const tabs = [
    { key: "new", label: "New Setting Request" },
    { key: "open", label: "Open Requests" },
    { key: "scheduled", label: "Scheduled" },
    { key: "completed", label: "Completed" },
  ];

  const fetchMonumentRequests = async () => {
    try {
      setLoadingRequests(true);
      const { data } = await axios.get(`${BASE_URL}/monument-setting`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllRequests(data.requests || []);
    } catch (err) {
      toastError("Failed to load", "Could not fetch monument setting requests.");
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchMonumentRequests();
  }, []);

  // Refetch whenever the partner switches into a tab that shows live
  // status data, so an admin-side status change is never masked by
  // stale data from the initial mount.
  useEffect(() => {
    if (tab === "open" || tab === "scheduled" || tab === "completed") {
      fetchMonumentRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const openRequests = allRequests.filter((r) => OPEN_STATUSES.includes(r.status));
  const scheduledRequests = allRequests.filter((r) => r.status === "scheduled");
  const completedRequests = allRequests.filter((r) => r.status === "completed" || r.status === "cancelled");

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold" style={{ color: "#1A1A2E" }}>
          Monument Setting
        </h1>
        <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
          Submit and track monument setting requests
        </p>
      </div>

      <div className="flex gap-2 mb-8 border-b overflow-x-auto" style={{ borderColor: "#E5EAF0" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2.5 text-sm font-medium whitespace-nowrap transition"
            style={{
              color: tab === t.key ? "#1669A9" : "#6B7280",
              borderBottom: tab === t.key ? "2px solid #1669A9" : "2px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "new" && (
  <NewMonumentSettingForm
    partnerName={partnerName}
    partner={partner}
    token={token}
    onCreated={() => {
      fetchMonumentRequests();
      setTab("open");
    }}
  />
)}
      {tab === "open" && (
        loadingRequests
          ? <p className="text-sm text-center py-8" style={{ color: "#6B7280" }}>Loading…</p>
          : <MonumentRequestTable requests={openRequests} emptyLabel="No open monument setting requests yet." />
      )}

      {tab === "scheduled" && (
        loadingRequests
          ? <p className="text-sm text-center py-8" style={{ color: "#6B7280" }}>Loading…</p>
          : <MonumentRequestTable requests={scheduledRequests} emptyLabel="No scheduled monument settings yet." />
      )}

      {tab === "completed" && (
        loadingRequests
          ? <p className="text-sm text-center py-8" style={{ color: "#6B7280" }}>Loading…</p>
          : <MonumentRequestTable requests={completedRequests} emptyLabel="No completed monument settings yet." />
      )}
    </>
  );
}

/* ---------- Review screen: formatting helpers ---------- */

function formatDisplay(value) {
  if (value === null || value === undefined) return "—";
  const str = String(value).trim();
  return str === "" ? "—" : str;
}

// Parses a native <input type="date"> value ("YYYY-MM-DD") as a local
// date, not UTC — new Date("YYYY-MM-DD") parses as UTC midnight and can
// display one day early for users west of UTC.
function formatDateStr(str) {
  if (!str) return "—";
  const [y, m, d] = str.split("-").map(Number);
  if (!y || !m || !d) return "—";
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// An unfilled <input type="file"> still yields a File object from
// FormData.get() (name: "", size: 0), not null — filter those out.
function formatFile(file) {
  if (!file || typeof file === "string" || !file.name) return null;
  return file;
}

function carePackageLabel(value) {
  if (value === "care_549") return "Memorial Preventative Care Plan — $549";
  if (value === "care_749") return "Premium Memorial Preventative Care Plan — $749";
  if (value === "care_none") return "No Care Package";
  return "Not selected";
}

// Reads the exact FormData that will be submitted and reshapes it into
// the review groups the spec calls for. Nothing here is invented —
// every value comes straight from a field already in the form.
function buildReview(fd) {
  return {
    partner: {
      companyName: fd.get("companyName"),
      partnerLocation: fd.get("partnerLocation"),
      salesRep: fd.get("salesRep"),
      partnerEmail: fd.get("partnerEmail"),
      partnerPhone: fd.get("partnerPhone"),
      partnerOrderNumber: fd.get("partnerOrderNumber"),
      internalRefNumber: fd.get("internalRefNumber"),
    },
    family: {
      name: [fd.get("familyFirstName"), fd.get("familyLastName")].filter(Boolean).join(" "),
      phone: fd.get("familyPhone"),
      email: fd.get("familyEmail"),
      address: [fd.get("familyAddress"), fd.get("familyCity"), fd.get("familyState"), fd.get("familyZip")]
        .filter(Boolean)
        .join(", "),
      preferredContact: fd.get("preferredContact"),
      allowContact: fd.get("allowContact") === "on" ? "Yes" : "No",
    },
    cemetery: {
      name: fd.get("cemeteryName"),
      address: [fd.get("cemeteryAddress"), fd.get("cemeteryCity"), fd.get("cemeteryState"), fd.get("cemeteryZip")]
        .filter(Boolean)
        .join(", "),
      territory: fd.get("territory"),
      contactName: fd.get("cemeteryContactName"),
      contactPhone: fd.get("cemeteryPhone"),
      contactEmail: fd.get("cemeteryEmail"),
      sectionLotBlockSpace: [fd.get("section"), fd.get("lot"), fd.get("block"), fd.get("graveSpace")]
        .filter(Boolean)
        .join(" / "),
      approval: fd.get("cemeteryApproval"),
    },
    monument: {
      type: fd.get("monumentType"),
      material: fd.get("material"),
      dimensions: [fd.get("width"), fd.get("height"), fd.get("depth")].filter(Boolean).join(" x "),
      weight: fd.get("weight"),
      baseDimensions: fd.get("baseDimensions"),
      numPieces: fd.get("numPieces"),
    },
    settingService: {
      settingRequested: fd.get("settingRequested"),
      monumentLocationType: fd.get("monumentLocationType"),
      pickupAddress: fd.get("pickupAddress"),
      pickupContactName: fd.get("pickupContactName"),
      pickupPhone: fd.get("pickupPhone"),
      readyForPickup: fd.get("readyForPickup"),
      requestedPickupDate: fd.get("requestedPickupDate"),
    },
    requestedDate: {
      requestedSettingDate: fd.get("requestedSettingDate"),
      alternateDate: fd.get("alternateDate"),
      deadlineDate: fd.get("deadlineDate"),
      flexibleDates: fd.get("flexibleDates"),
      deadlineReason: fd.get("deadlineReason"),
      specialInstructions: fd.get("specialInstructions"),
    },
    documents: [
      ["Cemetery Approval Document", fd.get("cemeteryApprovalDoc")],
      ["Monument Front Photo", fd.get("photoFront")],
      ["Monument Back Photo", fd.get("photoBack")],
      ["Base Photo", fd.get("photoBase")],
      ["Monument Drawing / Dimensions", fd.get("drawing")],
      ["Cemetery Plot Information", fd.get("plotInfo")],
      ["Foundation Photo", fd.get("foundationPhoto")],
      ["Work Order", fd.get("workOrder")],
      ["Additional Photos/Documents", fd.get("additionalDocs")],
    ]
      .map(([label, file]) => [label, formatFile(file)])
      .filter(([, file]) => file !== null),
    care: {
      package: fd.get("carePackageOption"),
      familyStatus: fd.get("careFamilyStatus"),
    },
  };
}

/* ---------- Review screen: display components ---------- */

function ReviewRow({ label, value }) {
  return (
    <div>
      <div className="text-xs font-medium" style={{ color: "#6B7280" }}>{label}</div>
      <div className="text-sm mt-0.5" style={{ color: "#1A1A2E" }}>{formatDisplay(value)}</div>
    </div>
  );
}

function ReviewGroup({ title, children }) {
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5EAF0" }}>
      <h4 className="text-sm font-semibold mb-4" style={{ color: "#1669A9" }}>{title}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

/* ---------- Monument Setting: New Setting Request form ---------- */
function NewMonumentSettingForm({ partnerName, partner, token, onCreated }) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [submittingMonument, setSubmittingMonument] = useState(false);
  const [step, setStep] = useState("form"); // "form" | "review"
  const [reviewData, setReviewData] = useState(null);

  // Holds the exact FormData (with real File blobs) built on the
  // "go to review" step, submitted only when the partner confirms.
  const formDataRef = useRef(null);
  // Stable reference to the actual <form> DOM node, captured
  // synchronously — kept because the form stays mounted (just
  // hidden) through the review step, so .reset() after a successful
  // POST always targets a live node.
  const formElRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault(); // native required-field validation already ran by this point
    const fd = new FormData(e.currentTarget);
    formDataRef.current = fd;
    formElRef.current = e.currentTarget;
    setReviewData(buildReview(fd));
    setStep("review");
  };

  const handleBackToForm = () => {
    setStep("form");
  };

  const handleConfirmSubmit = async () => {
    const fd = formDataRef.current;
    if (!fd) return;
    try {
      setSubmittingMonument(true);
      const { data } = await axios.post(`${BASE_URL}/monument-setting/create-request`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toastSuccess(
        "Request submitted",
        `Monument setting request ${data.request?.requestNumber || ""} created.`
      );
      formElRef.current?.reset();
      setStep("form");
      setReviewData(null);
      formDataRef.current = null;
      if (typeof onCreated === "function") onCreated();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit monument setting request.";
      toastError("Submission failed", msg);
      // stay on the review screen so the partner can retry without re-filling anything
    } finally {
      setSubmittingMonument(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        style={{ display: step === "form" ? undefined : "none" }}
      >
        <FormSection title="Partner Information">
          <TextInput label="Company Name" name="companyName" defaultValue={partnerName} />
          <TextInput label="Location" name="partnerLocation" />
          <TextInput label="Sales Representative" name="salesRep" />
          <TextInput label="Email" name="partnerEmail" type="email" defaultValue={partner?.username || ""} />
          <TextInput label="Phone" name="partnerPhone" type="tel" defaultValue={partner?.phone || ""} />
          <TextInput label="Partner Order Number" name="partnerOrderNumber" />
          <TextInput label="Internal Reference Number" name="internalRefNumber" />
        </FormSection>

        <FormSection title="Family Information">
          <TextInput label="First Name" name="familyFirstName" required />
          <TextInput label="Last Name" name="familyLastName" required />
          <TextInput label="Phone" name="familyPhone" type="tel" required />
          <TextInput label="Email" name="familyEmail" type="email" required />
          <TextInput label="Address" name="familyAddress" required />
          <TextInput label="City" name="familyCity" required />
          <TextInput label="State" name="familyState" required />
          <TextInput label="ZIP" name="familyZip" required />
          <RadioRow label="Preferred Contact" name="preferredContact" options={["Phone", "Text", "Email"]} defaultValue="Phone" />
          <div className="sm:col-span-2 flex items-center gap-2">
            <input type="checkbox" name="allowContact" id="allowContact" style={{ accentColor: "#1669A9" }} />
            <label htmlFor="allowContact" className="text-sm" style={{ color: "#374151" }}>
              Allow Lasting Legacy to contact the family regarding this setting request.
            </label>
          </div>
        </FormSection>

        <FormSection title="Cemetery Information">
          <TextInput label="Cemetery Name" name="cemeteryName" required />
          <TextInput label="Cemetery Address" name="cemeteryAddress" required />
          <TextInput label="City" name="cemeteryCity" required />
          <TextInput label="State" name="cemeteryState" required />
          <TextInput label="ZIP" name="cemeteryZip" required />
          <TextInput label="Territory" name="territory" placeholder="e.g. Midwest Region" />
          <TextInput label="Cemetery Contact Name" name="cemeteryContactName" />
          <TextInput label="Cemetery Phone" name="cemeteryPhone" type="tel" />
          <TextInput label="Cemetery Email" name="cemeteryEmail" type="email" />
          <TextInput label="Section" name="section" />
          <TextInput label="Lot" name="lot" />
          <TextInput label="Block" name="block" />
          <TextInput label="Grave / Space" name="graveSpace" />
          <SelectInput label="Cemetery Approval" name="cemeteryApproval" options={["Yes", "No", "Pending", "Unknown"]} />
          <FileInput label="Cemetery Approval Document" name="cemeteryApprovalDoc" hint="(jpg, png, pdf)" />
        </FormSection>

        <FormSection title="Monument Information">
          <SelectInput
            label="Monument Type"
            name="monumentType"
            options={["Upright", "Flat Marker", "Slant", "Bevel", "Bench", "Companion", "Cremation Memorial", "Other"]}
          />
          <TextInput label="Granite / Material" name="material" />
          <TextInput label="Width" name="width" />
          <TextInput label="Height" name="height" />
          <TextInput label="Depth" name="depth" />
          <TextInput label="Approximate Weight" name="weight" />
          <TextInput label="Base Dimensions" name="baseDimensions" />
          <TextInput label="Number of Pieces" name="numPieces" type="number" />
          <SelectInput
            label="Setting Requested"
            name="settingRequested"
            options={["Setting Only", "Foundation + Setting", "Reset Existing Monument", "Existing Foundation", "New Foundation Required", "Removal and Reset", "Site Evaluation Needed", "Other"]}
          />
        </FormSection>

        <FormSection title="Monument Location">
          <SelectInput
            label="Where is the monument currently located?"
            name="monumentLocationType"
            options={["Monument Company", "Manufacturer", "Cemetery", "Storage Facility", "Family", "Other"]}
          />
          <TextInput label="Pickup Address" name="pickupAddress" />
          <TextInput label="Contact Name" name="pickupContactName" />
          <TextInput label="Phone" name="pickupPhone" type="tel" />
          <RadioRow label="Ready for Pickup" name="readyForPickup" options={["Yes", "No"]} defaultValue="No" />
          <TextInput label="Requested Pickup Date" name="requestedPickupDate" type="date" />
        </FormSection>

        <FormSection title="Requested Setting Schedule">
          <TextInput label="Requested Setting Date" name="requestedSettingDate" type="date" />
          <TextInput label="Alternate Date" name="alternateDate" type="date" />
          <TextInput label="Deadline Date" name="deadlineDate" type="date" />
          <RadioRow label="Flexible Dates" name="flexibleDates" options={["Yes", "No"]} defaultValue="Yes" />
          <SelectInput
            label="Deadline Reason"
            name="deadlineReason"
            options={["Funeral / Service", "Anniversary", "Family Request", "Cemetery Requirement", "Other"]}
          />
          <div className="sm:col-span-2">
            <TextAreaInput label="Special Instructions / Notes" name="specialInstructions" />
          </div>
        </FormSection>

        <FormSection title="Uploads">
          <FileInput label="Monument Front Photo" name="photoFront" />
          <FileInput label="Monument Back Photo" name="photoBack" />
          <FileInput label="Base Photo" name="photoBase" />
          <FileInput label="Monument Drawing / Dimensions" name="drawing" />
          <FileInput label="Cemetery Plot Information" name="plotInfo" />
          <FileInput label="Foundation Photo" name="foundationPhoto" />
          <FileInput label="Work Order" name="workOrder" />
          <FileInput label="Additional Photos/Documents" name="additionalDocs" />
        </FormSection>

        <div className="rounded-xl p-5" style={{ backgroundColor: "#F0F7FF", border: "1px solid #BFDBFE" }}>
          <h4 className="text-sm font-semibold mb-1" style={{ color: "#1669A9" }}>Memorial Preventative Care</h4>
          <p className="text-sm mb-4" style={{ color: "#374151" }}>
            Would the family like to protect and maintain their memorial after installation?
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {[
              { value: "care_549", label: "Memorial Preventative Care Plan", price: "$549" },
              { value: "care_749", label: "Premium Memorial Preventative Care Plan", price: "$749" },
              { value: "care_none", label: "No Care Package", price: "" },
            ].map((opt) => (
              <label key={opt.value} className="rounded-lg p-4 cursor-pointer text-sm" style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1D5DB" }}>
                <input type="radio" name="carePackageOption" value={opt.value} className="mr-2" style={{ accentColor: "#1669A9" }} />
                <span className="font-medium" style={{ color: "#1A1A2E" }}>{opt.label}</span>
                {opt.price && <div className="text-lg font-bold mt-1" style={{ color: "#1669A9" }}>{opt.price}</div>}
              </label>
            ))}
          </div>
          <SelectInput
            label="Family Status"
            name="careFamilyStatus"
            options={["Purchased $549 Package", "Purchased $749 Package", "Interested — Have Lasting Legacy Contact Them", "Information Requested", "Declined", "Not Discussed Yet"]}
          />
        </div>

        <button
          type="submit"
          className="w-full h-12 rounded-lg text-sm font-semibold text-white transition"
          style={{ backgroundColor: "#1669A9" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1E90CF")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1669A9")}
        >
          Review & Submit Setting Request
        </button>
      </form>

      {step === "review" && reviewData && (
        <div className="space-y-6">
          <div className="rounded-xl p-4" style={{ backgroundColor: "#FEF3C7", border: "1px solid #FDE68A" }}>
            <p className="text-sm" style={{ color: "#92400E" }}>
              Please review the details below before submitting. Click Back to make changes.
            </p>
          </div>

          <ReviewGroup title="Partner Information">
            <ReviewRow label="Company Name" value={reviewData.partner.companyName} />
            <ReviewRow label="Location" value={reviewData.partner.partnerLocation} />
            <ReviewRow label="Sales Representative" value={reviewData.partner.salesRep} />
            <ReviewRow label="Email" value={reviewData.partner.partnerEmail} />
            <ReviewRow label="Phone" value={reviewData.partner.partnerPhone} />
            <ReviewRow label="Partner Order Number" value={reviewData.partner.partnerOrderNumber} />
            <ReviewRow label="Internal Reference Number" value={reviewData.partner.internalRefNumber} />
          </ReviewGroup>

          <ReviewGroup title="Family">
            <ReviewRow label="Name" value={reviewData.family.name} />
            <ReviewRow label="Phone" value={reviewData.family.phone} />
            <ReviewRow label="Email" value={reviewData.family.email} />
            <ReviewRow label="Address" value={reviewData.family.address} />
            <ReviewRow label="Preferred Contact" value={reviewData.family.preferredContact} />
            <ReviewRow label="Lasting Legacy May Contact Family" value={reviewData.family.allowContact} />
          </ReviewGroup>

          <ReviewGroup title="Cemetery">
            <ReviewRow label="Cemetery Name" value={reviewData.cemetery.name} />
            <ReviewRow label="Cemetery Address" value={reviewData.cemetery.address} />
            <ReviewRow label="Territory" value={reviewData.cemetery.territory} />
            <ReviewRow label="Cemetery Contact" value={reviewData.cemetery.contactName} />
            <ReviewRow label="Cemetery Phone" value={reviewData.cemetery.contactPhone} />
            <ReviewRow label="Cemetery Email" value={reviewData.cemetery.contactEmail} />
            <ReviewRow label="Section / Lot / Block / Space" value={reviewData.cemetery.sectionLotBlockSpace} />
            <ReviewRow label="Cemetery Approval" value={reviewData.cemetery.approval} />
          </ReviewGroup>

          <ReviewGroup title="Monument">
            <ReviewRow label="Monument Type" value={reviewData.monument.type} />
            <ReviewRow label="Material" value={reviewData.monument.material} />
            <ReviewRow label="Dimensions (W x H x D)" value={reviewData.monument.dimensions} />
            <ReviewRow label="Approximate Weight" value={reviewData.monument.weight} />
            <ReviewRow label="Base Dimensions" value={reviewData.monument.baseDimensions} />
            <ReviewRow label="Number of Pieces" value={reviewData.monument.numPieces} />
          </ReviewGroup>

          <ReviewGroup title="Setting Service">
            <ReviewRow label="Setting Requested" value={reviewData.settingService.settingRequested} />
            <ReviewRow label="Monument Currently Located At" value={reviewData.settingService.monumentLocationType} />
            <ReviewRow label="Pickup Address" value={reviewData.settingService.pickupAddress} />
            <ReviewRow label="Pickup Contact" value={reviewData.settingService.pickupContactName} />
            <ReviewRow label="Pickup Phone" value={reviewData.settingService.pickupPhone} />
            <ReviewRow label="Ready for Pickup" value={reviewData.settingService.readyForPickup} />
            <ReviewRow label="Requested Pickup Date" value={formatDateStr(reviewData.settingService.requestedPickupDate)} />
          </ReviewGroup>

          <ReviewGroup title="Requested Date">
            <ReviewRow label="Requested Setting Date" value={formatDateStr(reviewData.requestedDate.requestedSettingDate)} />
            <ReviewRow label="Alternate Date" value={formatDateStr(reviewData.requestedDate.alternateDate)} />
            <ReviewRow label="Deadline Date" value={formatDateStr(reviewData.requestedDate.deadlineDate)} />
            <ReviewRow label="Flexible Dates" value={reviewData.requestedDate.flexibleDates} />
            <ReviewRow label="Deadline Reason" value={reviewData.requestedDate.deadlineReason} />
            <div className="sm:col-span-2">
              <ReviewRow label="Special Instructions / Notes" value={reviewData.requestedDate.specialInstructions} />
            </div>
          </ReviewGroup>

          <div className="rounded-xl p-5" style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5EAF0" }}>
            <h4 className="text-sm font-semibold mb-4" style={{ color: "#1669A9" }}>Uploaded Documents</h4>
            {reviewData.documents.length === 0 ? (
              <p className="text-sm" style={{ color: "#6B7280" }}>No documents uploaded.</p>
            ) : (
              <ul className="space-y-1">
                {reviewData.documents.map(([label, file]) => (
                  <li key={label} className="text-sm flex items-center gap-2 flex-wrap" style={{ color: "#1A1A2E" }}>
                    <span style={{ color: "#1669A9" }}>📎</span>
                    <span className="font-medium">{label}:</span>
                    <span style={{ color: "#6B7280" }}>{file.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl p-5" style={{ backgroundColor: "#F0F7FF", border: "1px solid #BFDBFE" }}>
            <h4 className="text-sm font-semibold mb-4" style={{ color: "#1669A9" }}>Preventative Care Selection</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ReviewRow label="Package" value={carePackageLabel(reviewData.care.package)} />
              <ReviewRow label="Family Status" value={reviewData.care.familyStatus} />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleBackToForm}
              disabled={submittingMonument}
              className="flex-1 h-12 rounded-lg text-sm font-semibold transition disabled:opacity-60"
              style={{ backgroundColor: "#FFFFFF", border: "1px solid #D1D5DB", color: "#374151" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FFFFFF"; }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmit}
              disabled={submittingMonument}
              className="flex-1 h-12 rounded-lg text-sm font-semibold text-white transition disabled:opacity-60"
              style={{ backgroundColor: "#1669A9" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1E90CF")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1669A9")}
            >
              {submittingMonument ? "Submitting…" : "Submit Setting Request"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


  const mapRequest = (r) => ({
    id: r.id,
    customer: r.customerName,
    location: r.memorialLocation,
    pkg: r.packageType === "basic_annual" ? "Basic Annual $549" : "Premium Annual $749",
    status:
    r.status === "pending_approval"
      ? "Pending Approval"
      : r.status === "approved"
      ? "Approved"
      : r.status === "denied"
      ? "Denied"
      : "Completed",
    date: new Date(r.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = data.requests || [];
      setRawRequests(raw);
      const all = raw.map(mapRequest);
      setActive(all.filter((r) => r.status === "Pending Approval" || r.status === "Approved"));
      setCompleted(all.filter((r) => r.status === "Completed" || r.status === "Denied"));
    } catch (err) {
      toastError("Failed to load", "Could not fetch requests. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const stats = {
    total: rawRequests.length,
    revenue: rawRequests
      .filter((r) => r.status === "completed" || r.status === "approved")
      .reduce((s, r) => s + Number(r.packagePrice || 0), 0),
    activeCount: active.length,
    completedCount: rawRequests.filter((r) => r.status === "completed").length,
  };

  const handleLogout = () => {
    if (typeof onLogout === "function") onLogout();
  };

  const submitNewRequest = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const pkg = String(fd.get("pkg") || "basic_annual");
  
    const payload = new FormData();
    payload.append("packageType", pkg);
    payload.append("packagePrice", pkg === "basic_annual" ? "549" : "749");
    payload.append("customerName", String(fd.get("familyName") || ""));
    payload.append("customerPhone", String(fd.get("phoneNumber") || ""));
    payload.append("customerEmail", String(fd.get("emailAddress") || ""));
    payload.append("nameOnMemorial", String(fd.get("nameOnMemorial") || ""));
    payload.append("memorialSize", String(fd.get("memorialSize") || ""));
    payload.append("memorialType", String(fd.get("memorialType") || ""));
    payload.append("memorialLocation", String(fd.get("location") || ""));
    payload.append("cemeteryName", String(fd.get("cemeteryName") || ""));
    payload.append("section", String(fd.get("sectionGarden") || ""));
    payload.append("lot", String(fd.get("lotNumber") || ""));
    payload.append("space", String(fd.get("spaceNumber") || ""));
    payload.append("vaseInfo", String(fd.get("vaseInformation") || ""));
    payload.append("notes", String(fd.get("familyNotes") || ""));
    selectedPhotos.forEach((file) => payload.append("photos", file));
    try {
      setSubmitting(true);
      const { data } = await axios.post(`${BASE_URL}/create-request`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const selectedPkg = pkg;
      toastSuccess("Request submitted", "Your request is pending approval.");
      setShowNew(false);
      setSelectedPhotos([]);
      setSubmittedPkg(selectedPkg);
      setSubmittedRequestId(data.request?.id ?? data.id); // adjust to match your actual response shape
      setShowPayment(true);
      fetchRequests();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to submit request.";
      toastError("Submission failed", msg);
    } finally {
      setSubmitting(false);
    }
  };
  

  const inputStyle = {
    backgroundColor: "#F9FAFB",
    border: "1px solid #D1D5DB",
    color: "#1A1A2E",
    outline: "none",
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = "#1669A9";
    e.target.style.boxShadow = "0 0 0 3px rgba(22, 105, 169, 0.12)";
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = "#D1D5DB";
    e.target.style.boxShadow = "none";
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "#F5F7FA",
        fontFamily: "'Poppins', 'Roboto', system-ui, sans-serif",
      }}
    >
      {/* Decorative top bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 z-40"
        style={{ background: "linear-gradient(90deg, #1669A9, #1E90CF, #1669A9)" }}
      />

      {/* Top nav */}
      <header
        className="border-b"
        style={{
          borderColor: "#E5EAF0",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
            <Logo />
         <PartnerTeammemberButton/>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="hidden sm:block text-sm" style={{ color: "#333333" }}>
              Welcome,{" "}
              <span className="font-semibold" style={{ color: "#1669A9" }}>
                {partnerName}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="text-xs sm:text-sm font-medium transition"
              style={{ color: "#6B7280" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1669A9")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
            >
              Logout
            </button>
            <button
              onClick={() => {
                window.location.href = "/app/account";
              }}
              className="text-xs sm:text-sm font-medium transition"
              style={{ color: "#6B7280" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1669A9")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
            >
              My Account
            </button>
            <button
              onClick={() => {
                window.location.href = "/app/support";
              }}
              className="text-xs sm:text-sm font-medium transition"
              style={{ color: "#6B7280" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1669A9")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
            >
              Support
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
      <p className="sm:hidden text-sm mb-4" style={{ color: "#333333" }}>
          Welcome,{" "}
          <span className="font-semibold" style={{ color: "#1669A9" }}>
            {partnerName}
          </span>
        </p>

        {/* Primary section nav */}
             {/* Primary section nav */}
             <div className="flex gap-2 mb-8">
          {[
            { key: "restoration", label: "Restoration Requests" },
            { key: "monument", label: "Monument Setting" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setMainView(s.key)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition"
              style={{
                backgroundColor: mainView === s.key ? "#1669A9" : "#FFFFFF",
                color: mainView === s.key ? "#FFFFFF" : "#374151",
                border: "1px solid " + (mainView === s.key ? "#1669A9" : "#D1D5DB"),
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {mainView === "monument" ? (
  <MonumentSettingSection partnerName={partnerName} partner={partner} token={token} />
) : (
        <>
        {/* Header + CTA */}




        {/* Header + CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold" style={{ color: "#1A1A2E" }}>
              Restoration Requests
            </h1>
            <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
              Manage your memorial restoration requests
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNew(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg text-sm font-semibold text-white transition"
              style={{ backgroundColor: "#1669A9" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1E90CF")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1669A9")}
            >
              <span className="text-lg leading-none">+</span> New Request
            </button>
          </div>
        </div>

        {/* Active Requests */}
       {/* Stats */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
       <StatCard label="Total Memorials" sublabel="All requests in your inventory" value={stats.total} icon="📿" />
          <StatCard label="Est. Revenue Generated" sublabel="Across approved/completed requests" value={`$${stats.revenue.toLocaleString()}`} icon="$" />
          <StatCard label="Active Requests" sublabel="Currently in progress" value={stats.activeCount} icon="📅" />
          <StatCard label="Completed Requests" sublabel="All-time completed" value={stats.completedCount} icon="✓" />
        </div>

        {/* Active Requests */}
        <section
          className="rounded-2xl overflow-hidden mb-8"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5EAF0",
            boxShadow: "0 4px 24px rgba(22, 105, 169, 0.08), 0 1px 3px rgba(0,0,0,0.06)",
            borderLeft: "4px solid #1669A9",
          }}
        >
          <div
            className="px-5 sm:px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor: "#E5EAF0" }}
          >
            <h2 className="text-lg font-semibold" style={{ color: "#1A1A2E" }}>
              Active Requests
            </h2>
            <span className="text-xs font-medium" style={{ color: "#6B7280" }}>
              {active.length} total
            </span>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-center text-sm" style={{ color: "#6B7280" }}>
              Loading requests…
            </div>
          ) : active.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm" style={{ color: "#6B7280" }}>
              No active requests yet.
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead style={{ backgroundColor: "#F9FAFB" }}>
                    <tr className="text-left" style={{ color: "#6B7280" }}>
                      <th className="px-6 py-3 font-medium">Customer</th>
                      <th className="px-6 py-3 font-medium">Memorial Location</th>
                      <th className="px-6 py-3 font-medium">Package</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.map((r) => (
                      <tr key={r.id} className="border-t" style={{ borderColor: "#E5EAF0" }}>
                        <td className="px-6 py-4 font-medium" style={{ color: "#1A1A2E" }}>
                          {r.customer}
                        </td>
                        <td className="px-6 py-4" style={{ color: "#333333" }}>
                          {r.location}
                        </td>
                        <td className="px-6 py-4" style={{ color: "#1A1A2E" }}>
                          {r.pkg}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" style={{ color: "#333333" }}>
                          {r.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y">
                {active.map((r) => (
                  <div
                    key={r.id}
                    className="p-5 space-y-2"
                    style={{ borderTop: "1px solid #E5EAF0" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-semibold" style={{ color: "#1A1A2E" }}>
                        {r.customer}
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="text-sm" style={{ color: "#333333" }}>
                      {r.location}
                    </div>
                    <div className="text-sm" style={{ color: "#1A1A2E" }}>
                      {r.pkg}
                    </div>
                    <div className="text-xs" style={{ color: "#6B7280" }}>
                      Submitted {r.date}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* Completed Requests */}
        <section
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5EAF0",
            boxShadow: "0 4px 24px rgba(22, 105, 169, 0.04), 0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div
            className="px-5 sm:px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor: "#E5EAF0" }}
          >
            <h2 className="text-lg font-semibold" style={{ color: "#1A1A2E" }}>
            Completed / Denied Requests
            </h2>
            <span className="text-xs font-medium" style={{ color: "#6B7280" }}>
              {completed.length} total
            </span>
          </div>

          {completed.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm" style={{ color: "#6B7280" }}>
              No completed requests yet.
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead style={{ backgroundColor: "#F9FAFB" }}>
                    <tr className="text-left" style={{ color: "#6B7280" }}>
                      <th className="px-6 py-3 font-medium">Customer</th>
                      <th className="px-6 py-3 font-medium">Memorial Location</th>
                      <th className="px-6 py-3 font-medium">Package</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium">Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completed.map((r) => (
                      <tr key={r.id} className="border-t" style={{ borderColor: "#E5EAF0" }}>
                        <td className="px-6 py-4" style={{ color: "#333333" }}>
                          {r.customer}
                        </td>
                        <td className="px-6 py-4" style={{ color: "#333333" }}>
                          {r.location}
                        </td>
                        <td className="px-6 py-4" style={{ color: "#333333" }}>
                          {r.pkg}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" style={{ color: "#333333" }}>
                          {r.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden">
                {completed.map((r) => (
                  <div
                    key={r.id}
                    className="p-5 space-y-2"
                    style={{ borderTop: "1px solid #E5EAF0" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-semibold" style={{ color: "#333333" }}>
                        {r.customer}
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="text-sm" style={{ color: "#333333" }}>
                      {r.location}
                    </div>
                    <div className="text-sm" style={{ color: "#333333" }}>
                      {r.pkg}
                    </div>
                    <div className="text-xs" style={{ color: "#6B7280" }}>
                      Completed {r.date}
                    </div>
                  </div>
                              ))}
                              </div>
                            </>
                          )}
                        </section>
                        </>
                        )}
                      </main>

      {/* New Request Modal */}
      {showNew && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(26, 26, 46, 0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowNew(false)}
        >
          <div
            className="rounded-2xl w-full max-w-lg flex flex-col"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5EAF0",
              boxShadow: "0 20px 60px rgba(22, 105, 169, 0.2), 0 4px 12px rgba(0,0,0,0.1)",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed header */}
            <div
              className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 flex-shrink-0 border-b"
              style={{ borderColor: "#E5EAF0" }}
            >
              <h3 className="text-xl font-semibold" style={{ color: "#1A1A2E" }}>
                New Restoration Request
              </h3>
              <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
                Submit a new memorial restoration request.
              </p>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 sm:px-8">
              <form className="space-y-5 py-6" onSubmit={submitNewRequest}>
              <div>
  <label className="block text-sm font-medium mb-2" style={{ color: "#374151" }}>
    Family / Contact Name
  </label>
  <input
    name="familyName"
    required
    className="w-full h-12 px-4 rounded-lg text-sm transition"
    style={inputStyle}
    onFocus={handleInputFocus}
    onBlur={handleInputBlur}
  />
</div>

<div>
  <label className="block text-sm font-medium mb-2" style={{ color: "#374151" }}>
    Name on Memorial
  </label>
  <input
    name="nameOnMemorial"
    required
    placeholder="As it appears on the memorial"
    className="w-full h-12 px-4 rounded-lg text-sm transition"
    style={inputStyle}
    onFocus={handleInputFocus}
    onBlur={handleInputBlur}
  />
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>
    <label className="block text-sm font-medium mb-2" style={{ color: "#374151" }}>
      Memorial Size
    </label>
    <input
      name="memorialSize"
      placeholder="e.g. 24&quot; x 12&quot;"
      className="w-full h-12 px-4 rounded-lg text-sm transition"
      style={inputStyle}
      onFocus={handleInputFocus}
      onBlur={handleInputBlur}
    />
  </div>
  <div>
    <label className="block text-sm font-medium mb-2" style={{ color: "#374151" }}>
      Memorial Type / Material
    </label>
    <input
      name="memorialType"
      placeholder="e.g. Upright, Granite"
      className="w-full h-12 px-4 rounded-lg text-sm transition"
      style={inputStyle}
      onFocus={handleInputFocus}
      onBlur={handleInputBlur}
    />
  </div>
</div>

<div>
  <label className="block text-sm font-medium mb-2" style={{ color: "#374151" }}>
    Cemetery Name
  </label>
  <input
    name="cemeteryName"
    required
    className="w-full h-12 px-4 rounded-lg text-sm transition"
    style={inputStyle}
    onFocus={handleInputFocus}
    onBlur={handleInputBlur}
  />
</div>

<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <div>
    <label className="block text-sm font-medium mb-2" style={{ color: "#374151" }}>
      Section / Garden
    </label>
    <input
      name="sectionGarden"
      className="w-full h-12 px-4 rounded-lg text-sm transition"
      style={inputStyle}
      onFocus={handleInputFocus}
      onBlur={handleInputBlur}
    />
  </div>
  <div>
    <label className="block text-sm font-medium mb-2" style={{ color: "#374151" }}>
      Lot Number
    </label>
    <input
      name="lotNumber"
      className="w-full h-12 px-4 rounded-lg text-sm transition"
      style={inputStyle}
      onFocus={handleInputFocus}
      onBlur={handleInputBlur}
    />
  </div>
  <div>
    <label className="block text-sm font-medium mb-2" style={{ color: "#374151" }}>
      Space Number
    </label>
    <input
      name="spaceNumber"
      className="w-full h-12 px-4 rounded-lg text-sm transition"
      style={inputStyle}
      onFocus={handleInputFocus}
      onBlur={handleInputBlur}
    />
  </div>
</div>

<div>
  <label className="block text-sm font-medium mb-2" style={{ color: "#374151" }}>
    Vase Information
  </label>
  <input
    name="vaseInformation"
    placeholder="e.g. single bronze vase, attached"
    className="w-full h-12 px-4 rounded-lg text-sm transition"
    style={inputStyle}
    onFocus={handleInputFocus}
    onBlur={handleInputBlur}
  />
</div>
<div>
  <label
    className="block text-sm font-medium mb-2"
    style={{ color: "#374151" }}
  >
    Phone Number
  </label>
  <input
    name="phoneNumber"
    type="tel"
    required
    placeholder="(000) 000-0000"
    className="w-full h-12 px-4 rounded-lg text-sm transition"
    style={inputStyle}
    onFocus={handleInputFocus}
    onBlur={handleInputBlur}
  />
</div>

<div>
  <label
    className="block text-sm font-medium mb-2"
    style={{ color: "#374151" }}
  >
    Email Address
  </label>
  <input
    name="emailAddress"
    type="email"
    required
    placeholder="name@example.com"
    className="w-full h-12 px-4 rounded-lg text-sm transition"
    style={inputStyle}
    onFocus={handleInputFocus}
    onBlur={handleInputBlur}
  />
</div>

                <div>
  <label
    className="block text-sm font-medium mb-2"
    style={{ color: "#374151" }}
  >
    Memorial Location
  </label>
  <select
    name="location"
    required
    defaultValue=""
    className="w-full h-12 px-4 rounded-lg text-sm transition"
    style={inputStyle}
    onFocus={handleInputFocus}
    onBlur={handleInputBlur}
  >
    <option value="" disabled>Select a location…</option>
    <option value="Flanner Buchanan - Carmel Funeral and Cremation">Flanner Buchanan - Carmel Funeral and Cremation</option>
    <option value="Flanner Buchanan - Decatur Township">Flanner Buchanan - Decatur Township</option>
    <option value="Flanner Buchanan - Geist Funeral and Cremation">Flanner Buchanan - Geist Funeral and Cremation</option>
    <option value="Flanner Buchanan - Hamilton Memorial Park Funeral and Cremation">Flanner Buchanan - Hamilton Memorial Park Funeral and Cremation</option>
    <option value="Flanner Buchanan - Oaklawn Funeral and Cremation">Flanner Buchanan - Oaklawn Funeral and Cremation</option>
    <option value="Flanner Buchanan - Floral Park Funeral and Cremation">Flanner Buchanan - Floral Park Funeral and Cremation</option>
    <option value="Flanner Buchanan - Montcalm">Flanner Buchanan - Montcalm</option>
    <option value="Flanner Buchanan - Speedway Funeral and Cremation">Flanner Buchanan - Speedway Funeral and Cremation</option>
    <option value="Flanner Buchanan - Washington Park North Funeral and Cremation">Flanner Buchanan - Washington Park North Funeral and Cremation</option>
    <option value="Flanner Buchanan - Washington Park East Funeral and Cremation">Flanner Buchanan - Washington Park East Funeral and Cremation</option>
    <option value="Flanner Buchanan - Broad Ripple Funeral and Cremation">Flanner Buchanan - Broad Ripple Funeral and Cremation</option>
    <option value="Flanner Buchanan - Zionsville Funeral and Cremation">Flanner Buchanan - Zionsville Funeral and Cremation</option>
    <option value="Flanner Buchanan - Market Street">Flanner Buchanan - Market Street</option>
    <option value="Washington Park Cemetery">Washington Park Cemetery</option>
  </select>
</div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#374151" }}
                  >
                    Package
                  </label>
                  <select
                    name="pkg"
                    className="w-full h-12 px-4 rounded-lg text-sm transition"
                    style={inputStyle}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                  >
                    <option value="basic_annual">Basic Annual $549</option>
                    <option value="premium_annual">Premium Annual $749</option>
                  </select>
                </div>

              

                <div>
  <label
    className="block text-sm font-medium mb-2"
    style={{ color: "#374151" }}
  >
    Family Notes / Special Concerns
  </label>
  <textarea
    name="familyNotes"
    rows={3}
    placeholder="Any additional details or special concerns..."
    className="w-full px-4 py-3 rounded-lg text-sm transition resize-none"
    style={inputStyle}
    onFocus={handleInputFocus}
    onBlur={handleInputBlur}
  />
</div>
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: "#374151" }}
                  >
                    Photos{" "}
                    <span className="text-xs font-normal" style={{ color: "#6B7280" }}>
                      (optional · up to 10 · jpg/png/webp · 10 MB each)
                    </span>
                  </label>

                  <input
                    id="photo-upload"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const incoming = Array.from(e.target.files || []);
                      setSelectedPhotos((prev) => {
                        const existing = prev.map((f) => f.name + f.size);
                        const fresh = incoming.filter(
                          (f) => !existing.includes(f.name + f.size)
                        );
                        return [...prev, ...fresh].slice(0, 10);
                      });
                      e.target.value = "";
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => document.getElementById("photo-upload").click()}
                    className="w-full h-12 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: "#F9FAFB",
                      border: "1px dashed #D1D5DB",
                      color: "#6B7280",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#1669A9";
                      e.currentTarget.style.color = "#1669A9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#D1D5DB";
                      e.currentTarget.style.color = "#6B7280";
                    }}
                  >
                    <span style={{ color: "#1669A9", fontSize: "18px", lineHeight: 1 }}>
                      +
                    </span>
                    {selectedPhotos.length === 0
                      ? "Choose photos"
                      : `Add more (${selectedPhotos.length}/10)`}
                  </button>

                  {selectedPhotos.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {selectedPhotos.map((file, i) => {
                        const url = URL.createObjectURL(file);
                        return (
                          <div
                            key={i}
                            className="relative group rounded-lg overflow-hidden"
                            style={{
                              aspectRatio: "1",
                              border: "1px solid #E5EAF0",
                            }}
                          >
                            <img
                              src={url}
                              alt={file.name}
                              className="w-full h-full object-cover"
                              onLoad={() => URL.revokeObjectURL(url)}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedPhotos((prev) =>
                                  prev.filter((_, idx) => idx !== i)
                                )
                              }
                              className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition"
                              style={{
                                backgroundColor: "rgba(255,255,255,0.95)",
                                color: "#DC2626",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#DC2626";
                                e.currentTarget.style.color = "#FFFFFF";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "rgba(255,255,255,0.95)";
                                e.currentTarget.style.color = "#DC2626";
                              }}
                              title="Remove"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNew(false)}
                    className="flex-1 h-12 rounded-lg text-sm font-semibold transition"
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #D1D5DB",
                      color: "#374151",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F9FAFB";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#FFFFFF";
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 h-12 rounded-lg text-sm font-semibold text-white transition disabled:opacity-60"
                    style={{ backgroundColor: "#1669A9" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#1E90CF")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#1669A9")
                    }
                  >
                    {submitting ? "Submitting…" : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Payment Modal */}
{showPayment && submittedPkg && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ backgroundColor: "rgba(26, 26, 46, 0.5)", backdropFilter: "blur(4px)" }}
  >
    <div
      className="rounded-2xl w-full max-w-md"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5EAF0",
        boxShadow: "0 20px 60px rgba(22, 105, 169, 0.2), 0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      {/* Green success bar */}
      <div
        className="h-1.5 rounded-t-2xl"
        style={{ background: "linear-gradient(90deg, #059669, #10B981)" }}
      />

      <div className="px-8 py-8 text-center">
        {/* Checkmark icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ backgroundColor: "#D1FAE5" }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h3 className="text-xl font-semibold mb-2" style={{ color: "#1A1A2E" }}>
          Request Submitted!
        </h3>
        <p className="text-sm mb-6" style={{ color: "#6B7280" }}>
          Complete your purchase to activate the restoration service.
        </p>

        {/* Package box */}
        <div
          className="rounded-xl p-5 mb-6 text-left"
          style={{
            backgroundColor: "#F0F7FF",
            border: "1px solid #BFDBFE",
          }}
        >
          <div className="text-xs font-medium mb-1" style={{ color: "#6B7280" }}>
            Selected Package
          </div>
          <div className="text-lg font-semibold" style={{ color: "#1A1A2E" }}>
            {submittedPkg === "basic_annual" ? "Basic Annual" : "Premium Annual"}
          </div>
          <div className="text-2xl font-bold mt-1" style={{ color: "#1669A9" }}>
          {submittedPkg === "basic_annual" ? "$549" : "$749"}
            <span className="text-sm font-normal ml-1" style={{ color: "#6B7280" }}>/year</span>
          </div>
        </div>

        {/* Pay Now button */}
        <label className="flex items-start gap-3 text-left mb-4 cursor-pointer">
          <input
            type="checkbox"
            id="renewal-agree"
            onChange={(e) => {
              document.getElementById("pay-now-btn").style.opacity = e.target.checked ? "1" : "0.4";
              document.getElementById("pay-now-btn").style.pointerEvents = e.target.checked ? "auto" : "none";
              document.getElementById("pay-later-btn").style.display = e.target.checked ? "block" : "none";
            }}
            className="mt-0.5 flex-shrink-0"
            style={{ width: 16, height: 16, accentColor: "#1669A9" }}
          />
          <span className="text-xs" style={{ color: "#374151" }}>
            I understand that this is an annual memorial restoration membership that will automatically renew each year using my payment method on file unless I cancel prior to the renewal date by contacting Lasting Legacy Cleaners or my participating memorial park.
          </span>
        </label>
        <button
  id="pay-now-btn"
  type="button"
  disabled={paySending}
  onClick={sendPaymentRequest}
  className="flex items-center justify-center gap-2 w-full h-12 rounded-lg text-sm font-semibold text-white mb-3 transition disabled:opacity-60"
  style={{ backgroundColor: "#1669A9", opacity: "0.4", pointerEvents: "none" }}
  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1E90CF")}
  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1669A9")}
>
  {paySending ? "Sending…" : "Pay Now →"}
</button>
       
       {/* Skip link */}
       <button
         id="pay-later-btn"
         onClick={() => setShowPayment(false)}
         className="w-full text-sm transition"
         style={{ color: "#6B7280", display: "none" }}
         onMouseEnter={(e) => (e.currentTarget.style.color = "#1669A9")}
         onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
       >
         I'll pay later
       </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}