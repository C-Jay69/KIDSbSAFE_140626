import { Redirect } from "wouter";
import { authClient } from "../lib/auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-center">
          <div className="font-display font-800 text-2xl gradient-text mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>KIDSbSAFE</div>
          <div className="text-[var(--text-muted)] text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) return <Redirect to="/sign-in" />;
  return <>{children}</>;
}
