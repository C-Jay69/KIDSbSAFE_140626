import { Link } from "wouter";
import { useCustomer, useListPlans } from "autumn-js/react";
import { authClient } from "../lib/auth";

export default function SettingsPage() {
  const { data: session } = authClient.useSession();
  const { data: customer, attach, isPending } = useCustomer();
  const { data: plans } = useListPlans();

  const activePlan = customer?.subscriptions?.[0]?.planId ?? "free";
  const scansBalance = customer?.balances?.["scans"];

  return (
    <div className="min-h-screen p-8" style={{ background: "var(--bg)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <button className="text-[var(--text-muted)] hover:text-white text-sm">← Back</button>
          </Link>
          <div>
            <h1 className="font-display font-700 text-2xl" style={{ fontFamily: 'Outfit, sans-serif' }}>Settings</h1>
            <p className="text-[var(--text-muted)] text-sm">Account & subscription</p>
          </div>
        </div>

        {/* Account */}
        <div className="glass p-6 rounded-2xl mb-6">
          <h2 className="font-display font-600 text-lg mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Account</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Name</span>
              <span>{session?.user?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Email</span>
              <span>{session?.user?.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Plan</span>
              <span className="text-purple-400 capitalize font-600">{activePlan}</span>
            </div>
          </div>
        </div>

        {/* Usage */}
        {scansBalance && (
          <div className="glass p-6 rounded-2xl mb-6">
            <h2 className="font-display font-600 text-lg mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Usage This Month</h2>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[var(--text-muted)]">Risk Scans</span>
              <span>{scansBalance.usage} / {scansBalance.unlimited ? "∞" : scansBalance.granted}</span>
            </div>
            {!scansBalance.unlimited && (
              <div className="w-full rounded-full overflow-hidden h-2" style={{ background: "rgba(255,255,255,0.1)" }}>
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, (scansBalance.usage / scansBalance.granted) * 100)}%`,
                    background: "linear-gradient(90deg, #7C3AED, #A78BFA)",
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Plans */}
        <div className="glass p-6 rounded-2xl">
          <h2 className="font-display font-600 text-lg mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>Subscription Plans</h2>
          <div className="space-y-4">
            {(plans ?? []).map((plan) => {
              const isActive = plan.id === activePlan;
              const action = plan.customerEligibility?.attachAction;
              return (
                <div key={plan.id} className={`p-4 rounded-xl flex items-center justify-between transition-all ${isActive ? "border-purple-500/40" : ""}`}
                  style={{
                    background: isActive ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.03)",
                    border: isActive ? "1px solid rgba(167,139,250,0.3)" : "1px solid var(--border)",
                  }}>
                  <div>
                    <div className="font-600 text-sm">{plan.name}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">
                      {plan.price ? `$${(plan.price.amount / 100).toFixed(2)}/mo` : "Free"}
                    </div>
                  </div>
                  {isActive ? (
                    <span className="text-xs px-3 py-1 rounded-full text-purple-300" style={{ background: "rgba(124,58,237,0.2)" }}>Current</span>
                  ) : (
                    <button
                      disabled={isPending || action === "none"}
                      onClick={() => attach({ planId: plan.id, successUrl: window.location.origin + "/settings" })}
                      className="text-xs px-4 py-2 rounded-xl font-600 gradient-purple text-white hover:opacity-90 disabled:opacity-50 transition-all"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {action === "upgrade" ? "Upgrade" : action === "downgrade" ? "Downgrade" : "Switch"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
