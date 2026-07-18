import { useState } from "react";
import { Link } from "wouter";
import { useCustomer, useListPlans } from "autumn-js/react";
import { authClient } from "../lib/auth";

type BillingInterval = "monthly" | "annual";

// Pricing straight from the KIDSbSAFE spec (megaprompt):
//   Free: basic GPS alerts + limited keyword scans
//   Basic: $6.99/mo — full features
//   Premium: $10.99/mo — custom AI rules
//   Annual discounts, "Pay What You Can" (min $3/mo),
//   free/discounted for verified single parents / teachers / multi-kid families.
const TIERS = [
  {
    id: "free",
    name: "Free",
    monthly: 0,
    blurb: "The essentials to start protecting your family.",
    features: [
      "1 child device",
      "Basic GPS arrival/departure alerts",
      "Limited keyword scans (10 / month)",
      "Transparent monitoring by default",
    ],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    id: "basic",
    name: "Basic",
    monthly: 6.99,
    blurb: "Full ethical monitoring for everyday peace of mind.",
    features: [
      "Up to 3 children",
      "Full risk alerts (grooming, bullying, scam)",
      "AI risk scoring on messages & contacts",
      "Geofencing safe-zone alerts",
      "500 scans / month",
    ],
    cta: "Start Basic",
    highlight: true,
  },
  {
    id: "premium",
    name: "Premium",
    monthly: 10.99,
    blurb: "For families that want total control & insight.",
    features: [
      "Unlimited children",
      "Custom AI rules & keyword triggers",
      "Trend analysis & family automation",
      "Unlimited risk scans",
      "Priority alert delivery",
    ],
    cta: "Go Premium",
    highlight: false,
  },
];

const PAY_WHAT_YOU_CAN_MIN = 3;

// 2 months free on annual ("Save 17%")
const ANNUAL_DISCOUNT = 0.17;

function annualPrice(monthly: number): number {
  if (monthly === 0) return 0;
  const discounted = monthly * (1 - ANNUAL_DISCOUNT);
  return Math.round(discounted * 12 * 100) / 100;
}

export default function PricingPage() {
  const { data: session } = authClient.useSession();
  const { data: customer, attach, isPending } = useCustomer();
  const { data: plans } = useListPlans();
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [pwyc, setPwyc] = useState<number>(PAY_WHAT_YOU_CAN_MIN);
  const [pwycMsg, setPwycMsg] = useState("");

  const activePlan = customer?.subscriptions?.[0]?.planId ?? "free";

  const handleAttach = (planId: string) => {
    if (planId === "free" || !session) {
      window.location.href = "/sign-up";
      return;
    }
    attach({ planId, successUrl: window.location.origin + "/settings" });
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <Link href="/">
          <img src="/logo.png" alt="KIDSbSAFE" className="h-10 w-auto cursor-pointer" />
        </Link>
        <div className="flex items-center gap-4">
          {session ? (
            <Link href="/dashboard">
              <button className="px-5 py-2 rounded-xl gradient-purple text-white font-600 text-sm hover:opacity-90 transition-opacity" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Dashboard
              </button>
            </Link>
          ) : (
            <>
              <Link href="/sign-in">
                <button className="text-sm font-500 text-[var(--text-muted)] hover:text-white transition-colors">Sign In</button>
              </Link>
              <Link href="/sign-up">
                <button className="px-5 py-2 rounded-xl gradient-purple text-white font-600 text-sm hover:opacity-90 transition-opacity" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Get Started Free
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="font-display font-800 text-5xl md:text-6xl mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
          <span className="gradient-text">Simple, ethical pricing</span>
        </h1>
        <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
          Start free. Upgrade when you're ready. Every plan is built on transparency — never hidden surveillance.
        </p>

        {/* Billing toggle */}
        <div className="inline-flex items-center gap-3 mt-8 p-1 rounded-full glass">
          <button
            onClick={() => setInterval("monthly")}
            className={`px-5 py-2 rounded-full text-sm font-600 transition-all ${interval === "monthly" ? "gradient-purple text-white" : "text-[var(--text-muted)]"}`}
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval("annual")}
            className={`px-5 py-2 rounded-full text-sm font-600 transition-all flex items-center gap-2 ${interval === "annual" ? "gradient-purple text-white" : "text-[var(--text-muted)]"}`}
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Annual
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.2)", color: "#6EE7B7" }}>Save 17%</span>
          </button>
        </div>
      </section>

      {/* Tiers */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {TIERS.map((t) => {
            const price = interval === "annual" ? annualPrice(t.monthly) : t.monthly;
            const isActive = t.id === activePlan;
            return (
              <div
                key={t.id}
                className={`rounded-2xl p-6 flex flex-col ${t.highlight ? "glow-purple" : ""}`}
                style={{
                  background: t.highlight
                    ? "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(167,139,250,0.1))"
                    : "var(--surface)",
                  border: t.highlight ? "1px solid rgba(167,139,250,0.3)" : "1px solid var(--border)",
                }}
              >
                {t.highlight && (
                  <div className="text-xs px-3 py-1 rounded-full gradient-purple text-white w-fit mb-4 font-600">Most Popular</div>
                )}
                <div className="font-display font-700 text-xl mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{t.name}</div>
                <p className="text-sm text-[var(--text-muted)] mb-4 min-h-[40px]">{t.blurb}</p>
                <div className="mb-6">
                  {t.monthly === 0 ? (
                    <span className="text-4xl font-display font-800" style={{ fontFamily: 'Outfit, sans-serif' }}>$0</span>
                  ) : (
                    <>
                      <span className="text-4xl font-display font-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        ${price.toFixed(2)}
                      </span>
                      <span className="text-[var(--text-muted)]">/{interval === "monthly" ? "mo" : "yr"}</span>
                      {interval === "annual" && (
                        <div className="text-xs text-[var(--success)] mt-1">
                          ${(t.monthly * 12).toFixed(2)} billed annually · save ${(t.monthly * 12 * ANNUAL_DISCOUNT).toFixed(2)}
                        </div>
                      )}
                    </>
                  )}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <span className="text-green-400">✓</span>
                      <span className="text-[var(--text-muted)]">{f}</span>
                    </li>
                  ))}
                </ul>
                {isActive ? (
                  <div className="w-full py-3 rounded-xl text-center text-sm font-600 text-purple-300" style={{ background: "rgba(124,58,237,0.2)" }}>
                    Current Plan
                  </div>
                ) : (
                  <button
                    disabled={isPending}
                    onClick={() => handleAttach(t.id)}
                    className={`w-full py-3 rounded-xl font-600 text-sm transition-all hover:opacity-90 disabled:opacity-50 ${t.highlight ? "gradient-purple text-white" : "glass hover:border-white/20 text-white"}`}
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {t.id === "free" ? "Sign Up Free" : t.cta}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Pay What You Can */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="glass-strong p-8 rounded-2xl">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">💛</div>
            <h2 className="font-display font-700 text-2xl" style={{ fontFamily: 'Outfit, sans-serif' }}>Pay What You Can</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              We never want cost to stand between a child and safety. Choose any amount from ${PAY_WHAT_YOU_CAN_MIN}/mo.
            </p>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <input
              type="range"
              min={PAY_WHAT_YOU_CAN_MIN}
              max={30}
              step={1}
              value={pwyc}
              onChange={(e) => setPwyc(Number(e.target.value))}
              className="flex-1 accent-purple-500"
            />
            <div className="font-display font-800 text-2xl gradient-text w-24 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
              ${pwyc}.00
            </div>
          </div>
          <div className="flex justify-between text-xs text-[var(--text-muted)] mb-6">
            <span>Min ${PAY_WHAT_YOU_CAN_MIN}/mo</span>
            <span>100% goes to keeping families safe</span>
          </div>
          <Link href={`/sign-up?pwyc=${pwyc}`} className="block">
            <button className="w-full py-3 rounded-xl text-white font-700 text-sm hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #F97316, #EC4899)", fontFamily: 'Outfit, sans-serif' }}>
              Continue with ${pwyc}/mo
            </button>
          </Link>
          <p className="text-xs text-[var(--text-muted)] text-center mt-3">
            After sign-up you can finalise your contribution in Settings.
          </p>
        </div>
      </section>

      {/* Discounts for eligible families */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="glass p-6 rounded-2xl text-center">
          <h3 className="font-display font-600 text-lg mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Always free or discounted for:</h3>
          <div className="flex flex-wrap justify-center gap-3 mt-3">
            {["Verified single parents", "Teachers", "Multi-kid families (4+)"].map((g) => (
              <span key={g} className="text-sm px-4 py-2 rounded-full" style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(167,139,250,0.25)", color: "#C4B5FD" }}>
                {g}
              </span>
            ))}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-4">
            Reach out after sign-up and our team will apply your discount — no questions, no stigma.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="font-display font-700 text-3xl text-center mb-10" style={{ fontFamily: 'Outfit, sans-serif' }}>Pricing FAQ</h2>
        <div className="space-y-4">
          {[
            { q: "Is this spyware?", a: "No. KIDSbSAFE is ethical monitoring for parents of their own minor children. The child app is always visible with a clear explanation." },
            { q: "Can my child see it?", a: "Yes — by default. Transparency is core to our design. You control visibility toggles in Settings." },
            { q: "What does the free tier include?", a: "Basic GPS arrival/departure alerts and 10 keyword scans per month. No payment details required." },
            { q: "How does annual billing save money?", a: "Annual plans are discounted ~17% versus paying monthly — roughly two months free." },
            { q: "What is Pay What You Can?", a: "If you can't afford a plan, pick any amount from $3/mo. We never want cost to block protection." },
            { q: "Can I change or cancel anytime?", a: "Yes. Upgrade, downgrade, or cancel from Settings at any time — no lock-in." },
          ].map((f) => (
            <details key={f.q} className="glass p-5 rounded-2xl group" style={{ border: "1px solid var(--border)" }}>
              <summary className="font-600 cursor-pointer list-none flex justify-between items-center" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {f.q}
                <span className="text-[var(--text-muted)] group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="text-sm text-[var(--text-muted)] mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t py-10 px-6 text-center text-sm text-[var(--text-muted)]" style={{ borderColor: "var(--border)" }}>
        <img src="/logo.png" alt="KIDSbSAFE" className="h-8 w-auto mx-auto mb-2" />
        <p>Ethical family safety. Built with transparency and trust.</p>
        <p className="mt-2 text-xs opacity-60">© 2026 KIDSbSAFE. All rights reserved.</p>
      </footer>
    </div>
  );
}
