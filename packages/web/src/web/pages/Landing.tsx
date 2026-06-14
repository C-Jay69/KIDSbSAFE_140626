import { Link } from "wouter";
import { useCustomer, useListPlans } from "autumn-js/react";
import { authClient } from "../lib/auth";

const features = [
  { icon: "🛡️", title: "Risk Detection", desc: "AI-powered scoring on messages, contacts, and GPS patterns. Alerts only fire at 70+ risk score." },
  { icon: "📍", title: "Geofencing", desc: "Set safe zones for school, home, and activities. Get notified when boundaries are crossed." },
  { icon: "👁️", title: "Transparent Monitoring", desc: "Your child always sees they're being kept safe. No hidden surveillance. Ever." },
  { icon: "🔒", title: "Privacy First", desc: "Normal activity stays private. Only flagged incidents surface to parents." },
  { icon: "📱", title: "Paired Devices", desc: "Simple QR pairing between parent and child devices. No tech skills needed." },
  { icon: "⚡", title: "Instant Alerts", desc: "Push notifications the moment a high-risk pattern is detected. Act fast." },
];

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "",
    features: ["1 child device", "Basic alerts", "10 risk scans/month"],
    cta: "Get Started",
    highlight: false,
  },
  {
    id: "basic",
    name: "Basic",
    price: "$7",
    period: "/mo",
    features: ["Up to 3 children", "Full risk alerts", "Risk scoring", "Geofencing", "500 scans/month"],
    cta: "Start Basic",
    highlight: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$11",
    period: "/mo",
    features: ["Unlimited children", "Custom rules", "Trend analysis", "Family automation", "Unlimited scans"],
    cta: "Go Premium",
    highlight: false,
  },
];

export default function LandingPage() {
  const { data: session } = authClient.useSession();

  return (
    <div className="min-h-screen bg-mesh" style={{ background: "var(--bg)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <img src="/logo.png" alt="KIDSbSAFE" className="h-10 w-auto" />
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

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm text-[var(--text-muted)]">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />
          Ethical • Transparent • Trusted by families
        </div>
        <h1 className="font-display font-800 text-5xl md:text-7xl leading-tight mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Protect your kids
          <br />
          <span className="gradient-text">without the secrets.</span>
        </h1>
        <p className="text-[var(--text-muted)] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          KIDSbSAFE monitors risk signals — not conversations. Your child knows they're protected.
          Only high-risk events reach you, keeping privacy intact for normal activity.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/sign-up">
            <button className="px-8 py-4 rounded-2xl text-white font-700 text-base hover:opacity-90 transition-all hover:scale-105 glow-purple"
              style={{ background: "linear-gradient(135deg, #F97316, #EC4899)", fontFamily: 'Outfit, sans-serif' }}>
              Start Free — No Credit Card
            </button>
          </Link>
          <a href="#how-it-works">
            <button className="px-8 py-4 rounded-2xl glass text-white font-600 text-base hover:border-white/20 transition-all" style={{ fontFamily: 'Outfit, sans-serif' }}>
              How It Works
            </button>
          </a>
        </div>

        {/* Hero visual */}
        <div className="mt-20 glass-strong p-8 max-w-3xl mx-auto glow-purple">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-xs text-[var(--text-muted)] ml-2">Parent Dashboard</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Active Children", value: "2", color: "var(--purple-light)" },
              { label: "Alerts Today", value: "1", color: "var(--danger)" },
              { label: "Risk Scans", value: "47", color: "var(--success)" },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl p-4 text-left">
                <div className="text-2xl font-display font-800" style={{ color: s.color, fontFamily: 'Outfit, sans-serif' }}>{s.value}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="glass rounded-xl p-4 border-l-4" style={{ borderColor: "var(--danger)" }}>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-600 text-red-300">High Risk Alert — Emma's Device</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">Unknown contact requesting private photos. Risk score: 85</div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full risk-critical border text-xs">Score: 85</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="font-display font-700 text-4xl text-center mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>How KIDSbSAFE Works</h2>
        <p className="text-[var(--text-muted)] text-center mb-14">Three apps. One mission. Complete transparency.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Parent installs the app", desc: "Create your family, add your children's profiles, and set safety preferences." },
            { step: "02", title: "Child pairs their device", desc: "The child app clearly shows monitoring is active. No secrets, no hidden tracking." },
            { step: "03", title: "AI monitors risk signals", desc: "Only high-risk patterns (score ≥70) trigger alerts. Normal activity stays private." },
          ].map((s) => (
            <div key={s.step} className="glass p-6 rounded-2xl hover:border-purple-500/30 transition-all hover:scale-[1.02]">
              <div className="text-4xl font-display font-800 gradient-text mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>{s.step}</div>
              <h3 className="font-600 text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="font-display font-700 text-4xl text-center mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Everything you need</h2>
        <p className="text-[var(--text-muted)] text-center mb-14">Built for parents who want protection without paranoia.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="glass p-6 rounded-2xl hover:border-purple-500/30 transition-all hover:scale-[1.02]">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-600 text-base mb-2">{f.title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 py-20" id="pricing">
        <h2 className="font-display font-700 text-4xl text-center mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Simple pricing</h2>
        <p className="text-[var(--text-muted)] text-center mb-14">Start free. Upgrade when you're ready.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.id} className={`rounded-2xl p-6 flex flex-col ${p.highlight ? "glow-purple" : ""}`}
              style={{
                background: p.highlight ? "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(167,139,250,0.1))" : "var(--surface)",
                border: p.highlight ? "1px solid rgba(167,139,250,0.3)" : "1px solid var(--border)",
              }}>
              {p.highlight && (
                <div className="text-xs px-3 py-1 rounded-full gradient-purple text-white w-fit mb-4 font-600">Most Popular</div>
              )}
              <div className="font-display font-700 text-xl mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{p.name}</div>
              <div className="mb-6">
                <span className="text-4xl font-display font-800" style={{ fontFamily: 'Outfit, sans-serif' }}>{p.price}</span>
                <span className="text-[var(--text-muted)]">{p.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">✓</span>
                    <span className="text-[var(--text-muted)]">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/sign-up">
                <button className={`w-full py-3 rounded-xl font-600 text-sm transition-all hover:opacity-90 ${p.highlight ? "gradient-purple text-white" : "glass hover:border-white/20 text-white"}`}
                  style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {p.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 px-6 text-center text-sm text-[var(--text-muted)]" style={{ borderColor: "var(--border)" }}>
        <img src="/logo.png" alt="KIDSbSAFE" className="h-8 w-auto mx-auto mb-2" />
        <p>Ethical family safety. Built with transparency and trust.</p>
        <p className="mt-2 text-xs opacity-60">© 2026 KIDSbSAFE. All rights reserved.</p>
      </footer>
    </div>
  );
}
