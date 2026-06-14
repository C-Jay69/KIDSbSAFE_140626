import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient, clearToken } from "../lib/auth";
import { api } from "../lib/api";
import { useCustomer } from "autumn-js/react";

type Alert = { id: string; childId: string; riskScore: number; summary: string; category: string; createdAt: string };
type Child = { id: string; name: string; age: number; pairedAt: string | null };
type Family = { id: string; name: string };
type BrowseEntry = { id: string; childId: string; domain: string; url: string; title: string | null; flagged: boolean; flagReason: string | null; riskScore: number; visitedAt: string };

function getRiskLabel(score: number) {
  if (score >= 80) return { label: "Critical", className: "risk-critical" };
  if (score >= 70) return { label: "High", className: "risk-high" };
  return { label: "Medium", className: "risk-medium" };
}

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const { data: session } = authClient.useSession();
  const { data: customer } = useCustomer();
  const qc = useQueryClient();

  const family = useQuery({
    queryKey: ["family"],
    queryFn: async () => (await api.families.me.$get()).json(),
    enabled: !!session,
  });

  const alertsQ = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => (await api.alerts.$get()).json(),
    enabled: !!session,
    refetchInterval: 30000,
  });

  const dismissMut = useMutation({
    mutationFn: async (alertId: string) =>
      (await api.alerts[":id"].dismiss.$post({ param: { id: alertId } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const createFamily = useMutation({
    mutationFn: async (name: string) =>
      (await api.families.$post({ json: { name } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["family"] }),
  });

  const [newFamilyName, setNewFamilyName] = useState("");
  const [familyError, setFamilyError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "browse">("overview");
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  const browseQ = useQuery({
    queryKey: ["browse", selectedChild],
    queryFn: async () => {
      const url = selectedChild
        ? `/api/browse/history?childId=${selectedChild}`
        : `/api/browse/history`;
      const res = await fetch(url, {
        headers: (() => {
          const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
          return token ? { Authorization: `Bearer ${token}` } : {};
        })(),
      });
      return res.json() as Promise<{ history: BrowseEntry[] }>;
    },
    enabled: !!session && activeTab === "browse",
    refetchInterval: 15000,
  });

  const handleSignOut = async () => {
    await authClient.signOut();
    clearToken();
    navigate("/");
  };

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setFamilyError("");
    if (!newFamilyName.trim()) return;
    const result = await createFamily.mutateAsync(newFamilyName.trim());
    if ((result as any).error) setFamilyError((result as any).error);
  };

  const familyData = family.data as { family: Family | null; children: Child[] } | undefined;
  const alerts = (alertsQ.data as { alerts: Alert[] } | undefined)?.alerts ?? [];
  const children = familyData?.children ?? [];
  const activePlan = customer?.subscriptions?.[0]?.planId ?? "free";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Sidebar + Layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-60 min-h-screen p-5 flex flex-col" style={{ background: "rgba(255,255,255,0.02)", borderRight: "1px solid var(--border)" }}>
          <img src="/logo.png" alt="KIDSbSAFE" className="h-10 w-auto mb-8" />
          <nav className="flex-1 space-y-1">
            {[
              { label: "Dashboard", icon: "⬛", tab: "overview" as const },
              { label: "Browsing History", icon: "🌐", tab: "browse" as const },
            ].map((n) => (
              <div
                key={n.label}
                onClick={() => setActiveTab(n.tab)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-all"
                style={{
                  color: activeTab === n.tab ? "white" : "var(--text-muted)",
                  background: activeTab === n.tab ? "rgba(124,58,237,0.2)" : "transparent",
                }}
              >
                <span>{n.icon}</span>
                {n.label}
              </div>
            ))}
            {[
              { label: "Alerts", href: "/dashboard#alerts", icon: "🔔" },
              { label: "Pair Device", href: "/pair", icon: "📱" },
              { label: "Settings", href: "/settings", icon: "⚙️" },
            ].map((n) => (
              <Link key={n.label} href={n.href}>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-muted)] hover:text-white hover:bg-white/5 cursor-pointer transition-all">
                  <span>{n.icon}</span>
                  {n.label}
                </div>
              </Link>
            ))}
          </nav>
          <div className="mt-auto pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="text-xs text-[var(--text-muted)] mb-1">{session?.user?.email}</div>
            <div className="text-xs text-purple-400 capitalize mb-3">{activePlan} plan</div>
            <button onClick={handleSignOut} className="text-xs text-red-400 hover:text-red-300 transition-colors">Sign out</button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="font-display font-700 text-3xl" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {activeTab === "browse" ? "Browsing History" : (familyData?.family ? `${familyData.family.name} Family` : "Dashboard")}
              </h1>
              <p className="text-[var(--text-muted)] text-sm mt-1">
                {session?.user?.name ? `Welcome back, ${session.user.name}` : "Welcome back"}
              </p>
            </div>

            {/* Browsing History Tab */}
            {activeTab === "browse" && (
              <div>
                {/* Child filter */}
                {children.length > 1 && (
                  <div className="flex gap-2 mb-6 flex-wrap">
                    <button
                      onClick={() => setSelectedChild(null)}
                      className="px-4 py-1.5 rounded-full text-sm font-500 transition-all"
                      style={{
                        background: selectedChild === null ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.05)",
                        color: selectedChild === null ? "#A78BFA" : "var(--text-muted)",
                        border: `1px solid ${selectedChild === null ? "rgba(124,58,237,0.5)" : "var(--border)"}`,
                      }}
                    >All Children</button>
                    {children.map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => setSelectedChild(ch.id)}
                        className="px-4 py-1.5 rounded-full text-sm font-500 transition-all"
                        style={{
                          background: selectedChild === ch.id ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.05)",
                          color: selectedChild === ch.id ? "#A78BFA" : "var(--text-muted)",
                          border: `1px solid ${selectedChild === ch.id ? "rgba(124,58,237,0.5)" : "var(--border)"}`,
                        }}
                      >{ch.name}</button>
                    ))}
                  </div>
                )}

                <div className="glass p-6 rounded-2xl">
                  {browseQ.isLoading ? (
                    <p className="text-[var(--text-muted)] text-sm">Loading history...</p>
                  ) : !browseQ.data?.history.length ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">🌐</div>
                      <p className="text-[var(--text-muted)] text-sm">No browsing history yet. The child needs to use the KIDSbSAFE browser on their device.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {browseQ.data.history.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 rounded-xl"
                          style={{
                            background: entry.flagged ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${entry.flagged ? "rgba(239,68,68,0.25)" : "var(--border)"}`,
                          }}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-lg">{entry.flagged ? "🚫" : "🌐"}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-500 text-white truncate">{entry.domain}</span>
                                {entry.flagged && (
                                  <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                                    Blocked · {entry.riskScore}
                                  </span>
                                )}
                              </div>
                              {entry.flagged && entry.flagReason && (
                                <p className="text-xs text-red-400 mt-0.5">{entry.flagReason}</p>
                              )}
                              {entry.title && <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{entry.title}</p>}
                            </div>
                          </div>
                          <span className="text-xs text-[var(--text-muted)] shrink-0 ml-4">
                            {new Date(entry.visitedAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === "overview" && (<>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Children", value: children.length, color: "var(--purple-light)" },
                { label: "Active Alerts", value: alerts.length, color: alerts.length > 0 ? "var(--danger)" : "var(--success)" },
                { label: "Plan", value: activePlan.charAt(0).toUpperCase() + activePlan.slice(1), color: "var(--warning)" },
              ].map((s) => (
                <div key={s.label} className="glass p-5 rounded-2xl">
                  <div className="text-3xl font-display font-800 mb-1" style={{ color: s.color, fontFamily: 'Outfit, sans-serif' }}>{s.value}</div>
                  <div className="text-sm text-[var(--text-muted)]">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Create Family */}
            {family.data && !familyData?.family && (
              <div className="glass p-6 rounded-2xl mb-8">
                <h2 className="font-display font-700 text-xl mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Create Your Family</h2>
                <form onSubmit={handleCreateFamily} className="flex gap-3">
                  <input
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    placeholder="Family name (e.g. The Smiths)"
                    className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)" }}
                  />
                  <button type="submit" className="px-6 py-2.5 rounded-xl gradient-purple text-white text-sm font-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Create
                  </button>
                </form>
                {familyError && <p className="text-red-400 text-sm mt-2">{familyError}</p>}
              </div>
            )}

            {/* Children */}
            {familyData?.family && (
              <div className="glass p-6 rounded-2xl mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-display font-700 text-xl" style={{ fontFamily: 'Outfit, sans-serif' }}>Children</h2>
                  <Link href="/pair">
                    <button className="px-4 py-2 rounded-xl text-sm font-600 gradient-purple text-white hover:opacity-90" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      + Add Child
                    </button>
                  </Link>
                </div>
                {children.length === 0 ? (
                  <p className="text-[var(--text-muted)] text-sm">No children added yet. Add a child and pair their device.</p>
                ) : (
                  <div className="space-y-3">
                    {children.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                        <div>
                          <div className="font-500">{c.name}</div>
                          <div className="text-xs text-[var(--text-muted)]">Age {c.age}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {c.pairedAt ? (
                            <span className="text-xs px-2 py-1 rounded-full text-green-400" style={{ background: "rgba(16,185,129,0.1)" }}>Paired</span>
                          ) : (
                            <Link href={`/pair?childId=${c.id}`}>
                              <span className="text-xs px-2 py-1 rounded-full text-yellow-400 cursor-pointer" style={{ background: "rgba(245,158,11,0.1)" }}>Pair Device</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Alerts */}
            <div className="glass p-6 rounded-2xl" id="alerts">
              <h2 className="font-display font-700 text-xl mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Risk Alerts {alerts.length > 0 && <span className="text-red-400 ml-2">({alerts.length})</span>}
              </h2>
              {alertsQ.isLoading ? (
                <p className="text-[var(--text-muted)] text-sm">Loading alerts...</p>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-[var(--text-muted)] text-sm">No active alerts. All clear.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((a) => {
                    const risk = getRiskLabel(a.riskScore);
                    return (
                      <div key={a.id} className={`p-4 rounded-xl border flex justify-between items-start ${a.riskScore >= 80 ? "glow-red" : ""}`}
                        style={{ background: "rgba(255,255,255,0.03)", borderColor: a.riskScore >= 80 ? "rgba(239,68,68,0.3)" : "var(--border)" }}>
                        <div className="flex-1 mr-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-600 ${risk.className}`}>{risk.label} — {a.riskScore}</span>
                            <span className="text-xs text-[var(--text-muted)] capitalize">{a.category}</span>
                          </div>
                          <p className="text-sm text-white/90">{a.summary}</p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">{new Date(a.createdAt).toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => dismissMut.mutate(a.id)}
                          className="text-xs px-3 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-white transition-colors shrink-0"
                          style={{ border: "1px solid var(--border)" }}
                        >
                          Dismiss
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            </>)}
          </div>
        </main>
      </div>
    </div>
  );
}
