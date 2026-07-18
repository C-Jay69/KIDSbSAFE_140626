import { Link } from "wouter";
import { useCustomer, useListPlans } from "autumn-js/react";
import { authClient } from "../lib/auth";
import SiteFooter from "../components/SiteFooter";

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
    price: "$6.99",
    period: "/mo",
    features: ["Up to 3 children", "Full risk alerts", "Risk scoring", "Geofencing", "500 scans/month"],
    cta: "Start Basic",
    highlight: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$10.99",
    period: "/mo",
    features: ["Unlimited children", "Custom AI rules", "Trend analysis", "Family automation", "Unlimited scans"],
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
              <Link href="/pricing">
                <button className="text-sm font-500 text-[var(--text-muted)] hover:text-white transition-colors">Pricing</button>
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
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
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
        <div className="mt-20 glass-strong p-8 max-w-4xl mx-auto glow-purple">
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
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-20">
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
      <section className="max-w-7xl mx-auto px-6 py-20">
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
      <section className="max-w-7xl mx-auto px-6 py-20" id="pricing">
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

      {/* Why choose KIDSbSAFE — comparison vs competitors */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="font-display font-700 text-4xl text-center mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Ethical by design — not by marketing
        </h2>
        <p className="text-[var(--text-muted)] text-center mb-14">
          Most "parental control" tools hide in the background. We built the opposite.
        </p>
        <div className="glass-strong overflow-hidden rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="p-5 font-600">Feature</th>
                <th className="p-5 font-600 gradient-text">KIDSbSAFE</th>
                <th className="p-5 font-500 text-[var(--text-muted)]">mSpy / TheOneSpy</th>
                <th className="p-5 font-500 text-[var(--text-muted)]">Bark</th>
                <th className="p-5 font-500 text-[var(--text-muted)]">Qustodio</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Visible on child's device by default", "✅ Always", "❌ Hidden / stealth", "⚠️ Partial", "⚠️ Partial"],
                ["Ethical, consent-focused", "✅ Core", "❌ No", "✅ Yes", "✅ Yes"],
                ["No blanket surveillance", "✅ Only flags risk", "❌ Records all", "⚠️ Broad", "⚠️ Broad"],
                ["AI grooming / predator alerts", "✅ 70+ score", "❌ Raw logs", "✅ Yes", "⚠️ Basic"],
                ["Pay What You Can option", "✅ From $3", "❌ No", "❌ No", "❌ No"],
                ["Discounts for single parents/teachers", "✅ Yes", "❌ No", "❌ No", "❌ No"],
              ].map(([feature, us, mspy, bark, qust], i) => (
                <tr key={feature} style={{ borderBottom: i < 5 ? "1px solid var(--border)" : "none" }}>
                  <td className="p-5 text-white/90">{feature}</td>
                  <td className="p-5 font-600 text-green-300">{us}</td>
                  <td className="p-5 text-[var(--text-muted)]">{mspy}</td>
                  <td className="p-5 text-[var(--text-muted)]">{bark}</td>
                  <td className="p-5 text-[var(--text-muted)]">{qust}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="font-display font-700 text-4xl text-center mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Questions parents ask</h2>
        <p className="text-[var(--text-muted)] text-center mb-14">Straight answers. No fine print.</p>
        <div className="space-y-4">
          {[
            { q: "Is this spyware?", a: "No. KIDSbSAFE is explicitly ethical monitoring for parents of their own minor children. It is not a stalking or covert-surveillance tool like mSpy or TheOneSpy." },
            { q: "Can kids see it?", a: "Yes — by default. The child app clearly shows monitoring is active with a friendly explanation. Under-13 devices are parent-controlled; for kids 13+ there's a visible opt-out that notifies the parent." },
            { q: "Do you read all my child's messages?", a: "No. Normal activity (homework, memes, friends) stays private. We only surface high-risk signals — grooming language, suspicious unknown contacts, dangerous content." },
            { q: "How does predator detection work?", a: "A rule-based risk engine scores messages, contacts and GPS patterns 0–100. Alerts fire only at 70+ risk, e.g. an unknown contact asking 'ASL?' or pushing meet-ups / private photos." },
            { q: "What platforms are covered?", a: "We focus on social platforms where predators operate — Roblox, TikTok, Instagram, Snapchat — plus web browsing safety and geofencing." },
            { q: "Do I need to install anything on a real device to try it?", a: "No. The demo runs with simulated child data so you can explore the parent dashboard immediately." },
          ].map((f) => (
            <details key={f.q} className="glass p-5 rounded-2xl group" style={{ border: "1px solid var(--border)" }}>
              <summary className="font-600 cursor-pointer list-none flex justify-between items-center" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {f.q}
                <span className="text-[var(--text-muted)] group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <p className="text-sm text-[var(--text-muted)] mt-3 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/pricing">
            <button className="px-8 py-4 rounded-2xl text-white font-700 text-base hover:opacity-90 transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #F97316, #EC4899)", fontFamily: 'Outfit, sans-serif' }}>
              See Pricing
            </button>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
