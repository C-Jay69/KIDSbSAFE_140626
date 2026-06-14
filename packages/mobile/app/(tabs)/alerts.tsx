import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "../../lib/auth";
import { api } from "../../lib/api";

function riskColor(score: number) {
  if (score >= 80) return { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", text: "#FCA5A5", label: "Critical" };
  return { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", text: "#FCD34D", label: "High" };
}

export default function AlertsScreen() {
  const { data: session } = authClient.useSession();
  const qc = useQueryClient();

  const alertsQ = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => (await api.alerts.$get()).json(),
    enabled: !!session,
    refetchInterval: 20000,
  });

  const dismissMut = useMutation({
    mutationFn: async (alertId: string) =>
      (await api.alerts[":id"].dismiss.$post({ param: { id: alertId } })).json(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });

  const alertList = (alertsQ.data as { alerts: any[] } | undefined)?.alerts ?? [];

  const confirmDismiss = (alertId: string) => {
    Alert.alert("Dismiss Alert", "Mark this alert as reviewed?", [
      { text: "Cancel", style: "cancel" },
      { text: "Dismiss", style: "destructive", onPress: () => dismissMut.mutate(alertId) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Risk Alerts</Text>
        {alertList.length > 0 && <Text style={styles.count}>{alertList.length} active</Text>}
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={alertsQ.isLoading} onRefresh={() => alertsQ.refetch()} />}
      >
        {alertList.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.emptyTitle}>All Clear</Text>
            <Text style={styles.emptyDesc}>No active risk alerts. We're watching.</Text>
          </View>
        ) : (
          alertList.map((a: any) => {
            const colors = riskColor(a.riskScore);
            return (
              <View key={a.id} style={[styles.alertCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                <View style={styles.alertHeader}>
                  <View style={[styles.scoreBadge, { backgroundColor: `${colors.border}30` }]}>
                    <Text style={[styles.scoreText, { color: colors.text }]}>{a.riskScore}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.riskLabel, { color: colors.text }]}>{colors.label} Risk</Text>
                    <Text style={styles.category}>{a.category}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.dismissBtn}
                    onPress={() => confirmDismiss(a.id)}
                    disabled={dismissMut.isPending}
                  >
                    <Text style={styles.dismissText}>Dismiss</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.summary}>{a.summary}</Text>
                <Text style={styles.time}>{new Date(a.createdAt).toLocaleString()}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A0B14" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "800", color: "#F8FAFC" },
  count: { fontSize: 13, color: "#EF4444", fontWeight: "600" },
  scroll: { flex: 1 },
  content: { padding: 20, paddingTop: 8, paddingBottom: 32 },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#F8FAFC", marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: "#94A3B8", textAlign: "center" },
  alertCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  alertHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  scoreBadge: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  scoreText: { fontSize: 16, fontWeight: "800" },
  riskLabel: { fontSize: 13, fontWeight: "700" },
  category: { fontSize: 11, color: "#94A3B8", textTransform: "capitalize", marginTop: 2 },
  dismissBtn: { backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  dismissText: { color: "#94A3B8", fontSize: 12, fontWeight: "600" },
  summary: { color: "#F8FAFC", fontSize: 13, lineHeight: 20, marginBottom: 8 },
  time: { color: "#475569", fontSize: 11 },
});
