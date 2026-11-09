import { Link } from "wouter";

const sections = [
  {
    id: "privacy",
    title: "Privacy Policy",
    updated: "Last Updated: April 2026",
    body: [
      ["Who We Are", "Hydraforge Online Business Solutions LLC, operating the KIDSbSAFE parental safety platform."],
      ["What We Collect", "We collect only the data necessary to fulfill our safety mandate: parent account details, child age range, device linkage confirmation, GPS location (opt-in), and flagged message metadata. We do not store full message histories, photos, or browsing logs unless explicitly triggered by high-risk AI alerts."],
      ["How We Use Data", "Data is processed exclusively to generate safety alerts, improve risk-detection algorithms, and maintain account security. We never sell, rent, or share personal data with third parties for advertising or commercial purposes."],
      ["Child Data & Consent", "For children under 13, parental control and consent are mandatory. For ages 13+, children retain visibility of the app and may request an opt-out, which triggers a parent notification."],
      ["Security & Retention", "All data is encrypted in transit and at rest. We retain alert logs for 90 days unless manually archived by the parent. Account deletion requests are processed within 30 days."],
      ["Your Rights", "Parents may access, export, or delete their child's data at any time. Children 13+ may exercise limited data rights per regional privacy laws."],
      ["Contact", "info@hydraforge.tech · Hydraforge Online Business Solutions LLC, 30 N Gould St, Ste R, Sheridan, WY, 82801"],
    ],
  },
  {
    id: "terms",
    title: "Terms of Service",
    updated: "Hydraforge Online Business Solutions LLC, Wyoming",
    body: [
      ["Acceptance & Eligibility", "By creating an account, you declare: \"I am a parent or legal guardian of minor children\" and confirm your intent to use KIDSbSAFE solely for ethical child safety purposes."],
      ["Prohibited Use", "KIDSbSAFE is strictly prohibited for stalking, non-consensual monitoring, employer surveillance, or use against adults. Circumventing ethical safeguards (e.g., stealth installation, data harvesting) will result in immediate account termination and potential legal reporting."],
      ["Account & Device Linkage", "Parents must verify device ownership via shared family accounts or photo proof during onboarding. Unauthorized access or false declarations violate these terms."],
      ["Subscriptions & Payments", "Freemium access is available with limited features. Paid tiers ($6.99 Basic, $10.99 Premium) are billed via Stripe. Annual discounts and \"Pay What You Can\" options are offered. Refunds follow Stripe's policy and are evaluated case-by-case."],
      ["Liability & Disclaimers", "KIDSbSAFE provides risk-based alerts, not guarantees of safety. We are not liable for missed threats, false positives, or third-party platform limitations. Use at your discretion alongside open parent-child communication."],
      ["Governing Law", "These terms are governed by Wyoming state law. Disputes will be resolved in Wyoming courts or through binding arbitration."],
      ["Updates & Termination", "We may update these terms with 30 days' notice. We reserve the right to suspend accounts violating ethical or legal standards."],
    ],
  },
  {
    id: "cookies",
    title: "Cookie Policy",
    updated: "",
    body: [
      ["Overview", "KIDSbSAFE uses cookies to enhance user experience, maintain secure sessions, and analyze platform performance."],
      ["Essential Cookies", "Required for authentication, dashboard functionality, and payment processing (Stripe)."],
      ["Analytics Cookies", "Anonymous usage metrics to improve alert accuracy and UI/UX. No personal or child data is tracked."],
      ["Preference Cookies", "Remember dark mode, alert thresholds, and regional settings."],
      ["Consent & Management", "You may adjust cookie preferences via the banner on first visit or in Dashboard Settings. Disabling essential cookies may limit platform functionality. Third-party cookies are restricted to payment and security providers only."],
      ["Contact", "info@hydraforge.tech"],
    ],
  },
  {
    id: "support",
    title: "Support",
    updated: "",
    body: [
      ["Email", "support@kidsbsafe.online — Response time within 24–48 business hours. Priority escalation available for verified safety emergencies."],
      ["Self-Help", "Visit our in-app FAQ, setup guides, and troubleshooting docs for instant assistance."],
      ["Emergency Help", "If a child is in immediate danger or you suspect grooming/abuse, contact local law enforcement or a dedicated helpline:"],
      ["US", "National Child Abuse Hotline: 1-800-4-A-CHILD (1-800-422-4453)"],
      ["UK", "NSPCC Helpline: 0808 800 5000"],
      ["Canada", "Kids Help Phone: 1-800-668-6868 (Text: CONNECT to 686868)"],
      ["International", "Find your country's child helpline via childhelplineinternational.org"],
      ["Crisis Text Line", "US/UK/CA/IE: Text HOME to 741741"],
      ["Disclaimer", "KIDSbSAFE is a monitoring tool, not a replacement for professional intervention or emergency services."],
    ],
  },
  {
    id: "ethics",
    title: "Ethics",
    updated: "",
    body: [
      ["Our Principle", "KIDSbSAFE was built on a single principle: technology should protect children, not exploit them. Unlike traditional monitoring tools that operate in secret or blanket-scan private communications, KIDSbSAFE is engineered for transparency, consent, and targeted safety. Our platform is visible by default, respects age-appropriate autonomy, and focuses exclusively on detecting high-risk behavior like grooming, predatory contact, and exposure to harmful content. We reject surveillance culture. We champion open family dialogue, powered by ethical AI and clear boundaries."],
    ],
  },
  {
    id: "ethics-promise",
    title: "Ethics Promise",
    updated: "",
    body: [
      ["We pledge to parents and children that KIDSbSAFE will:", ""],
      ["Visible by default", "Always be visible on the child's device with clear messaging: \"This app helps Mum/Dad keep you safe online.\""],
      ["No stealth", "Never operate in stealth mode or hide its presence, permissions, or notifications."],
      ["Age-based consent", "Respect age-based consent: kids 13+ can opt out (triggers parent alert). Under 13 remains parent-managed."],
      ["High-risk only", "Alert only on high-risk signals, leaving normal chats, homework, and friendships private."],
      ["No data monetization", "Never sell, share, or monetize child data, location, or message content."],
      ["Clear controls", "Provide clear, accessible privacy controls for parents and age-appropriate transparency for children."],
      ["Ethical audits", "Undergo regular ethical audits and publish our findings to maintain accountability."],
      ["Accountability", "If we ever break this promise, we will publicly acknowledge it, fix it, and compensate affected users."],
    ],
  },
  {
    id: "transparency",
    title: "Transparency Report",
    updated: "Published biannually",
    body: [
      ["Data Handling Metrics", "Volume of alerts generated, false-positive rates, data retention compliance, and deletion request fulfillment."],
      ["Law Enforcement & Government Requests", "KIDSbSAFE does not proactively share data. Any legally compelled requests are published with redacted details per jurisdictional law."],
      ["Algorithmic Updates", "Changes to risk-scoring rules, keyword dictionaries, and AI model behavior."],
      ["User Gating & Verification", "Statistics on account verification success, false parent claims intercepted, and consent opt-outs by age group."],
      ["Ethical Safeguards", "Audit results, bug bounties, and third-party security assessments."],
      ["Commitment", "Our latest report is available in the footer. We believe transparency isn't optional — it's the foundation of ethical parental tech."],
    ],
  },
  {
    id: "charter",
    title: "Child Safety Charter",
    updated: "Aligned with COPPA, UNICEF digital safety guidelines, and modern parenting ethics",
    body: [
      ["Safety Over Surveillance", "We detect threats, not track every tap. Normal childhood digital life remains private."],
      ["Visibility & Consent", "No hidden apps. No secret tracking. Kids know why and how they're being protected."],
      ["AI with Guardrails", "Risk scoring focuses on grooming phrases, suspicious contact patterns, and high-frequency unknown messaging — not blanket keyword scanning."],
      ["Parent-Child Partnership", "Tools are designed to open conversations, not replace them. We provide alert context, not raw data dumps."],
      ["Inclusive & Accessible", "Freemium pricing, \"Pay What You Can\" tiers, and discounted access for single parents, teachers, and multi-child families ensure safety isn't a luxury."],
      ["Continuous Improvement", "We listen to child psychologists, safety advocates, and parents to refine our features ethically and effectively."],
      ["Our Why", "KIDSbSAFE exists because the internet is full of wolves, not vibes. We're here to help families navigate it together."],
    ],
  },
];

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-mesh" style={{ background: "var(--bg)" }}>
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-24">
        <Link href="/">
          <img src="/logo.png" alt="KIDSbSAFE" className="h-8 w-auto mb-8 cursor-pointer" />
        </Link>

        <h1 className="font-display font-800 text-4xl md:text-5xl mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Legal &amp; Ethics
        </h1>
        <p className="text-[var(--text-muted)] mb-8">
          KIDSbSAFE is operated by Hydraforge Online Business Solutions LLC, registered in Wyoming, and complies with
          applicable U.S. federal and international data protection regulations, including COPPA, GDPR, and CCPA.
          For legal inquiries, contact <span className="text-white">info@hydraforge.tech</span>.
        </p>

        {/* In-page nav */}
        <nav className="glass rounded-2xl p-4 mb-10 flex flex-wrap gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-xs px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors text-[var(--text-muted)]"
            >
              {s.title}
            </a>
          ))}
        </nav>

        {sections.map((s) => (
          <section key={s.id} id={s.id} className="mb-12 scroll-mt-8">
            <h2 className="font-display font-700 text-2xl mb-1 gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {s.title}
            </h2>
            {s.updated && <p className="text-xs text-[var(--text-muted)] mb-4">{s.updated}</p>}
            <div className="space-y-4">
              {s.body.map(([k, v], i) =>
                v ? (
                  <div key={i} className="glass rounded-xl p-4">
                    <div className="font-600 text-sm text-white mb-1">{k}</div>
                    <div className="text-sm text-[var(--text-muted)] leading-relaxed">{v}</div>
                  </div>
                ) : (
                  <h3 key={i} className="font-600 text-base text-white/90 pt-2">
                    {k}
                  </h3>
                ),
              )}
            </div>
          </section>
        ))}

        <div className="border-t pt-8 text-center text-sm text-[var(--text-muted)]" style={{ borderColor: "var(--border)" }}>
          <p>Ethical family safety. Built with transparency and trust.</p>
          <p className="mt-2 text-xs opacity-60">© 2026 KIDSbSAFE. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
