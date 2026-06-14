import { useState } from "react";
import { Link, useSearch } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { authClient } from "../lib/auth";

export default function PairPage() {
  const { data: session } = authClient.useSession();
  const qc = useQueryClient();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const preselectedChildId = params.get("childId") ?? "";

  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [step, setStep] = useState<"add" | "code">("add");
  const [error, setError] = useState("");

  const family = useQuery({
    queryKey: ["family"],
    queryFn: async () => (await api.families.me.$get()).json(),
    enabled: !!session,
  });

  const addChild = useMutation({
    mutationFn: async ({ name, age }: { name: string; age: number }) =>
      (await api.children.$post({ json: { name, age } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["family"] }),
  });

  const generateCode = useMutation({
    mutationFn: async (childId: string) =>
      (await api.children[":id"].pair.$post({ param: { id: childId } })).json(),
  });

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const age = parseInt(childAge);
    if (isNaN(age) || age < 5 || age > 17) {
      setError("Child age must be between 5 and 17");
      return;
    }
    const result = await addChild.mutateAsync({ name: childName.trim(), age });
    if ((result as any).error) {
      setError((result as any).error);
      return;
    }
    const childId = (result as any).id;
    const codeResult = await generateCode.mutateAsync(childId);
    if ((codeResult as any).pairingCode) {
      setPairingCode((codeResult as any).pairingCode);
      setStep("code");
    }
  };

  const handleGenerateForExisting = async () => {
    if (!preselectedChildId) return;
    const result = await generateCode.mutateAsync(preselectedChildId);
    if ((result as any).pairingCode) {
      setPairingCode((result as any).pairingCode);
      setStep("code");
    }
  };

  const familyData = family.data as { family: any; children: any[] } | undefined;

  return (
    <div className="min-h-screen flex items-start justify-center px-4 pt-16" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <button className="text-[var(--text-muted)] hover:text-white text-sm">← Back</button>
          </Link>
          <div>
            <h1 className="font-display font-700 text-2xl" style={{ fontFamily: 'Outfit, sans-serif' }}>Pair a Device</h1>
            <p className="text-[var(--text-muted)] text-sm">Link your child's device to KIDSbSAFE</p>
          </div>
        </div>

        {step === "add" ? (
          <div className="glass-strong p-8">
            {preselectedChildId ? (
              <div>
                <p className="text-[var(--text-muted)] text-sm mb-6">Generate a pairing code for an existing child profile.</p>
                <button
                  onClick={handleGenerateForExisting}
                  disabled={generateCode.isPending}
                  className="w-full py-3 rounded-xl font-700 text-white text-sm gradient-purple hover:opacity-90 disabled:opacity-50"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {generateCode.isPending ? "Generating..." : "Generate Pairing Code"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddChild} className="space-y-5">
                <h2 className="font-display font-600 text-lg mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Add New Child</h2>
                <div>
                  <label className="block text-sm font-500 mb-2 text-[var(--text-muted)]">Child's Name</label>
                  <input
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)" }}
                    placeholder="Emma"
                  />
                </div>
                <div>
                  <label className="block text-sm font-500 mb-2 text-[var(--text-muted)]">Age</label>
                  <input
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    type="number"
                    min={5}
                    max={17}
                    required
                    className="w-full px-4 py-3 rounded-xl text-white text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)" }}
                    placeholder="12"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={addChild.isPending || generateCode.isPending}
                  className="w-full py-3 rounded-xl font-700 text-white text-sm gradient-purple hover:opacity-90 disabled:opacity-50"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {addChild.isPending || generateCode.isPending ? "Creating..." : "Add Child & Generate Code"}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="glass-strong p-8 text-center">
            <div className="text-5xl mb-4">📱</div>
            <h2 className="font-display font-700 text-xl mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Pairing Code</h2>
            <p className="text-[var(--text-muted)] text-sm mb-6">
              Enter this code in the KIDSbSAFE child app on your child's device.
            </p>
            <div className="mx-auto w-fit px-8 py-5 rounded-2xl mb-6"
              style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(167,139,250,0.1))", border: "1px solid rgba(167,139,250,0.3)" }}>
              <div className="font-display font-800 text-5xl tracking-widest gradient-text" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {pairingCode}
              </div>
            </div>
            <div className="glass rounded-xl p-4 text-left mb-6">
              <p className="text-sm font-600 mb-2">What your child will see:</p>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                "This app helps keep you safe online. It will alert your parent only if it detects something dangerous — your normal activity stays private."
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setStep("add"); setPairingCode(null); setChildName(""); setChildAge(""); }}
                className="flex-1 py-2.5 rounded-xl text-sm glass text-[var(--text-muted)] hover:text-white"
              >
                Pair Another
              </button>
              <Link href="/dashboard" className="flex-1">
                <button className="w-full py-2.5 rounded-xl text-sm gradient-purple text-white font-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Done
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
