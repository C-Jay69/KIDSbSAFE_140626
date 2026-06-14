import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "../../lib/auth";
import { api } from "../../lib/api";

export default function ChildrenScreen() {
  const { data: session } = authClient.useSession();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [error, setError] = useState("");

  const family = useQuery({
    queryKey: ["family"],
    queryFn: async () => (await api.families.me.$get()).json(),
    enabled: !!session,
  });

  const familyData = family.data as { family: any; children: any[] } | undefined;

  const createFamilyMut = useMutation({
    mutationFn: async (familyName: string) => (await api.families.$post({ json: { name: familyName } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["family"] }),
  });

  const addChild = useMutation({
    mutationFn: async ({ name, age }: { name: string; age: number }) =>
      (await api.children.$post({ json: { name, age } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["family"] }),
  });

  const pairMut = useMutation({
    mutationFn: async (childId: string) =>
      (await api.children[":id"].pair.$post({ param: { id: childId } })).json(),
  });

  const handleAddChild = async () => {
    setError("");
    const ageNum = parseInt(age);
    if (!name.trim() || isNaN(ageNum) || ageNum < 5 || ageNum > 17) {
      setError("Name required. Age must be 5–17.");
      return;
    }

    if (!familyData?.family) {
      await createFamilyMut.mutateAsync("My Family");
    }

    const result = await addChild.mutateAsync({ name: name.trim(), age: ageNum });
    if ((result as any).error) { setError((result as any).error); return; }
    const codeResult = await pairMut.mutateAsync((result as any).id);
    if ((codeResult as any).pairingCode) {
      setPairingCode((codeResult as any).pairingCode);
      setShowAdd(false);
      setName(""); setAge("");
    }
  };

  const handlePairExisting = async (childId: string) => {
    const result = await pairMut.mutateAsync(childId);
    if ((result as any).pairingCode) setPairingCode((result as any).pairingCode);
  };

  const children = familyData?.children ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Children</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {children.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👨‍👩‍👧</Text>
            <Text style={styles.emptyTitle}>No children yet</Text>
            <Text style={styles.emptyDesc}>Add your first child to start monitoring.</Text>
            <TouchableOpacity style={styles.ctaBtn} onPress={() => setShowAdd(true)}>
              <Text style={styles.ctaBtnText}>Add First Child</Text>
            </TouchableOpacity>
          </View>
        ) : (
          children.map((c) => (
            <View key={c.id} style={styles.childCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{c.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.childName}>{c.name}</Text>
                <Text style={styles.childMeta}>Age {c.age} · {c.pairedAt ? "Paired" : "Not paired"}</Text>
              </View>
              {!c.pairedAt && (
                <TouchableOpacity style={styles.pairBtn} onPress={() => handlePairExisting(c.id)} disabled={pairMut.isPending}>
                  <Text style={styles.pairBtnText}>Pair</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Child Modal */}
      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Child</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Child's name"
              placeholderTextColor="#475569"
            />
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="Age (5–17)"
              keyboardType="numeric"
              placeholderTextColor="#475569"
            />
            {!!error && <Text style={styles.error}>{error}</Text>}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowAdd(false); setError(""); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAddChild} disabled={addChild.isPending}>
                <Text style={styles.confirmText}>{addChild.isPending ? "Adding..." : "Add & Pair"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pairing Code Modal */}
      <Modal visible={!!pairingCode} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Pairing Code</Text>
            <Text style={styles.modalSub}>Enter this on the child's device:</Text>
            <View style={styles.codeBox}>
              <Text style={styles.code}>{pairingCode}</Text>
            </View>
            <Text style={styles.codeNote}>Valid for 15 minutes. Your child's app will show monitoring is active.</Text>
            <TouchableOpacity style={styles.confirmBtn} onPress={() => setPairingCode(null)}>
              <Text style={styles.confirmText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A0B14" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "800", color: "#F8FAFC" },
  addBtn: { backgroundColor: "rgba(124,58,237,0.2)", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: "rgba(124,58,237,0.4)" },
  addBtnText: { color: "#A78BFA", fontWeight: "700", fontSize: 13 },
  scroll: { flex: 1 },
  content: { padding: 20, paddingTop: 8, paddingBottom: 32 },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#F8FAFC", marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: "#94A3B8", textAlign: "center", marginBottom: 24 },
  ctaBtn: { backgroundColor: "#7C3AED", borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  ctaBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  childCard: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(124,58,237,0.25)", alignItems: "center", justifyContent: "center", marginRight: 14 },
  avatarText: { color: "#A78BFA", fontWeight: "800", fontSize: 18 },
  childName: { color: "#F8FAFC", fontWeight: "600", fontSize: 15 },
  childMeta: { color: "#94A3B8", fontSize: 12, marginTop: 2 },
  pairBtn: { backgroundColor: "rgba(249,115,22,0.15)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(249,115,22,0.3)" },
  pairBtnText: { color: "#F97316", fontWeight: "600", fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  modal: { backgroundColor: "#0F1120", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, borderTopWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#F8FAFC", marginBottom: 6 },
  modalSub: { fontSize: 13, color: "#94A3B8", marginBottom: 20 },
  input: { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 14, color: "#F8FAFC", fontSize: 14, marginBottom: 14 },
  error: { color: "#FCA5A5", fontSize: 12, marginBottom: 10 },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center" },
  cancelText: { color: "#94A3B8", fontWeight: "600" },
  confirmBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: "#7C3AED", alignItems: "center" },
  confirmText: { color: "#fff", fontWeight: "700" },
  codeBox: { backgroundColor: "rgba(124,58,237,0.15)", borderRadius: 16, padding: 24, alignItems: "center", marginBottom: 16, borderWidth: 1, borderColor: "rgba(167,139,250,0.3)" },
  code: { fontSize: 40, fontWeight: "800", color: "#A78BFA", letterSpacing: 8 },
  codeNote: { color: "#94A3B8", fontSize: 12, textAlign: "center", lineHeight: 18, marginBottom: 20 },
});
