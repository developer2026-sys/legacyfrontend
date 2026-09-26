import { useState } from "react";

/**
 * Lasting Legacy Cleaners — Legal Pages (Privacy Policy + Messaging Terms)
 * Combined single-page with tab navigation.
 */

const blue = "#1669A9";
const blueDim = "rgba(22,105,169,0.08)";
const blueBorder = "rgba(22,105,169,0.2)";
const bg = "#F5F7FA";
const surface = "#FFFFFF";
const border = "#E5EAF0";
const textPrimary = "#1A1A2E";
const textSecondary = "#6B7280";
const textMuted = "#9CA3AF";

// ─── Privacy Policy Sections ────────────────────────────────────────────────
const privacySections = [
  {
    id: "01",
    title: "About Us",
    content: [
      `"We", "us" or "our" means Lasting Legacy Cleaners, with its principal place of business located at 12175 Visionary Way Fishers, IN 46038-3069.`,
    ],
  },
  {
    id: "02",
    title: "About This Privacy Policy",
    content: [
      `Your privacy is important to us, so we've developed this Privacy Policy, which explains how we collect, use, and disclose your personal information. We collect personal information when you use our website(s), mobile apps, and other online and offline products, services, and experiences (collectively, the "Services"). Please take a moment to read through this Policy in its entirety.`,
      `If you have any questions, concerns, or complaints regarding this Privacy Policy or how we use your personal information, please contact us via email at roosevelt@lastinglegacycleaners.com.`,
    ],
  },
  {
    id: "03",
    title: "What Personal Information We Collect and How We Collect It",
    content: [`We collect personal information that you provide directly to us:`],
    bullets: [
      `Contact information. If you sign up to receive our newsletter, emails, or text messages from us, we will collect your name, email address, mailing address, phone number, and any other information needed to contact you about the Services.`,
      `Payment information. To order products or services through the Services, you will need to provide us with payment information (like your bank account or credit card information). Please note that your financial information is collected and stored by a third-party payment processing company. Use and storage of that information is governed by the third-party payment processor's applicable privacy policy.`,
      `Survey information. You may provide us with other personal information when you fill in a form, respond to our surveys or questionnaires, provide us with feedback, participate in promotions, or use other features of the Services.`,
      `Communications information. We may also collect other information during our communications with you, including information that you send to us when interacting with our customer service agents, or when you call us or send emails or text messages. This may include information about how you contacted us, your marketing preferences, and other information that you choose to share.`,
    ],
  },
  {
    id: "04",
    title: "How We Use Your Personal Information",
    content: [`We use the personal information we collect for the following reasons:`],
    bullets: [
      `To send you our newsletter, or other information or marketing about our Services that we think may be of interest to you.`,
      `To reply to your questions, inquiries, or customer service requests or to send you notices, updates, security alerts, or support and administrative messages.`,
      `To provide you with information about the Services that you request from us or which we feel may interest you.`,
      `To monitor and analyze trends, usage, and activities in connection with our Services and to improve the Services.`,
      `To facilitate contests, sweepstakes and promotions, and to process entries and provide prizes and rewards.`,
      `To detect, investigate and prevent fraudulent transactions and other illegal activities on the Services and to protect the rights and property of us and our customers.`,
      `To carry out our obligations arising from any contracts entered into between you and us, including for billing and collection.`,
    ],
    footer: `We may also use your personal information to fulfill our obligations as set out by the applicable law, or to carry out any other purpose as described to you at the time your personal information was collected.`,
  },
  {
    id: "05",
    title: "What Is Our Legal Basis for Processing?",
    content: [
      `In certain countries we are required to have a legal basis for collecting and using your personal information. Our legal basis will depend on the personal information concerned and the specific context in which we collect it. We will normally collect personal information from you only where we have your consent to do so, where we need your information to perform a contract with you, or where the processing is in our legitimate interests and not overridden by your fundamental rights. In some cases, we may also have a legal obligation to collect personal information from you or may otherwise need the personal information to protect your vital interests or those of another person.`,
      `If you have questions about or need further information concerning the legal basis on which we collect and use your personal information, please contact us using the details provided in the "Contact Us" section below.`,
    ],
  },
  {
    id: "06",
    title: "How We Share Your Personal Information",
    content: [`We may share your personal information in the following ways:`],
    bullets: [
      `With vendors, consultants, and other service providers who process your personal information on our behalf when they provide services to us, for example data analytics, research, marketing, and financial services.`,
      `In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company.`,
    ],
    footer: `We may be legally required to disclose or share your personal information without your consent in some circumstances, for example to comply with a court order or law enforcement. In such circumstances, we will only disclose your personal information if we have a good-faith belief that such sharing is required under applicable legal obligations.`,
  },
  {
    id: "07",
    title: "Your Marketing Choices",
    content: [
      `When you sign up for a promotion like a sweepstakes, or subscribe to receive our newsletter or marketing/promotional messages, we use your personal information to help us decide which products, services, and offers may be of interest to you.`,
      `We will send marketing messages to you if you have asked us to send you information, bought goods or services from us, or if you provided us with your details when you entered a competition or registered for a promotion. If you opt out of receiving marketing messages, we may still send you non-promotional emails. We will ask for your consent before we share your personal information with any third party for their direct marketing purposes.`,
      `You may unsubscribe from marketing messages through a link we include on messages we send you. You can also ask us to stop sending you marketing messages at any time by contacting us at: roosevelt@lastinglegacycleaners.com.`,
    ],
  },
  {
    id: "08",
    title: "Retention of Your Data and Deletion",
    content: [
      `Your personal information will not be kept longer than is necessary for the specific purpose for which it was collected.`,
      `When we decide how long we will keep your information we consider the amount, nature, and sensitivity of the personal information, the potential risk of harm from unauthorized use or disclosure, why we need it, and any relevant legal requirements (such as legal retention and destruction periods).`,
      `The foregoing will, however, not prevent us from retaining any personal information if it is necessary to comply with our legal obligations, in order to file a legal claim or defend ourselves against a legal claim, or for evidential purposes.`,
      `Details of retention periods for different aspects of your personal data are available from us on request by contacting us using the contact details provided under the "Contact Us" heading below.`,
    ],
  },
  {
    id: "09",
    title: "International Transfers",
    content: [
      `We will ensure that any transfer of personal information to countries outside of the United States will take place pursuant to the appropriate safeguards.`,
    ],
  },
  {
    id: "10",
    title: "Your Data Protection Rights",
    content: [
      `Depending on the circumstances, you may have some of the following rights under applicable data protection laws. To exercise any of them, please contact us using the details provided in the "Contact Us" section below.`,
    ],
    bullets: [
      `You may access, correct, or request deletion of your personal information.`,
      `You may object to processing of your personal information, ask us to restrict processing of your personal information, or request portability of your personal information (i.e. your data to be transferred in a readable and standardized format).`,
      `If we have collected and processed your personal information with your consent, then you can withdraw your consent at any time.`,
    ],
    footer: `We respond to all requests we receive from individuals wishing to exercise their data protection rights in accordance with applicable data protection laws. You may also have the right to complain to a supervisory authority about our collection and use of your personal data. For more information, please contact your local supervisory authority.`,
  },
  {
    id: "11",
    title: "Changes to This Privacy Policy",
    content: [
      `From time to time, we have the right to modify this Privacy Policy. We're likely to update this Privacy Policy in the future, and when we make changes, we will take appropriate measures to inform you, consistent with the significance of the changes we make. Please come back and check this page from time to time for the latest information on our privacy practices.`,
    ],
  },
  {
    id: "12",
    title: "Contact Us",
    content: [
      `The data controller of your personal information is Lasting Legacy Cleaners, with its principal place of business located at 12175 Visionary Way Fishers, IN 46038-3069.`,
      `If you have questions or concerns about the information in this Privacy Policy, our handling of your personal information, or your choices and rights regarding such use, please do not hesitate to contact us:`,
    ],
    contact: true,
  },
];

// ─── Messaging Terms Sections ────────────────────────────────────────────────
const messagingSections = [
  {
    id: "01",
    title: "General",
    content: [
      `When you opt-in to the service, we will send you a message to confirm your signup.`,
      `By opting into messages, you agree to receive recurring automated marketing and informational text messages from Lasting Legacy Cleaners. Automated messages may be sent using an automatic telephone dialing system to the mobile telephone number you provided when signing up or any other number that you designate.`,
      `Message frequency varies, and additional mobile messages may be sent periodically based on your interaction with Lasting Legacy Cleaners. Lasting Legacy Cleaners reserves the right to alter the frequency of messages sent at any time to increase or decrease the total number of sent messages. Lasting Legacy Cleaners also reserves the right to change the short code or phone number or alphanumeric sender where messages are sent.`,
      `Your usual message and data rates may apply. If you have any questions about your text plan or data plan, it is best to contact your mobile provider. Your mobile provider is not liable for delayed or undelivered messages.`,
      `Your consent to receive marketing messages is not a condition of purchase.`,
    ],
  },
  {
    id: "02",
    title: "Carriers",
    content: [`Carriers are not liable for delayed or undelivered messages.`],
  },
  {
    id: "03",
    title: "Cancellation",
    content: [
      `Messages will provide instructions to unsubscribe either by texting STOP or through an included link. After you unsubscribe, we will send you a message to confirm that you have been unsubscribed and no more messages will be sent.`,
      `If you would like to receive messages from Lasting Legacy Cleaners again, just sign up as you did the first time and Lasting Legacy Cleaners will start sending messages to you again.`,
    ],
    highlight: `Text STOP to unsubscribe at any time.`,
  },
  {
    id: "04",
    title: "Info & Support",
    content: [
      `For support regarding our services, email us at roosevelt@lastinglegacycleaners.com or, if supported, text "HELP" to our messages at any time and we will respond with instructions on how to unsubscribe.`,
      `If we include a link in messages we send you from Lasting Legacy Cleaners, you may also access instructions on how to unsubscribe and our company information by following that link.`,
    ],
    contact: true,
  },
  {
    id: "05",
    title: "Transfer of Number",
    content: [
      `You agree that before changing your mobile number or transferring your mobile number to another individual, you will either reply "STOP" from the original number, unsubscribe using the link included in our messages (if one is provided), or notify us of your old number at roosevelt@lastinglegacycleaners.com.`,
      `The duty to inform us based on the above events is a condition of using this service to receive messages.`,
    ],
  },
  {
    id: "06",
    title: "Privacy",
    content: [
      `If you have any questions about your data or our privacy practices, please visit our Privacy Policy page or contact us directly at roosevelt@lastinglegacycleaners.com.`,
    ],
  },
  {
    id: "07",
    title: "Messaging Terms Changes",
    content: [
      `We reserve the right to change or terminate our messaging program at any time. We also reserve the right to update these Messaging Terms at any time. Such changes will be effective immediately upon posting.`,
      `If you do not agree to a change to these Messaging Terms, you should cancel your enrollment with our messaging program. Your continued enrollment following such changes shall constitute your acceptance of such changes.`,
    ],
  },
];

// ─── Shared Section Component ────────────────────────────────────────────────
function Section({ id, title, content, bullets, footer, contact, highlight }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        padding: "28px 0",
        borderBottom: `1px solid ${border}`,
      }}
    >
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 11,
          color: blue,
          letterSpacing: "0.1em",
          minWidth: 28,
          paddingTop: 3,
          opacity: 0.7,
        }}
      >
        {id}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: 16,
            fontWeight: 600,
            color: textPrimary,
            marginBottom: 12,
            letterSpacing: "0.02em",
          }}
        >
          {title}
        </div>
        {content.map((para, i) => (
          <p
            key={i}
            style={{
              color: textSecondary,
              fontSize: 13,
              lineHeight: 1.8,
              margin: i > 0 ? "12px 0 0" : 0,
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            {para}
          </p>
        ))}
        {bullets && (
          <ul style={{ margin: "12px 0 0", paddingLeft: 0, listStyle: "none" }}>
            {bullets.map((item, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 8,
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: 13,
                  color: textSecondary,
                  lineHeight: 1.8,
                }}
              >
                <span style={{ color: blue, fontWeight: 700, marginTop: 2, flexShrink: 0, fontSize: 10 }}>◆</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
        {footer && (
          <p
            style={{
              color: textSecondary,
              fontSize: 13,
              lineHeight: 1.8,
              margin: "12px 0 0",
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            {footer}
          </p>
        )}
        {highlight && (
          <div
            style={{
              marginTop: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 8,
              border: `1px solid ${blueBorder}`,
              backgroundColor: blueDim,
              fontFamily: "'Poppins', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              color: blue,
              letterSpacing: "0.03em",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="2" width="12" height="10" rx="2" stroke={blue} strokeWidth="1.2" />
              <path d="M4 6h6M4 9h4" stroke={blue} strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            {highlight}
          </div>
        )}
        {contact && (
          <div
            style={{
              marginTop: 16,
              padding: "16px 20px",
              borderRadius: 10,
              border: `1px solid ${blueBorder}`,
              backgroundColor: blueDim,
            }}
          >
            <div
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                color: textPrimary,
                marginBottom: 6,
              }}
            >
              Lasting Legacy Cleaners
            </div>
            <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 13, color: textSecondary, lineHeight: 1.7 }}>
              12175 Visionary Way · Fishers, IN 46038-3069
            </div>
            <a
              href="mailto:roosevelt@lastinglegacycleaners.com"
              style={{
                display: "inline-block",
                marginTop: 6,
                fontFamily: "'Roboto', sans-serif",
                fontSize: 13,
                color: blue,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              roosevelt@lastinglegacycleaners.com
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab content configs ─────────────────────────────────────────────────────
const tabs = [
  {
    key: "privacy",
    label: "Privacy Policy",
    badge: "12 sections",
    subtitle: "Effective Date: June 10, 2026",
    description:
      "This policy explains how Lasting Legacy Cleaners collects, uses, and protects your personal information when you use our services.",
    docLabel: "Privacy Policy Document",
    sections: privacySections,
    showToc: true,
  },
  {
    key: "messaging",
    label: "Messaging Terms",
    badge: "7 sections",
    subtitle: "SMS & Text Message Program",
    description:
      "These Messaging Terms & Conditions govern your enrollment in text message communications from Lasting Legacy Cleaners.",
    docLabel: "Messaging Terms Document",
    sections: messagingSections,
    showToc: false,
  },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function LegalPages() {
  const [activeTab, setActiveTab] = useState("privacy");
  const tab = tabs.find((t) => t.key === activeTab);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: bg,
        fontFamily: "'Roboto', sans-serif",
        color: textPrimary,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500&display=swap');
        .lp-scroll::-webkit-scrollbar { width: 4px; }
        .lp-scroll::-webkit-scrollbar-track { background: transparent; }
        .lp-scroll::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 2px; }
        .toc-link { transition: color 0.15s; }
        .toc-link:hover { color: #1669A9 !important; }
        .tab-btn { transition: all 0.18s ease; cursor: pointer; border: none; background: none; }
      `}</style>

      {/* Top accent line */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${blue}, #1E90CF, ${blue})` }} />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 60px" }}>

        {/* ── Shared Header ── */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 20 }}>
            <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
              <path d="M32 4L8 14v18c0 13 10.5 24.5 24 28 13.5-3.5 24-15 24-28V14L32 4z" stroke={blue} strokeWidth="1.5" fill="none" />
              <path d="M22 32l7 7 13-13" stroke={blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: textPrimary,
                  letterSpacing: "0.04em",
                }}
              >
                Lasting Legacy Cleaners
              </div>
              <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: blue, marginTop: 2 }}>
                Legal &amp; Privacy Documents
              </div>
            </div>
          </div>

          {/* Company info strip */}
          <div
            style={{
              display: "inline-flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "6px 20px",
              padding: "10px 20px",
              borderRadius: 10,
              border: `1px solid ${border}`,
              backgroundColor: surface,
            }}
          >
            {[
              { icon: "📍", label: "12175 Visionary Way, Fishers IN 46038" },
              { icon: "✉️", label: "roosevelt@lastinglegacycleaners.com" },
              { icon: "📞", label: "+1 (317) 970-3904" },
            ].map(({ icon, label }) => (
              <span key={label} style={{ fontSize: 11, color: textSecondary }}>
                {icon} {label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div
          style={{
            display: "flex",
            gap: 4,
            padding: 4,
            backgroundColor: surface,
            border: `1px solid ${border}`,
            borderRadius: 14,
            marginBottom: 24,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          {tabs.map((t) => {
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                className="tab-btn"
                onClick={() => setActiveTab(t.key)}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 10,
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? surface : textSecondary,
                  backgroundColor: isActive ? blue : "transparent",
                  boxShadow: isActive ? "0 2px 8px rgba(22,105,169,0.25)" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {t.label}
                <span
                  style={{
                    fontSize: 10,
                    padding: "1px 7px",
                    borderRadius: 999,
                    backgroundColor: isActive ? "rgba(255,255,255,0.2)" : blueDim,
                    color: isActive ? surface : blue,
                    fontWeight: 500,
                    fontFamily: "'Roboto', sans-serif",
                    letterSpacing: "0.04em",
                  }}
                >
                  {t.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Tab subtitle + description ── */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 16px",
              borderRadius: 999,
              border: `1px solid ${blueBorder}`,
              backgroundColor: blueDim,
              fontSize: 11,
              color: blue,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            <span>⬡</span> {tab.subtitle}
          </div>
          <p style={{ color: textSecondary, fontSize: 12.5, lineHeight: 1.7, maxWidth: 540, margin: "0 auto" }}>
            {tab.description}
          </p>
        </div>

        {/* ── Table of Contents (Privacy only) ── */}
        {tab.showToc && (
          <div
            style={{
              backgroundColor: surface,
              border: `1px solid ${border}`,
              borderRadius: 16,
              padding: "20px 28px",
              marginBottom: 24,
              boxShadow: "0 4px 24px rgba(22, 105, 169, 0.08), 0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: textMuted,
                marginBottom: 14,
              }}
            >
              Contents
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
              {tab.sections.map((s) => (
                <a
                  key={s.id}
                  href={`#section-${s.id}`}
                  className="toc-link"
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                    fontSize: 12.5,
                    color: textSecondary,
                    textDecoration: "none",
                    padding: "4px 0",
                    fontFamily: "'Roboto', sans-serif",
                  }}
                >
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: blue, opacity: 0.7, flexShrink: 0 }}>{s.id}</span>
                  <span>{s.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Document Card ── */}
        <div
          style={{
            backgroundColor: surface,
            border: `1px solid ${border}`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(22, 105, 169, 0.08), 0 1px 3px rgba(0,0,0,0.06)",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              padding: "10px 20px",
              borderBottom: `1px solid ${border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#F9FAFB",
            }}
          >
            <span style={{ fontSize: 11, color: textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {tab.docLabel}
            </span>
            <span style={{ fontSize: 11, color: textMuted }}>
              {tab.sections.length} sections
            </span>
          </div>
          <div style={{ padding: "0 28px" }}>
            {tab.sections.map((s) => (
              <div key={s.id} id={`section-${s.id}`}>
                <Section {...s} />
              </div>
            ))}
            <div style={{ height: 24 }} />
          </div>
        </div>

        <p style={{ textAlign: "center", color: textMuted, fontSize: 11, lineHeight: 1.6 }}>
          © {new Date().getFullYear()} Lasting Legacy Cleaners · 12175 Visionary Way, Fishers, IN 46038-3069
        </p>
      </div>
    </main>
  );
}