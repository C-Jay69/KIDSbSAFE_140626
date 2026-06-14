import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function NetworkGuardSetup() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🌐</Text>
          </View>
          <Text style={styles.title}>Network Guard</Text>
          <Text style={styles.subtitle}>
            Activate system-wide protection for all browsers (Safari, Chrome, Firefox).
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How it works</Text>
          <Text style={styles.infoText}>
            Network Guard uses a Secure DNS (Domain Name System) filter. Instead of reading your screen, it checks the "address" of the websites you visit. If a website is flagged as dangerous, your parent is notified instantly.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Setup Instructions</Text>

        {/* Android Setup */}
        <View style={styles.setupCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.osIcon}>🤖</Text>
            <Text style={styles.osText}>Android Setup</Text>
          </View>
          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <Text style={styles.stepNum}>1</Text>
              <Text style={styles.stepText}>Open <Text style={styles.bold}>Settings</Text> → <Text style={styles.bold}>Network & Internet</Text></Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNum}>2</Text>
              <Text style={styles.stepText}>Tap on <Text style={styles.bold}>Private DNS</Text></Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNum}>3</Text>
              <Text style={styles.stepText}>Select <Text style={styles.bold}>Private DNS provider hostname</Text></Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNum}>4</Text>
              <Text style={styles.stepText}>Enter: <Text style={styles.dnsValue}>dns.kidsbsafe.com</Text></Text>
            </View>
          </View>
        </View>

        {/* iOS Setup */}
        <View style={styles.setupCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.osIcon}>🍎</Text>
            <Text style={styles.osText}>iOS Setup</Text>
          </View>
          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <Text style={styles.stepNum}>1</Text>
              <Text style={styles.stepText}>Open <Text style={styles.bold}>Settings</Text> → <Text style={styles.bold}>General</Text></Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNum}>2</Text>
              <Text style={styles.stepText}>Tap on <Text style={styles.bold}>VPN & Device Management</Text></Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNum}>3</Text>
              <Text style={styles.stepText}>Install the <Text style={styles.bold}>KIDSbSAFE DNS Profile</Text> sent to your email</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNum}>4</Text>
              <Text style={styles.stepText}>Set <Text style={styles.bold}>DNS</Text> to <Text style={styles.bold}>Automatic</Text></Text>
            </View>
          </View>
        </View>

        <View style={styles.footerBox}>
          <Text style={styles.footerTitle}>🛡️ System-Wide Protection</Text>
          <Text style={styles.footerText}>
            Once configured, your device is protected across all apps. No matter which browser you use, the Guardian is watching for danger.
          </Text>
        </View>

        <Pressable style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>I've Configured My DNS</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A0B14" },
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },
  back: { marginBottom: 24, alignSelf: "flex-start" },
  backText: { color: "#A78BFA", fontSize: 15 },
  header: { alignItems: "center", marginBottom: 32 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(124,58,237,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 16,
    borderWidth: 1, borderColor: "rgba(167,139,250,0.3)",
  },
  iconText: { fontSize: 40 },
  title: { fontSize: 28, fontWeight: "800", color: "#F8FAFC", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#94A3B8", textAlign: "center", lineHeight: 20 },
  infoBox: {
    backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", marginBottom: 32,
  },
  infoTitle: { color: "#A78BFA", fontWeight: "700", fontSize: 15, marginBottom: 8 },
  infoText: { color: "#64748B", fontSize: 13, lineHeight: 20 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#EF4444", letterSpacing: 1.2, marginBottom: 16, textTransform: "uppercase" },
  setupCard: {
    backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  osIcon: { fontSize: 24 },
  osText: { fontSize: 18, fontWeight: "700", color: "#F8FAFC" },
  stepContainer: { gap: 16 },
  step: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepNum: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: "#7C3AED",
    color: "#fff", textAlign: "center", lineHeight: 24, fontWeight: "bold", fontSize: 12,
  },
  stepText: { color: "#94A3B8", fontSize: 13, lineHeight: 18, flex: 1 },
  bold: { color: "#F8FAFC", fontWeight: "600" },
  dnsValue: { color: "#A78BFA", fontWeight: "700", fontFamily: "monospace" },
  footerBox: {
    marginTop: 24, backgroundColor: "rgba(124,58,237,0.06)", borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: "rgba(167,139,250,0.2)", textAlign: "center",
  },
  footerTitle: { color: "#A78BFA", fontWeight: "700", fontSize: 14, marginBottom: 4 },
  footerText: { color: "#64748B", fontSize: 12, lineHeight: 18 },
  doneBtn: {
    marginTop: 32, backgroundColor: "#7C3AED", borderRadius: 16,
    paddingVertical: 16, alignItems: "center",
  },
  doneBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
