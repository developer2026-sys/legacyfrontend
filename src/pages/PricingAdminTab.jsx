import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../baseurl";
import { useToast } from "../components/useToast";

const inputStyle = {
  width: "100%",
  height: 40,
  padding: "0 11px",
  border: "1px solid #D1D5DB",
  borderRadius: 7,
  background: "#FFFFFF",
  color: "#1A1A2E",
  fontSize: 13,
};
const labelStyle = {
  display: "block",
  color: "#4B5563",
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 6,
};
const localDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const money = (value) => `$${Number(value || 0).toFixed(2)}`;

export default function PricingAdminTab({ token }) {
  const { success, error } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPhotoSetting, setSavingPhotoSetting] = useState(false);
  const [apAccountId, setApAccountId] = useState("");
  const [apDestinationDraft, setApDestinationDraft] = useState("");
  const [savingApDestination, setSavingApDestination] = useState(false);
  const [visibilityAccountId, setVisibilityAccountId] = useState("");
  const [visibilityDraft, setVisibilityDraft] = useState(null);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [form, setForm] = useState({
    clientAccountId: "",
    locationId: "",
    packageId: "",
    packageName: "",
    restorationPrice: "",
    revenueShare: "",
    effectiveDate: localDate(),
  });

  const load = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/admin/pricing`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts(data.accounts || []);
      setVisibilityAccountId((current) => current || String(data.accounts?.[0]?.id || ""));
      setApAccountId((current) => current || String(data.accounts?.[0]?.id || ""));
      setApDestinationDraft((current) => current || data.accounts?.[0]?.accountsPayableEmail || "");
      setPackages(data.packages || []);
      setPricing(data.pricing || []);
    } catch (e) {
      error("Pricing unavailable", e?.response?.data?.message || "Could not load pricing configuration.");
    } finally {
      setLoading(false);
    }
  }, [token, error]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const selectedAccount = accounts.find((account) => String(account.id) === form.clientAccountId);
  const apAccount = accounts.find((account) => String(account.id) === apAccountId);
  const visibilityAccount = accounts.find((account) => String(account.id) === visibilityAccountId);
  const visibilitySettings = visibilityDraft || {
    familyAdvisorPriceVisibility: visibilityAccount?.familyAdvisorPriceVisibility || "none",
    clientAdminPriceVisibility: visibilityAccount?.clientAdminPriceVisibility || "none",
  };
  const properties = (selectedAccount?.locations || []).filter((location) => location.status === "active");
  const selectedPackage = packages.find((item) => String(item.id) === form.packageId);
  const invoicePreview = Number(form.restorationPrice || 0) - Number(form.revenueShare || 0);
  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleApAccountChange = (event) => {
    const nextId = event.target.value;
    setApAccountId(nextId);
    const nextAccount = accounts.find((account) => String(account.id) === nextId);
    setApDestinationDraft(nextAccount?.accountsPayableEmail || "");
  };

  const beginChange = (row) => {
    setForm({
      clientAccountId: String(row.clientAccountId),
      locationId: String(row.locationId),
      packageId: String(row.packageId),
      packageName: "",
      restorationPrice: String(row.restorationPrice),
      revenueShare: String(row.revenueShare),
      effectiveDate: localDate(),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async (event) => {
    event.preventDefault();
    const price = Number(form.restorationPrice);
    const share = Number(form.revenueShare);
    if (!form.clientAccountId || !form.locationId || (!form.packageId && !form.packageName.trim())) {
      error("Missing details", "Choose a client, property, and package.");
      return;
    }
    if (!Number.isFinite(price) || !Number.isFinite(share) || price < 0 || share < 0 || share > price) {
      error("Check the amounts", "Revenue share must be between zero and the restoration price.");
      return;
    }
    try {
      setSaving(true);
      await axios.post(`${BASE_URL}/admin/pricing`, {
        clientAccountId: Number(form.clientAccountId),
        locationId: Number(form.locationId),
        ...(form.packageId ? { packageId: Number(form.packageId) } : { packageName: form.packageName.trim() }),
        restorationPrice: price,
        revenueShare: share,
        effectiveDate: form.effectiveDate,
      }, { headers: { Authorization: `Bearer ${token}` } });
      success("Pricing saved", "A new effective-dated price was recorded. Existing requests were not changed.");
      setForm((current) => ({
        ...current,
        packageId: "",
        packageName: "",
        restorationPrice: "",
        revenueShare: "",
        effectiveDate: localDate(),
      }));
      await load();
    } catch (e) {
      error("Save failed", e?.response?.data?.message || "Could not save pricing.");
    } finally {
      setSaving(false);
    }
  };

  const setPhotosRequired = async (required) => {
    if (!selectedAccount) return;
    try {
      setSavingPhotoSetting(true);
      await axios.patch(`${BASE_URL}/admin/client-accounts/${selectedAccount.id}/request-settings`, {
        requestPhotosRequired: required,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setAccounts((current) => current.map((account) =>
        account.id === selectedAccount.id ? { ...account, requestPhotosRequired: required } : account
      ));
      success("Request setting updated", required
        ? "Advisors must attach at least one photo to submit requests for this client."
        : "Photos are optional for this client’s requests.");
    } catch (e) {
      error("Setting not saved", e?.response?.data?.message || "Could not update the photo requirement.");
    } finally {
      setSavingPhotoSetting(false);
    }
  };

  const saveApDestination = async () => {
    if (!apAccount) return;
    try {
      setSavingApDestination(true);
      const { data } = await axios.patch(
        `${BASE_URL}/admin/client-accounts/${apAccount.id}/accounts-payable`,
        { accountsPayableEmail: apDestinationDraft.trim() || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAccounts((current) => current.map((account) =>
        account.id === apAccount.id ? { ...account, accountsPayableEmail: data.accountsPayableEmail } : account
      ));
      success("AP destination saved", data.accountsPayableEmail
        ? `Approved invoices will be emailed to ${data.accountsPayableEmail}.`
        : "The accounts-payable destination was cleared.");
    } catch (e) {
      error("Destination not saved", e?.response?.data?.message || "Could not update the AP email.");
    } finally {
      setSavingApDestination(false);
    }
  };

  const savePriceVisibility = async () => {
    if (!visibilityAccount) return;
    try {
      setSavingVisibility(true);
      const { data } = await axios.patch(
        `${BASE_URL}/admin/client-accounts/${visibilityAccount.id}/price-visibility`,
        visibilitySettings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAccounts((current) => current.map((account) =>
        account.id === visibilityAccount.id ? { ...account, ...data } : account
      ));
      success("Visibility saved", "Price visibility was updated for this client.");
    } catch (e) {
      error("Setting not saved", e?.response?.data?.message || "Could not update price visibility.");
    } finally {
      setSavingVisibility(false);
    }
  };

  return (
    <section style={{ background: "#FFFFFF", border: "1px solid #E5EAF0", borderTop: "3px solid #1669A9", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <div style={{ padding: "18px 20px", borderBottom: "1px solid #E5EAF0" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>Pricing configuration</div>
        <p style={{ margin: "5px 0 0", color: "#6B7280", fontSize: 12.5 }}>
          Prices are versioned by client, property, package, and effective date. Saving a change never updates submitted requests.
        </p>
      </div>

      <form onSubmit={save} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, padding: 20, background: "#F8FAFC", borderBottom: "1px solid #E5EAF0" }}>
        <label>
          <span style={labelStyle}>Client</span>
          <select required value={form.clientAccountId} onChange={(event) => setForm((current) => ({ ...current, clientAccountId: event.target.value, locationId: "" }))} style={inputStyle}>
            <option value="">Select client…</option>
            {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
          </select>
        </label>
        <label>
          <span style={labelStyle}>Property</span>
          <select required value={form.locationId} onChange={setField("locationId")} style={inputStyle} disabled={!form.clientAccountId}>
            <option value="">Select property…</option>
            {properties.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
          </select>
        </label>
        <label>
          <span style={labelStyle}>Package</span>
          <select value={form.packageId} onChange={(event) => setForm((current) => ({ ...current, packageId: event.target.value, packageName: "" }))} style={inputStyle}>
            <option value="">＋ Add a package name</option>
            {packages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        {!form.packageId && (
          <label>
            <span style={labelStyle}>New package name</span>
            <input required maxLength={255} value={form.packageName} onChange={setField("packageName")} placeholder="e.g. Annual restoration" style={inputStyle} />
          </label>
        )}
        <label>
          <span style={labelStyle}>Restoration price</span>
          <input required type="number" min="0" step="0.01" value={form.restorationPrice} onChange={setField("restorationPrice")} style={inputStyle} />
        </label>
        <label>
          <span style={labelStyle}>Revenue share (fixed $)</span>
          <input required type="number" min="0" step="0.01" value={form.revenueShare} onChange={setField("revenueShare")} style={inputStyle} />
        </label>
        <label>
          <span style={labelStyle}>Effective date</span>
          <input required type="date" value={form.effectiveDate} onChange={setField("effectiveDate")} style={inputStyle} />
        </label>
        <div style={{ alignSelf: "end", paddingBottom: 1 }}>
          <div style={{ color: "#6B7280", fontSize: 11, marginBottom: 7 }}>
            Invoice preview: <strong style={{ color: "#1669A9" }}>{money(invoicePreview)}</strong>
            {selectedPackage ? ` · ${selectedPackage.name}` : ""}
          </div>
          <button type="submit" disabled={saving} style={{ height: 40, padding: "0 16px", border: 0, borderRadius: 7, background: "#1669A9", color: "#FFFFFF", fontSize: 12.5, fontWeight: 600, cursor: saving ? "wait" : "pointer" }}>
            {saving ? "Saving…" : "Save pricing"}
          </button>
        </div>
      </form>

      {selectedAccount && (
        <div style={{ margin: "0 20px 18px", padding: "12px 14px", border: "1px solid #E5EAF0", borderRadius: 8, color: "#374151", fontSize: 12.5 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: savingPhotoSetting ? "wait" : "pointer" }}>
            <input
              type="checkbox"
              checked={Boolean(selectedAccount.requestPhotosRequired)}
              disabled={savingPhotoSetting}
              onChange={(event) => setPhotosRequired(event.target.checked)}
            />
            Require at least one photo before advisors can submit requests for {selectedAccount.name}
            {savingPhotoSetting ? " (saving…)" : ""}
          </label>
        </div>
      )}

      <div style={{ margin: "0 20px 18px", padding: 14, border: "1px solid #E5EAF0", borderRadius: 8, background: "#FAFCFE" }}>
        <div style={{ color: "#1A1A2E", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Accounts-payable invoice destination</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, alignItems: "end" }}>
          <label>
            <span style={labelStyle}>Client</span>
             <select value={apAccountId} onChange={handleApAccountChange} style={inputStyle}>
              <option value="">Select client…</option>
              {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
            </select>
          </label>
          <label>
            <span style={labelStyle}>AP email address</span>
            <input
              type="email"
              maxLength={255}
              value={apDestinationDraft}
              onChange={(event) => setApDestinationDraft(event.target.value)}
              placeholder="accounts-payable@example.com"
              style={inputStyle}
              disabled={!apAccount}
            />
          </label>
          <button
            type="button"
            onClick={saveApDestination}
            disabled={!apAccount || savingApDestination}
            style={{ height: 40, padding: "0 16px", border: 0, borderRadius: 7, background: savingApDestination ? "#94A3B8" : "#1669A9", color: "#FFFFFF", fontSize: 12.5, fontWeight: 600, cursor: savingApDestination ? "wait" : "pointer" }}
          >
            {savingApDestination ? "Saving…" : "Save AP destination"}
          </button>
        </div>
        <p style={{ margin: "9px 0 0", color: "#6B7280", fontSize: 11.5 }}>
          When a request is approved, its invoice is emailed to this address. Leaving it blank disables AP email for this client.
        </p>
      </div>

      <div style={{ margin: "0 20px 18px", padding: 14, border: "1px solid #E5EAF0", borderRadius: 8, background: "#FAFCFE" }}>
        <div style={{ color: "#1A1A2E", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Price visibility by client</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, alignItems: "end" }}>
          <label>
            <span style={labelStyle}>Client</span>
            <select
              value={visibilityAccountId}
              onChange={(event) => {
                const nextId = event.target.value;
                const nextAccount = accounts.find((account) => String(account.id) === nextId);
                setVisibilityAccountId(nextId);
                setVisibilityDraft({
                  familyAdvisorPriceVisibility: nextAccount?.familyAdvisorPriceVisibility || "none",
                  clientAdminPriceVisibility: nextAccount?.clientAdminPriceVisibility || "none",
                });
              }}
              style={inputStyle}
            >
              <option value="">Select client…</option>
              {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
            </select>
          </label>
          <label>
            <span style={labelStyle}>Family Advisors see</span>
            <select
              value={visibilitySettings.familyAdvisorPriceVisibility}
              onChange={(event) => setVisibilityDraft((current) => ({ ...current, familyAdvisorPriceVisibility: event.target.value }))}
              style={inputStyle}
              disabled={!visibilityAccount}
            >
              <option value="none">None</option>
              <option value="customer_retail">Customer retail price</option>
              <option value="restoration">Restoration price</option>
            </select>
          </label>
          <label>
            <span style={labelStyle}>Client Admins see</span>
            <select
              value={visibilitySettings.clientAdminPriceVisibility}
              onChange={(event) => setVisibilityDraft((current) => ({ ...current, clientAdminPriceVisibility: event.target.value }))}
              style={inputStyle}
              disabled={!visibilityAccount}
            >
              <option value="none">None</option>
              <option value="customer_retail">Customer retail price</option>
              <option value="restoration">Restoration price</option>
            </select>
          </label>
          <button
            type="button"
            onClick={savePriceVisibility}
            disabled={!visibilityAccount || savingVisibility}
            style={{ height: 40, padding: "0 16px", border: 0, borderRadius: 7, background: savingVisibility ? "#94A3B8" : "#1669A9", color: "#FFFFFF", fontSize: 12.5, fontWeight: 600, cursor: savingVisibility ? "wait" : "pointer" }}
          >
            {savingVisibility ? "Saving…" : "Save visibility"}
          </button>
        </div>
        <p style={{ margin: "9px 0 0", color: "#6B7280", fontSize: 11.5 }}>
          New and existing clients default to None. Family Advisors never receive invoice amounts or revenue-share values.
        </p>
      </div>

      <div style={{ padding: "15px 20px", borderBottom: "1px solid #E5EAF0", color: "#1A1A2E", fontWeight: 700, fontSize: 13 }}>
        Price history <span style={{ marginLeft: 6, color: "#9CA3AF", fontWeight: 400 }}>({pricing.length})</span>
      </div>
      {loading ? (
        <div style={{ padding: 32, color: "#6B7280", textAlign: "center", fontSize: 13 }}>Loading prices…</div>
      ) : pricing.length === 0 ? (
        <div style={{ padding: 32, color: "#6B7280", textAlign: "center", fontSize: 13 }}>No prices configured yet. Add the first client/property/package price above.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead><tr style={{ background: "#F8FAFC", color: "#6B7280", textAlign: "left" }}>
              {["Client", "Property", "Package", "Restoration", "Revenue share", "Invoice", "Effective", "Action"].map((heading) => <th key={heading} style={{ padding: "11px 14px", whiteSpace: "nowrap", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.06em" }}>{heading}</th>)}
            </tr></thead>
            <tbody>
              {pricing.map((row) => (
                <tr key={row.id} style={{ borderTop: "1px solid #E5EAF0" }}>
                  <td style={{ padding: "12px 14px" }}>{row.clientAccount?.name || `Client #${row.clientAccountId}`}</td>
                  <td style={{ padding: "12px 14px" }}>{row.location?.name || `Property #${row.locationId}`}</td>
                  <td style={{ padding: "12px 14px" }}>{row.package?.name || `Package #${row.packageId}`}</td>
                  <td style={{ padding: "12px 14px" }}>{money(row.restorationPrice)}</td>
                  <td style={{ padding: "12px 14px" }}>{money(row.revenueShare)}</td>
                  <td style={{ padding: "12px 14px", color: "#1669A9", fontWeight: 700 }}>{money(Number(row.restorationPrice) - Number(row.revenueShare))}</td>
                  <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>{row.effectiveDate}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <button type="button" onClick={() => beginChange(row)} style={{ border: "1px solid #C7DDF0", borderRadius: 6, padding: "5px 10px", color: "#1669A9", background: "#F0F7FF", cursor: "pointer", fontSize: 11.5 }}>Change price</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}