import { useState, type FormEvent, type ReactNode } from "react";
import { Link } from "wouter";
import { api } from "../lib/api";
import { authClient } from "../lib/auth";

/* ------------------------------------------------------------------------ */
/* Icons                                                                     */
/* ------------------------------------------------------------------------ */

type IconName =
  | "shield"
  | "pin"
  | "eye"
  | "lock"
  | "phone"
  | "bell"
  | "check"
  | "arrow"
  | "mail"
  | "chat"
  | "spark"
  | "users"
  | "globe"
  | "menu"
  | "close";

const ICON_PATHS: Record<IconName, ReactNode> = {
  shield: (
    <path d="M12 3.2 19 6v5.6c0 4.5-3 7.6-7 9.2-4-1.6-7-4.7-7-9.2V6l7-2.8Z" />
  ),
  pin: (
    <>
      <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.2a4 4 0 0 1 8 0v3.3" />
    </>
  ),
  phone: (
    <>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.8" />
      <path d="M11 18.6h2" />
    </>
  ),
  bell: (
    <>
      <path d="M18 15.6V11a6 6 0 1 0-12 0v4.6L4.4 18h15.2L18 15.6Z" />
      <path d="M9.6 21a2.5 2.5 0 0 0 4.8 0" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5 10-11" />,
  arrow: <path d="M4.5 12h15m-6-6 6 6-6 6" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.8 7 8.2 6 8.2-6" />
    </>
  ),
  chat: (
    <path d="M20.5 11.5a8.2 8.2 0 0 1-11.9 7.3L4 20.5l1.8-4.4a8.2 8.2 0 1 1 14.7-4.6Z" />
  ),
  spark: <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />,
  users: (
    <>
      <circle cx="9.5" cy="8.5" r="3.2" />
      <path d="M3.5 20c0-3.3 2.7-5.6 6-5.6s6 2.3 6 5.6" />
      <path d="M16 6.2a3 3 0 0 1 0 5.8M17.5 14.8c2 .7 3.2 2.4 3.2 4.6" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.8 12h16.4M12 3.5c2.3 2.3 3.4 5.3 3.4 8.5S14.3 18.2 12 20.5C9.7 18.2 8.6 15.2 8.6 12S9.7 5.8 12 3.5Z" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
};

function Icon({ name, className = "w-5 h-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

/* ------------------------------------------------------------------------ */
/* Content                                                                   */
/* ------------------------------------------------------------------------ */

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const FEATURES = [
  {
    icon: "shield" as IconName,
    tone: "bg-violet-100 text-violet-600",
    title: "Risk detection, not surveillance",
    desc: "Messages, contacts and location patterns are scored 0–100. You hear about it only when risk passes 70.",
  },
  {
    icon: "pin" as IconName,
    tone: "bg-sky-100 text-sky-600",
    title: "Safe zones that keep you posted",
    desc: "Draw a zone around school, home or practice. Get a quiet ping on arrival — and a loud one if they leave unexpectedly.",
  },
  {
    icon: "eye" as IconName,
    tone: "bg-emerald-100 text-emerald-600",
    title: "Monitoring your child can see",
    desc: "The child app always says protection is on and who it's for. There is no hidden mode to switch to.",
  },
  {
    icon: "lock" as IconName,
    tone: "bg-amber-100 text-amber-600",
    title: "Private by default",
    desc: "Homework, memes and group chats stay private. Only genuine risk signals ever reach a parent.",
  },
  {
    icon: "phone" as IconName,
    tone: "bg-pink-100 text-pink-600",
    title: "Paired in about two minutes",
    desc: "One code links the parent and child apps. No family accounts to configure, no tech skills needed.",
  },
  {
    icon: "bell" as IconName,
    tone: "bg-indigo-100 text-indigo-600",
    title: "Alerts that reach you fast",
    desc: "Push notifications the moment a high-risk pattern appears, with the context you need to act on it.",
  },
];

const PLATFORMS = ["Roblox", "TikTok", "Instagram", "Snapchat", "YouTube", "Discord", "SMS", "Web browsing"];

const STEPS = [
  {
    step: "01",
    title: "Create your family",
    desc: "Sign up, add each child's profile and choose what you want to be told about.",
  },
  {
    step: "02",
    title: "Pair their device",
    desc: "The child app displays protection in plain language. One code, one confirmation, done.",
  },
  {
    step: "03",
    title: "We watch the signals",
    desc: "The risk engine runs quietly in the background and escalates only what genuinely matters.",
  },
];

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    blurb: "The essentials to start protecting your family.",
    features: ["1 child device", "Basic arrival & departure alerts", "10 risk scans / month"],
    cta: "Start free",
    highlight: false,
  },
  {
    id: "basic",
    name: "Basic",
    price: "$6.99",
    period: "/ month",
    blurb: "Full ethical monitoring for everyday peace of mind.",
    features: ["Up to 3 children", "Full risk alerts & scoring", "Geofencing", "500 risk scans / month"],
    cta: "Choose Basic",
    highlight: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$10.99",
    period: "/ month",
    blurb: "For families who want total control and insight.",
    features: ["Unlimited children", "Custom AI rules", "Trend analysis", "Unlimited risk scans"],
    cta: "Go Premium",
    highlight: false,
  },
];

const FAQS = [
  {
    q: "Is this spyware?",
    a: "No. KIDSbSAFE is visible, consent-based monitoring for parents and guardians of their own minor children. It is not a covert-surveillance tool.",
  },
  {
    q: "Can my child see that it's running?",
    a: "Always. The child app shows a plain-language screen explaining that protection is active. Under-13 devices are parent-controlled; for 13+ there is a visible opt-out that notifies the parent.",
  },
  {
    q: "Do you read all of my child's messages?",
    a: "No. Normal activity stays private. We surface risk signals only — grooming language, suspicious unknown contacts, dangerous content.",
  },
  {
    q: "How does risk scoring actually work?",
    a: "A rule-based engine scores messages, contacts and location patterns from 0 to 100. Alerts fire at 70+, for example an unknown contact asking for age or pushing for a private meet-up.",
  },
  {
    q: "Will I be flooded with notifications?",
    a: "That's the point of the threshold. Everyday life doesn't trigger alerts, so when one arrives you can trust that something is genuinely wrong.",
  },
  {
    q: "What if I can't afford a plan?",
    a: "Choose Pay What You Can from $3/month, and we offer free or discounted access for verified single parents, teachers and larger families. Cost should never sit between a child and safety.",
  },
];

const VALUES = [
  {
    icon: "eye" as IconName,
    title: "Transparent by design",
    text: "Everything we monitor is visible to the child. There are no hidden screenshots, no keystroke logging and no silent installs.",
  },
  {
    icon: "lock" as IconName,
    title: "Consent first",
    text: "Parents confirm guardianship at sign-up. Teenagers get a visible way to raise concerns, which notifies the parent instead of hiding it.",
  },
  {
    icon: "spark" as IconName,
    title: "Risk-first",
    text: "We are built to surface danger, not to record childhood. Ordinary conversation is not content we collect.",
  },
  {
    icon: "users" as IconName,
    title: "Fair access",
    text: "Pay What You Can, single-parent and teacher discounts are part of the product — not a marketing afterthought.",
  },
];

const COMPARISON: [string, string, string, string][] = [
  ["Visible on the child's device", "Always", "Hidden", "Partial"],
  ["Ethical, consent-focused setup", "Core", "No", "Yes"],
  ["Only risk is surfaced", "Yes", "Records all", "Broad"],
  ["AI grooming risk scoring", "70+ threshold", "Raw logs", "Basic"],
  ["Pay What You Can", "From $3/mo", "No", "No"],
];

/* ------------------------------------------------------------------------ */
/* Small building blocks                                                     */
/* ------------------------------------------------------------------------ */

function NavLink({ label, href, onNavigate }: { label: string; href: string; onNavigate?: () => void }) {
  const className =
    "text-sm font-medium text-slate-600 hover:text-violet-700 transition-colors rounded-lg px-1 py-2";
  if (href.startsWith("#")) {
    return (
      <a href={href} className={className} onClick={onNavigate}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onNavigate}>
      {label}
    </Link>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/80 ring-1 ring-violet-200/70 px-3.5 py-1.5 text-xs font-semibold text-violet-700 shadow-sm">
      {children}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600 mb-3">{eyebrow}</p>
      <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight text-slate-900 leading-[1.1]">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-slate-600 text-base md:text-lg leading-relaxed">{subtitle}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Product visuals (drawn in CSS/SVG — no stock photography)                 */
/* ------------------------------------------------------------------------ */

function PhoneMockup() {
  return (
    <div className="relative w-[248px] rounded-[2.4rem] bg-slate-900 p-[7px] shadow-[0_30px_70px_-20px_rgba(49,46,129,0.55)]">
      <div className="rounded-[2rem] bg-gradient-to-b from-violet-50 via-white to-white overflow-hidden">
        {/* status bar */}
        <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[9px] font-semibold text-slate-400">
          <span>9:41</span>
          <span className="h-1.5 w-12 rounded-full bg-slate-200" />
          <span>100%</span>
        </div>
        <div className="px-5 pt-4 pb-6">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Protected
          </div>
          <p className="mt-3 font-display text-xl font-extrabold text-slate-900 leading-tight">
            Hi, Emma 👋
          </p>
          <p className="mt-1 text-[11px] text-slate-500 leading-snug">
            This app helps Mum &amp; Dad keep you safe online. You can see everything it does.
          </p>

          <div className="mt-4 rounded-2xl bg-white ring-1 ring-slate-100 p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                <Icon name="shield" className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-semibold text-slate-900">Safe browsing is on</p>
                <p className="text-[9px] text-slate-500">Nothing secret is being recorded</p>
              </div>
            </div>
          </div>

          <div className="mt-2 rounded-2xl bg-white ring-1 ring-slate-100 p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-sky-100 text-sky-600">
                <Icon name="pin" className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-semibold text-slate-900">School zone</p>
                <p className="text-[9px] text-slate-500">Arrived 8:42 · shared with family</p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-violet-600 py-2.5 text-center text-[10px] font-bold text-white shadow-sm">
            Open Safe Browser
          </div>
          <div className="mt-2 text-center text-[9px] font-medium text-slate-400">View what&apos;s monitored</div>
        </div>
      </div>
    </div>
  );
}

function AlertCard() {
  return (
    <div className="w-full rounded-2xl bg-white/95 p-4 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.25)] ring-1 ring-slate-900/5 backdrop-blur">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-600">
          <Icon name="bell" className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">High-risk alert</p>
          <p className="mt-1 text-[11px] font-semibold text-slate-900 leading-snug">
            Unknown contact asked for private photos
          </p>
          <p className="mt-1 text-[10px] text-slate-500">Emma · Roblox · just now</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-lg bg-rose-50 px-2.5 py-1.5">
        <span className="text-[10px] font-medium text-rose-700">Risk score</span>
        <span className="text-[10px] font-extrabold text-rose-700">85 / 100</span>
      </div>
    </div>
  );
}

function ZoneCard({
  title = "School zone",
  detail = "Arrived 8:42 · on time",
  tone = "sky",
}: {
  title?: string;
  detail?: string;
  tone?: "sky" | "emerald";
}) {
  const tones = {
    sky: "bg-sky-100 text-sky-600",
    emerald: "bg-emerald-100 text-emerald-600",
  } as const;

  return (
    <div className="w-full rounded-2xl bg-white/95 p-3.5 shadow-[0_18px_45px_-15px_rgba(15,23,42,0.22)] ring-1 ring-slate-900/5 backdrop-blur">
      <div className="flex items-center gap-2.5">
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon name="pin" className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold text-slate-900">{title}</p>
          <p className="truncate text-[10px] text-slate-500">{detail}</p>
        </div>
        <span className="ml-auto grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <Icon name="check" className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}

/**
 * Photography frame used by every product section.
 *
 * Photos are served from /images and cropped with `object-cover`, so each
 * frame only needs a height. The gradient scrim keeps white cards readable
 * wherever they overlap the picture.
 */
function PhotoPanel({
  src,
  alt,
  className = "",
  scrim = "from-slate-950/70",
  priority = false,
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  scrim?: string;
  priority?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] bg-slate-900 shadow-[0_35px_80px_-30px_rgba(15,23,42,0.55)] ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover object-center"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${scrim} via-slate-950/10 to-transparent`} />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Contact form                                                              */
/* ------------------------------------------------------------------------ */

const SUPPORT_EMAIL = "support@hydraforge.tech";

const CONTACT_TOPICS = [
  "General question",
  "Billing & plans",
  "Privacy or data request",
  "Technical help",
  "Schools & partnerships",
];

type ContactStatus = "idle" | "sending" | "sent" | "error";

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(CONTACT_TOPICS[0]);
  const [message, setMessage] = useState("");
  // Honeypot: hidden from people, irresistible to simple bots.
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<ContactStatus>("idle");
  const [feedback, setFeedback] = useState("");
  const [showFallback, setShowFallback] = useState(false);

  const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    `KIDSbSAFE enquiry from ${name.trim() || "a parent"}`,
  )}&body=${encodeURIComponent(`${message}\n\n— ${name}\nReply to: ${email}`)}`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setFeedback("");
    setShowFallback(false);

    try {
      const res = await api.contact.$post({
        json: { name, email, topic, message, website },
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        fallback?: string;
      };

      if (res.ok && data.ok) {
        setStatus("sent");
        setName("");
        setEmail("");
        setMessage("");
        setTopic(CONTACT_TOPICS[0]);
        return;
      }

      setFeedback(data.error ?? "Something went wrong. Please try again.");
      setShowFallback(data.fallback === "mailto" || res.status >= 500);
      setStatus("error");
    } catch {
      // Offline, or an API deployment without this route. The mail-client link
      // still works, so offer it instead of dead-ending the form.
      setFeedback("We couldn't reach the server. You can email us directly instead.");
      setShowFallback(true);
      setStatus("error");
    }
  };

  const field =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition";

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-8 text-center shadow-[0_25px_60px_-30px_rgba(76,29,149,0.35)] ring-1 ring-slate-200/80 md:p-12">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
          <Icon name="check" className="h-7 w-7" />
        </span>
        <h3 className="mt-5 font-display text-2xl font-extrabold text-slate-900">Message sent</h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
          Thanks for getting in touch. A real person will reply to your email within 24–48 business
          hours.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl bg-white p-6 md:p-8 shadow-[0_25px_60px_-30px_rgba(76,29,149,0.35)] ring-1 ring-slate-200/80"
    >
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}
      >
        <label htmlFor="contact-website">
          Website
          <input
            id="contact-website"
            aria-label="Website"
            tabIndex={-1}
            autoComplete="off"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block" htmlFor="contact-name">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">Your name</span>
          <input
            id="contact-name"
            aria-label="Your name"
            className={field}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex"
            autoComplete="name"
            maxLength={100}
            required
          />
        </label>
        <label className="block" htmlFor="contact-email">
          <span className="mb-1.5 block text-xs font-semibold text-slate-700">Email</span>
          <input
            id="contact-email"
            aria-label="Email"
            className={field}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@example.com"
            autoComplete="email"
            maxLength={200}
            required
          />
        </label>
      </div>

      <label className="mt-4 block" htmlFor="contact-topic">
        <span className="mb-1.5 block text-xs font-semibold text-slate-700">Topic</span>
        <select
          id="contact-topic"
          className={field}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          {CONTACT_TOPICS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block" htmlFor="contact-message">
        <span className="mb-1.5 block text-xs font-semibold text-slate-700">How can we help?</span>
        <textarea
          id="contact-message"
          aria-label="How can we help?"
          className={`${field} min-h-[120px] resize-y`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us a little about your family and what you need."
          maxLength={5000}
          required
        />
      </label>

      {status === "error" && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <p>{feedback}</p>
          {showFallback && (
            <a className="mt-1 inline-block font-semibold underline underline-offset-2" href={mailtoHref}>
              Email {SUPPORT_EMAIL}
            </a>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          {status === "sending" ? "Sending…" : "Send message"}
          <Icon name="arrow" className="h-4 w-4" />
        </button>
        <p className="text-xs text-slate-500">
          We reply within 24–48 business hours.
        </p>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Or email us directly at{" "}
        <a className="font-semibold text-violet-700 hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------------ */
/* Page                                                                      */
/* ------------------------------------------------------------------------ */

export default function LandingPage() {
  const { data: session } = authClient.useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="kbs-landing min-h-screen bg-white text-slate-900 antialiased">
      {/* Announcement bar */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-6 py-2 text-xs font-medium">
          <span className="hidden sm:inline">🛡️</span>
          <span>Ethical family safety — your child always knows they&apos;re protected.</span>
          <a href="#about" className="hidden sm:inline font-bold underline underline-offset-2 hover:no-underline">
            Why that matters
          </a>
        </div>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5" aria-label="Main">
          <Link href="/">
            <img src="/logo.png" alt="KIDSbSAFE home" className="h-9 w-auto cursor-pointer" />
          </Link>

          <div className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.label} {...link} />
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {session ? (
              <Link href="/dashboard">
                <button
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-500/25 transition hover:opacity-95"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  Dashboard
                </button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <span className="cursor-pointer text-sm font-medium text-slate-600 transition hover:text-violet-700">
                    Sign in
                  </span>
                </Link>
                <Link href="/sign-up">
                  <button
                    className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-500/25 transition hover:opacity-95"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    Get started free
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? "close" : "menu"} className="h-5 w-5" />
          </button>
        </nav>

        {menuOpen && (
          <div className="lg:hidden border-t border-slate-200/70 bg-white px-6 pb-5 pt-2">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <div key={link.label} className="py-1">
                  <NavLink {...link} onNavigate={closeMenu} />
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4">
              {session ? (
                <Link href="/dashboard">
                  <button className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/sign-in">
                    <button
                      className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                      onClick={closeMenu}
                    >
                      Sign in
                    </button>
                  </Link>
                  <Link href="/sign-up">
                    <button
                      className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white"
                      onClick={closeMenu}
                    >
                      Get started free
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(900px 500px at 12% 0%, rgba(139,92,246,0.18), transparent 60%), radial-gradient(800px 500px at 88% 8%, rgba(236,72,153,0.14), transparent 60%), radial-gradient(700px 400px at 50% 100%, rgba(14,165,233,0.10), transparent 70%)",
            }}
          />
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-14 md:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28">
            <div>
              <Pill>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Ethical • Transparent • Built for families
              </Pill>

              <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
                Protect your kids
                <br />
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 bg-clip-text text-transparent">
                  without the secrets.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
                KIDSbSAFE watches for the moments that matter — grooming, scams, bullying and unsafe
                places — and leaves everything else private. Your child can see it working, every
                step of the way.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/sign-up">
                  <button
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 px-7 py-4 text-base font-bold text-white shadow-xl shadow-violet-500/25 transition hover:-translate-y-0.5 hover:opacity-95 sm:w-auto"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    Start free — no credit card
                    <Icon name="arrow" className="h-[18px] w-[18px]" />
                  </button>
                </Link>
                <a href="#how-it-works">
                  <button className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 py-4 text-base font-semibold text-slate-800 shadow-sm transition hover:border-violet-300 hover:text-violet-700 sm:w-auto">
                    See how it works
                  </button>
                </a>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                {["No credit card needed", "Cancel anytime", "Visible to your child"].map((item) => (
                  <li key={item} className="inline-flex items-center gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                      <Icon name="check" className="h-3 w-3" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Hero visual */}
            <div className="relative mx-auto w-full max-w-[560px]">
              <div className="relative">
                {/* Accent halo behind the photo */}
                <div className="absolute -inset-4 -z-10 rounded-[3.25rem] bg-gradient-to-br from-violet-500/30 via-indigo-500/20 to-pink-500/25 blur-2xl" />
                <PhotoPanel
                  src="/images/hero-family.jpg"
                  alt="A parent and child sitting together at home, looking at a phone"
                  scrim="from-slate-950/75"
                  priority
                  className="h-[440px] sm:h-[560px]"
                >
                  <div className="absolute inset-x-4 top-4 sm:inset-x-5 sm:top-5">
                    <div className="ml-auto w-[240px]">
                      <ZoneCard />
                    </div>
                  </div>
                  <div className="absolute inset-x-4 bottom-4 sm:inset-x-5 sm:bottom-5">
                    <div className="max-w-[300px]">
                      <AlertCard />
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/60 to-transparent" />
                </PhotoPanel>
              </div>
            </div>
          </div>

          {/* Platform strip */}
          <div className="border-y border-slate-200/70 bg-slate-50/80">
            <div className="mx-auto max-w-7xl px-6 py-7">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Designed around the places your kids actually spend time
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                {PLATFORMS.map((platform) => (
                  <span
                    key={platform}
                    className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionHeading
            eyebrow="Features"
            title={
              <>
                Everything you need.
                <br className="hidden sm:block" /> Nothing you don&apos;t.
              </>
            }
            subtitle="Protection that works in the background, without turning your family into a surveillance operation."
          />

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_10px_35px_-20px_rgba(15,23,42,0.25)] transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_25px_55px_-25px_rgba(109,40,217,0.35)]"
              >
                <span className={`grid h-12 w-12 place-items-center rounded-2xl ${feature.tone}`}>
                  <Icon name={feature.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="relative overflow-hidden bg-slate-50 py-20 md:py-28">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(600px 300px at 15% 20%, rgba(139,92,246,0.12), transparent 70%), radial-gradient(600px 300px at 85% 80%, rgba(236,72,153,0.10), transparent 70%)",
            }}
          />
          <div className="relative mx-auto max-w-7xl px-6">
            <SectionHeading
              eyebrow="How it works"
              title="Set up once. Breathe easier."
              subtitle="Three short steps, then KIDSbSAFE runs quietly in the background."
            />
            <div className="grid gap-5 md:grid-cols-3">
              {STEPS.map((item, index) => (
                <div key={item.step} className="relative rounded-3xl bg-white p-7 shadow-[0_15px_45px_-25px_rgba(15,23,42,0.3)] ring-1 ring-slate-200/70">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 font-display text-sm font-extrabold text-white shadow-lg shadow-violet-500/25">
                      {item.step}
                    </span>
                    {index < STEPS.length - 1 && (
                      <span className="hidden md:block h-px flex-1 bg-gradient-to-r from-violet-200 to-transparent" />
                    )}
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Child app — the part your child sees */}
            <div className="mt-8 grid items-center gap-10 rounded-[2rem] bg-white p-8 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.4)] ring-1 ring-slate-200/80 md:grid-cols-[auto_1fr] md:p-10">
              <div className="flex justify-center">
                <PhoneMockup />
              </div>
              <div>
                <Pill>
                  <Icon name="eye" className="h-3.5 w-3.5" />
                  On their device too
                </Pill>
                <h3 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
                  Your child always knows protection is on.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
                  Pairing shows a short, plain-language screen on the child&apos;s phone: what the
                  app does, who it belongs to, and where to ask questions. Nothing is installed
                  silently, and there is no hidden mode to switch on.
                </p>
                <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  {[
                    "A visible “Protected” status",
                    "The reason the app is installed",
                    "What is and isn't monitored",
                    "A button to raise a concern",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                        <Icon name="check" className="h-3 w-3" />
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Deep dive 1 — alerts */}
        <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Pill>
                <Icon name="bell" className="h-3.5 w-3.5" />
                Risk-first alerts
              </Pill>
              <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.5rem] md:leading-[1.15]">
                Know the moment it matters — and only then.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-600">
                An unknown adult asking for photos. A stranger pushing for a private meet-up. A
                message that reads like a scam. KIDSbSAFE scores each signal and stays out of the way
                otherwise, so an alert actually means something.
              </p>
              <ul className="mt-7 space-y-3.5">
                {[
                  "A 70+ threshold keeps normal life quiet",
                  "Context attached: who, where, and what tripped it",
                  "One tap to review, dismiss or act",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-700">
                      <Icon name="check" className="h-3 w-3" />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up">
                <span className="mt-8 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-violet-700 hover:underline">
                  Try it free
                  <Icon name="arrow" className="h-4 w-4" />
                </span>
              </Link>
            </div>

            <div className="overflow-hidden rounded-[2rem] bg-gradient-to-b from-slate-900 to-indigo-950 shadow-[0_35px_80px_-30px_rgba(49,46,129,0.6)]">
              <div className="relative">
                <img
                  src="/images/teen-phone.jpg"
                  alt="A teenager using a phone at home"
                  className="h-[300px] w-full object-cover object-center sm:h-[340px]"
                  loading="lazy"
                  decoding="async"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/45 to-transparent" />
              </div>
              <div className="relative -mt-12 px-5 pb-6 sm:px-8">
                <div className="max-w-[320px]">
                  <AlertCard />
                </div>
                <div className="mt-3 rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/15 backdrop-blur">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-400/20 text-emerald-300">
                      <Icon name="shield" className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-white">All other activity stays private</p>
                      <p className="text-[10px] text-indigo-200/80">Nothing stored, nothing shared</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Deep dive 2 — safe zones */}
        <section className="bg-slate-50 py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <PhotoPanel
                src="/images/family-walk.jpg"
                alt="A family walking together at sunset"
                scrim="from-slate-950/80"
                className="h-[400px] sm:h-[460px]"
              >
                <div className="absolute inset-x-4 bottom-4 space-y-2.5 sm:inset-x-6 sm:bottom-6">
                  <ZoneCard
                    title="School zone"
                    detail="Arrived 8:42 · on time"
                    tone="emerald"
                  />
                  <ZoneCard title="Home & street" detail="Arrived 16:05 · on time" tone="sky" />
                </div>
              </PhotoPanel>
            </div>
            <div className="order-1 lg:order-2">
              <Pill>
                <Icon name="pin" className="h-3.5 w-3.5" />
                Safe zones
              </Pill>
              <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.5rem] md:leading-[1.15]">
                Freedom to roam, with a safety net.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-600">
                Independence is part of growing up. Safe zones let your child get on with their day
                while you quietly know they arrived where they said they would.
              </p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {[
                  { title: "Arrival that reassures", text: "A gentle notification when they reach school or a friend's house." },
                  { title: "Departures that alert", text: "Leave a zone at an unexpected time and you hear about it straight away." },
                ].map((card) => (
                  <div key={card.title} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/80">
                    <p className="font-display text-sm font-bold text-slate-900">{card.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{card.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Promise band */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-6 rounded-[2rem] bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 px-8 py-10 text-white shadow-[0_30px_70px_-30px_rgba(109,40,217,0.6)] sm:grid-cols-2 lg:grid-cols-4">
              {[
                { value: "70+", label: "risk score before you're alerted" },
                { value: "0", label: "hidden screenshots or keylogging" },
                { value: "3", label: "apps working together" },
                { value: "$0", label: "to get started" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display text-4xl font-extrabold">{stat.value}</p>
                  <p className="mt-1 text-sm text-violet-100">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ethics */}
        <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <SectionHeading
            eyebrow="Our standard"
            title="Built on ethics, not surveillance"
            subtitle="Protecting a child should never mean spying on them. These are the rules we build by."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
                <Icon name="eye" className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-extrabold text-slate-900">Transparent by design</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                The child app always explains, in plain language, that it helps keep them safe and
                who it belongs to. There is no stealth mode to enable.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-slate-700">
                {[
                  "No hidden cameras, screenshots or keystroke capture",
                  "Parents confirm guardianship during setup",
                  "Teens can raise a concern that notifies the parent",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                      <Icon name="check" className="h-3 w-3" />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-100 text-violet-600">
                <Icon name="spark" className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-2xl font-extrabold text-slate-900">Risk-first, not surveillance-first</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                We surface concerning activity and leave the rest alone. Homework, memes and group
                chats are not our business.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-slate-700">
                {[
                  "Normal conversations stay private",
                  "Grooming, threats and scams raise the score",
                  "The goal is protection, not punishment",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-700">
                      <Icon name="check" className="h-3 w-3" />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="bg-slate-50 py-20 md:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="The difference"
              title="Ethical by design — not by marketing"
              subtitle="Most parental-control tools hide in the background. We built the opposite."
            />
            <div className="overflow-x-auto rounded-3xl bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.3)] ring-1 ring-slate-200/80">
              <table className="w-full min-w-[620px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="p-5 font-semibold text-slate-900">Feature</th>
                    <th className="p-5 font-bold text-violet-700">KIDSbSAFE</th>
                    <th className="p-5 font-medium text-slate-500">Stealth-style apps</th>
                    <th className="p-5 font-medium text-slate-500">Broad monitors</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map(([feature, us, stealth, broad], index) => (
                    <tr key={feature} className={index < COMPARISON.length - 1 ? "border-b border-slate-100" : ""}>
                      <td className="p-5 text-slate-700">{feature}</td>
                      <td className="p-5 font-semibold text-emerald-700">{us}</td>
                      <td className="p-5 text-slate-500">{stealth}</td>
                      <td className="p-5 text-slate-500">{broad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionHeading
            eyebrow="Pricing"
            title="Simple, honest pricing"
            subtitle="Start free. Upgrades are monthly and you can cancel whenever you like."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl p-7 ${
                  plan.highlight
                    ? "bg-gradient-to-b from-violet-600 to-indigo-700 text-white shadow-[0_30px_70px_-25px_rgba(109,40,217,0.6)] ring-1 ring-violet-500"
                    : "bg-white text-slate-900 shadow-[0_15px_45px_-25px_rgba(15,23,42,0.3)] ring-1 ring-slate-200/80"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-700 shadow">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                <p className={`mt-1 text-sm ${plan.highlight ? "text-violet-100" : "text-slate-500"}`}>
                  {plan.blurb}
                </p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-extrabold">{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? "text-violet-200" : "text-slate-500"}`}>
                    {plan.period}
                  </span>
                </div>
                <ul className="mt-6 flex-1 space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <span
                        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                          plan.highlight ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        <Icon name="check" className="h-3 w-3" />
                      </span>
                      <span className={plan.highlight ? "text-violet-50" : "text-slate-700"}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up">
                  <button
                    className={`mt-7 w-full rounded-xl px-5 py-3 text-sm font-bold transition hover:opacity-95 ${
                      plan.highlight
                        ? "bg-white text-violet-700 shadow"
                        : "bg-slate-900 text-white"
                    }`}
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    {plan.cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-600">
            Can&apos;t manage a paid plan?{" "}
            <Link href="/pricing">
              <span className="cursor-pointer font-semibold text-violet-700 hover:underline">
                Pay What You Can from $3/month
              </span>
            </Link>
            , with free access for verified single parents and teachers.
          </p>
        </section>

        {/* About */}
        <section id="about" className="bg-slate-50 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <PhotoPanel
              src="/images/about-family.jpg"
              alt="A parent sitting with their young child, holding a phone together"
              scrim="from-slate-950/70"
              className="mb-12 h-[220px] md:h-[300px]"
            >
              <div className="absolute inset-0 flex items-end">
                <div className="p-6 md:p-10">
                  <p className="max-w-lg font-display text-xl font-extrabold leading-snug text-white drop-shadow md:text-3xl">
                    Protection should be something a child can see, not something done to them.
                  </p>
                </div>
              </div>
            </PhotoPanel>

            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">About us</p>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.5rem] md:leading-[1.15]">
                  A safety company that refuses to be a spy company.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-slate-600">
                  KIDSbSAFE is built by Hydraforge Online Business Solutions LLC, a small team of
                  parents and engineers who kept running into the same uncomfortable choice:
                  parenting apps that either do far too little, or quietly record everything a child
                  does.
                </p>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  We took a third path. Watch for genuine danger, explain yourself to the child, and
                  keep ordinary childhood private. That promise shapes every feature we ship — and
                  every feature we refuse to build.
                </p>
                <div className="mt-7 rounded-2xl bg-white p-5 ring-1 ring-slate-200/80">
                  <p className="font-display text-sm font-bold text-slate-900">What we won&apos;t do</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                    <li>· No covert installs or hidden modes</li>
                    <li>· No selling or sharing family data for advertising</li>
                    <li>· No monitoring of adults or non-consenting devices</li>
                  </ul>
                </div>
                <Link href="/legal">
                  <span className="mt-6 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-violet-700 hover:underline">
                    Read our legal &amp; ethics commitments
                    <Icon name="arrow" className="h-4 w-4" />
                  </span>
                </Link>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {VALUES.map((value) => (
                  <div key={value.title} className="rounded-3xl bg-white p-6 ring-1 ring-slate-200/80">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-50 text-violet-600">
                      <Icon name={value.icon} className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-display text-base font-bold text-slate-900">{value.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{value.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-4xl px-6 py-20 md:py-28">
          <SectionHeading
            eyebrow="FAQ"
            title="Questions parents ask"
            subtitle="Straight answers. No fine print."
          />
          <div className="space-y-3">
            {FAQS.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm transition hover:border-violet-200"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-bold text-slate-900 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 transition group-open:rotate-45 group-open:bg-violet-100 group-open:text-violet-700">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 pr-9 text-sm leading-relaxed text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">Contact</p>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-[2.5rem] md:leading-[1.15]">
                  We&apos;re here, and we answer.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-slate-600">
                  Questions about setup, billing, privacy or a safety concern — send us a message and
                  a real person will reply. If a child is in immediate danger, contact your local
                  emergency services first.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    { icon: "mail" as IconName, label: "Support", value: "support@hydraforge.tech", href: "mailto:support@hydraforge.tech" },
                    { icon: "lock" as IconName, label: "Privacy & data requests", value: "privacy@hydraforge.tech", href: "mailto:privacy@hydraforge.tech" },
                    { icon: "globe" as IconName, label: "Company", value: "Hydraforge Online Business Solutions LLC · Sheridan, WY", href: "/legal" },
                  ].map((row) => (
                    <a
                      key={row.label}
                      href={row.href}
                      className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:border-violet-200 hover:shadow-sm"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
                        <Icon name={row.icon} className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-slate-500">{row.label}</span>
                        <span className="block truncate text-sm font-medium text-slate-900">{row.value}</span>
                      </span>
                    </a>
                  ))}
                </div>

                <p className="mt-6 text-xs text-slate-500">
                  Typical response time: 24–48 business hours. Safety emergencies are escalated first.
                </p>
              </div>

              <ContactForm />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-700 via-indigo-700 to-pink-600 px-8 py-14 text-center text-white shadow-[0_35px_80px_-30px_rgba(91,33,182,0.6)] md:px-16">
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage: "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold leading-tight md:text-[2.75rem]">
                Protection your child can see. Peace of mind you can feel.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-sm text-violet-100 md:text-base">
                Set up your family in a couple of minutes. Free to start, no credit card required.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/sign-up">
                  <button
                    className="w-full rounded-2xl bg-white px-8 py-4 text-base font-bold text-violet-700 shadow-lg transition hover:-translate-y-0.5 sm:w-auto"
                    style={{ fontFamily: "Outfit, sans-serif" }}
                  >
                    Get started free
                  </button>
                </Link>
                <a href="#contact">
                  <button className="w-full rounded-2xl border border-white/40 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20 sm:w-auto">
                    Talk to us
                  </button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <img src="/logo.png" alt="KIDSbSAFE" className="h-9 w-auto" />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">
                Ethical family safety. Visible monitoring, risk-first alerts and privacy by default.
              </p>
            </div>

            <div>
              <p className="font-display text-sm font-bold text-slate-900">Product</p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                {[
                  { label: "Features", href: "#features" },
                  { label: "How it works", href: "#how-it-works" },
                  { label: "Pricing", href: "/pricing" },
                  { label: "FAQ", href: "#faq" },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="transition hover:text-violet-700">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-display text-sm font-bold text-slate-900">Company</p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                <li>
                  <a href="#about" className="transition hover:text-violet-700">About us</a>
                </li>
                <li>
                  <a href="#contact" className="transition hover:text-violet-700">Contact</a>
                </li>
                <li>
                  <a href="/legal" className="transition hover:text-violet-700">Legal &amp; ethics</a>
                </li>
                <li>
                  <a href="mailto:support@hydraforge.tech" className="transition hover:text-violet-700">Support</a>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-display text-sm font-bold text-slate-900">Legal</p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                <li>
                  <a href="/privacy" className="transition hover:text-violet-700">Privacy policy</a>
                </li>
                <li>
                  <a href="/terms" className="transition hover:text-violet-700">Terms of service</a>
                </li>
                <li>
                  <a href="/cookies" className="transition hover:text-violet-700">Cookie policy</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row">
            <p>© 2026 KIDSbSAFE · Hydraforge Online Business Solutions LLC</p>
            <p>Built for parents. Transparent for kids.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
