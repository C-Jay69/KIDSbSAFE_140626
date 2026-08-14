import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCustomer, useListPlans } from "autumn-js/react";
import { authClient, clearToken } from "../../lib/auth";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const { data: session } = authClient.useSession();
  const { data: customer, attach, isPending } = useCustomer();
  const { data: plans } = useListPlans();
  const router = useRouter();

  const activePlan = customer?.subscriptions?.[0]?.planId ?? "free";
  const scansBalance = customer?.balances?.["scans"];

  const handleSignOut = async () => {
    await authClient.signOut();
    await clearToken();
    router.replace("/sign-in");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Name</Text>
            <Text style={styles.rowValue}>{session?.user?.name}</Text>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue} numberOfLines={1}>{session?.user?.email}</Text>
          </View>
        </View>

        {/* Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usage</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Current Plan</Text>
            <Text style={[styles.rowValue, { color: "#A78BFA", fontWeight: "700", textTransform: "capitalize" }]}>{activePlan}</Text>
          </View>
          {scansBalance && (
            <View style={[styles.row, styles.rowLast]}>
              <Text style={styles.rowLabel}>Risk Scans</Text>
              <Text style={styles.rowValue}>
                {scansBalance.usage} / {scansBalance.unlimited ? "∞" : scansBalance.granted}
              </Text>
            </View>
          )}
        </View>

        {/* Subscription */}
        <Text style={styles.sectionTitle}>Subscription Plans</Text>
        {(plans ?? []).map((plan) => {
          const isActive = plan.id === activePlan;
          const action = plan.customerEligibility?.attachAction;
          return (
            <View key={plan.id} style={[styles.planCard, isActive && styles.planCardActive]}>
              <View>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>
                  {plan.price ? `$${(plan.price.amount / 100).toFixed(2)}/mo` : "Free"}
                </Text>
              </View>
              {isActive ? (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Current</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.switchBtn}
                  disabled={isPending || action === "none"}
                  onPress={() => attach({ planId: plan.id, successUrl: undefined })}
                >
                  <Text style={styles.switchBtnText}>
                    {action === "upgrade" ? "Upgrade" : action === "downgrade" ? "Downgrade" : "Switch"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A0B14" },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: "800", color: "#F8FAFC", marginBottom: 24 },
  section: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", marginBottom: 20, overflow: "hidden" },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, marginTop: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.04)" },
  rowLast: { borderBottomWidth: 0 },
  rowLabel: { color: "#94A3B8", fontSize: 14 },
  rowValue: { color: "#F8FAFC", fontSize: 14, fontWeight: "500", maxWidth: 180, textAlign: "right" },
  planCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  planCardActive: { backgroundColor: "rgba(124,58,237,0.12)", borderColor: "rgba(167,139,250,0.3)" },
  planName: { color: "#F8FAFC", fontWeight: "700", fontSize: 15 },
  planPrice: { color: "#94A3B8", fontSize: 12, marginTop: 2 },
  activeBadge: { backgroundColor: "rgba(124,58,237,0.2)", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  activeBadgeText: { color: "#A78BFA", fontSize: 12, fontWeight: "600" },
  switchBtn: { backgroundColor: "#7C3AED", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  switchBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  signOutBtn: { marginTop: 24, padding: 16, borderRadius: 14, alignItems: "center", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)", backgroundColor: "rgba(239,68,68,0.05)" },
  signOutText: { color: "#EF4444", fontWeight: "700", fontSize: 14 },
});
