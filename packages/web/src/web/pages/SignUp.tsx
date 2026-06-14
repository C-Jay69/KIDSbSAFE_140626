import { useState } from "react";
import { Link, useLocation } from "wouter";
import { authClient, captureToken } from "../lib/auth";

export default function SignUpPage() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await authClient.signUp.email(
        { name, email, password },
        { onSuccess: captureToken }
      );
      if (result.error) {
        setError(result.error.message ?? "Registration failed");
      } else {
        navigate("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-mesh" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <img src="/logo.png" alt="KIDSbSAFE" className="h-14 w-auto mx-auto mb-2 cursor-pointer" />
          </Link>
          <p className="text-[var(--text-muted)] text-sm">Create your family safety account.</p>
        </div>

        <div className="glass-strong p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-500 mb-2 text-[var(--text-muted)]">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)" }}
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-500 mb-2 text-[var(--text-muted)]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)" }}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-500 mb-2 text-[var(--text-muted)]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)" }}
                placeholder="Min. 8 characters"
              />
            </div>
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm text-red-300" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-700 text-white text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #F97316, #EC4899)", fontFamily: 'Outfit, sans-serif' }}
            >
              {loading ? "Creating account..." : "Create Free Account"}
            </button>
          </form>
          <p className="text-center text-xs text-[var(--text-muted)] mt-4">
            By signing up you agree to our ethical monitoring principles.
          </p>
          <p className="text-center text-sm text-[var(--text-muted)] mt-4">
            Already have an account?{" "}
            <Link href="/sign-in">
              <span className="text-purple-400 hover:text-purple-300 cursor-pointer font-500">Sign in</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
