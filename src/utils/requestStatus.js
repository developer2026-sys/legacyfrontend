export const REQUEST_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "NEEDS_INFORMATION",
  "APPROVED",
  "REJECTED",
  "INVOICE_PENDING",
  "PAYMENT_PENDING",
  "PAID",
  "PENDING_SCHEDULING",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

export const REQUEST_STATUS_LABELS = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
    
  APPROVED: "Approved",
  REJECTED: "Rejected",
  INVOICE_PENDING: "Invoice Pending",
  PAYMENT_PENDING: "Payment Pending",
  PAID: "Paid",
  PENDING_SCHEDULING: "Pending Scheduling",
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const REQUEST_STATUS_TRANSITIONS = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["UNDER_REVIEW", "NEEDS_INFORMATION", "APPROVED", "REJECTED", "CANCELLED"],
  UNDER_REVIEW: ["NEEDS_INFORMATION", "APPROVED", "REJECTED", "CANCELLED"],
  NEEDS_INFORMATION: ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["INVOICE_PENDING", "PAYMENT_PENDING", "CANCELLED"],
  REJECTED: [],
  INVOICE_PENDING: ["PAYMENT_PENDING", "CANCELLED"],
  PAYMENT_PENDING: ["CANCELLED"],
  PAID: ["SCHEDULED", "CANCELLED"],
  PENDING_SCHEDULING: ["SCHEDULED", "CANCELLED"],
  SCHEDULED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const REQUEST_STATUS_COLORS = {
  DRAFT: { bg: "#F3F4F6", color: "#6B7280", border: "#E5E7EB" },
  SUBMITTED: { bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
  UNDER_REVIEW: { bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
  NEEDS_INFORMATION: { bg: "#FFF7ED", color: "#9A3412", border: "#FED7AA" },
  APPROVED: { bg: "#DBEAFE", color: "#1669A9", border: "#BFDBFE" },
  REJECTED: { bg: "#FEE2E2", color: "#991B1B", border: "#FECACA" },
  INVOICE_PENDING: { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  PAYMENT_PENDING: { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  PAID: { bg: "#D1FAE5", color: "#065F46", border: "#A7F3D0" },
  PENDING_SCHEDULING: { bg: "#EDE9FE", color: "#5B21B6", border: "#DDD6FE" },
  SCHEDULED: { bg: "#DBEAFE", color: "#1669A9", border: "#BFDBFE" },
  IN_PROGRESS: { bg: "#E0F2FE", color: "#075985", border: "#BAE6FD" },
  COMPLETED: { bg: "#D1FAE5", color: "#065F46", border: "#A7F3D0" },
  CANCELLED: { bg: "#FEE2E2", color: "#991B1B", border: "#FECACA" },
};

export const getRequestStatusLabel = (status) =>
  REQUEST_STATUS_LABELS[status] || String(status || "Unknown").replaceAll("_", " ");