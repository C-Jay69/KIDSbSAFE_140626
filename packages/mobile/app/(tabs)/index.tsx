import { View, Text, ScrollView, StyleSheet, RefreshControl, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { authClient } from "../../lib/auth";
import { api } from "../../lib/api";

export default function DashboardScreen() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const family = useQuery({
    queryKey: ["family"],
    queryFn: async () => (await api.families.me.$get()).json(),
    enabled: !!session,
  });

  const alerts = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => (await api.alerts.$get()).json(),
    enabled: !!session,
    refetchInterval: 30000,
  });

  const familyData = family.data as { family: any; children: any[] } | undefined;
  const alertList = (alerts.data as { alerts: any[] } | undefined)?.alerts ?? [];
  const children = familyData?.children ?? [];
  const criticalAlerts = alertList.filter((a) => a.riskScore >= 80);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={family.isLoading} onRefresh={() => { family.refetch(); alerts.refetch(); }} />}
      >
        <Image source={require("../../assets/logo.png")} style={styles.brand} resizeMode="contain" />
        <Text style={styles.greeting}>
          {session?.user?.name ? `Hello, ${session.user.name.split(" ")[0]}` : "Dashboard"}
        </Text>
        {familyData?.family && (
          <Text style={styles.familyName}>{familyData.family.name} Family</Text>
        )}

        {/* Critical alert banner */}
        {criticalAlerts.length > 0 && (
          <View style={styles.criticalBanner}>
            <Text style={styles.criticalTitle}>⚠️ {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? "s" : ""}</Text>
            <Text style={styles.criticalDesc}>{criticalAlerts[0].summary}</Text>
          </View>
        )}

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: "#A78BFA" }]}>{children.length}</Text>
            <Text style={styles.statLabel}>Children</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: alertList.length > 0 ? "#EF4444" : "#10B981" }]}>{alertList.length}</Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: "#F97316" }]}>{children.filter((c) => c.pairedAt).length}</Text>
            <Text style={styles.statLabel}>Paired</Text>
          </View>
        </View>

        {/* Children */}
        {/* Child device setup banner */}
        <TouchableOpacity style={styles.childDeviceBanner} onPress={() => router.push("/(child)/")}>
          <Text style={styles.childDeviceEmoji}>🧒</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.childDeviceTitle}>Setting up a child's device?</Text>
            <Text style={styles.childDeviceSub}>Tap here to enter a pairing code</Text>
          </View>
          <Text style={styles.childDeviceArrow}>→</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Children</Text>
        {children.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No children added. Go to Children tab to add one.</Text>
          </View>
        ) : (
          children.map((c) => (
            <View key={c.id} style={styles.childCard}>
              <View style={styles.childAvatar}>
                <Text style={styles.childAvatarText}>{c.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.childName}>{c.name}</Text>
                <Text style={styles.childAge}>Age {c.age}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: c.pairedAt ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)" }]}>
                <Text style={[styles.badgeText, { color: c.pairedAt ? "#10B981" : "#F59E0B" }]}>
                  {c.pairedAt ? "Paired" : "Unpaired"}
                </Text>
              </View>
            </View>
          ))
        )}

        {/* Recent alerts */}
        {alertList.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            {alertList.slice(0, 3).map((a: any) => (
              <View key={a.id} style={[styles.alertCard, a.riskScore >= 80 ? styles.alertCritical : styles.alertHigh]}>
                <View style={styles.scoreCircle}>
                  <Text style={styles.scoreText}>{a.riskScore}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertSummary} numberOfLines={2}>{a.summary}</Text>
                  <Text style={styles.alertTime}>{new Date(a.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A0B14" },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 32 },
  brand: { width: 160, height: 52, marginBottom: 2 },
  greeting: { fontSize: 28, fontWeight: "700", color: "#F8FAFC", marginBottom: 4 },
  familyName: { fontSize: 14, color: "#94A3B8", marginBottom: 20 },
  criticalBanner: { backgroundColor: "rgba(239,68,68,0.15)", borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: "rgba(239,68,68,0.3)" },
  criticalTitle: { color: "#FCA5A5", fontWeight: "700", fontSize: 14, marginBottom: 4 },
  criticalDesc: { color: "#FCA5A5", fontSize: 12, opacity: 0.8 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", alignItems: "center" },
  statValue: { fontSize: 28, fontWeight: "800" },
  statLabel: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#F8FAFC", marginBottom: 12 },
  emptyCard: { backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", marginBottom: 20 },
  emptyText: { color: "#94A3B8", fontSize: 13, textAlign: "center" },
  childCard: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  childAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(124,58,237,0.3)", alignItems: "center", justifyContent: "center", marginRight: 12 },
  childAvatarText: { color: "#A78BFA", fontWeight: "700", fontSize: 16 },
  childName: { color: "#F8FAFC", fontWeight: "600", fontSize: 14 },
  childAge: { color: "#94A3B8", fontSize: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  alertCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, gap: 12 },
  alertCritical: { backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)" },
  alertHigh: { backgroundColor: "rgba(245,158,11,0.1)", borderColor: "rgba(245,158,11,0.3)" },
  scoreCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(239,68,68,0.2)", alignItems: "center", justifyContent: "center" },
  scoreText: { color: "#FCA5A5", fontWeight: "800", fontSize: 14 },
  alertSummary: { color: "#F8FAFC", fontSize: 13, fontWeight: "500" },
  alertTime: { color: "#94A3B8", fontSize: 11, marginTop: 2 },
  childDeviceBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "rgba(236,72,153,0.08)", borderWidth: 1,
    borderColor: "rgba(236,72,153,0.25)", borderRadius: 14,
    padding: 16, marginBottom: 20,
  },
  childDeviceEmoji: { fontSize: 26 },
  childDeviceTitle: { color: "#F8FAFC", fontWeight: "700", fontSize: 14, marginBottom: 2 },
  childDeviceSub: { color: "#94A3B8", fontSize: 12 },
  childDeviceArrow: { color: "#EC4899", fontSize: 18, fontWeight: "700" },
});
