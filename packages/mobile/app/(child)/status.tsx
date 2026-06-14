import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const MONITORED_ITEMS = [
  {
    icon: "💬",
    title: "Messages & Chats",
    desc: "Text content from messaging apps is analysed for harmful language, threats, or concerning conversations.",
  },
  {
    icon: "🌐",
    title: "Web Browsing",
    desc: "Websites visited are checked for adult content, dangerous material, or time-wasting categories.",
  },
  {
    icon: "📱",
    title: "App Usage",
    desc: "Which apps are used and for how long. Certain apps may be restricted by your parent.",
  },
  {
    icon: "📍",
    title: "Location (optional)",
    desc: "Your approximate location may be shared with your parent if they have enabled location tracking.",
  },
  {
    icon: "🤖",
    title: "AI Risk Scoring",
    desc: "An AI model analyses content and assigns a risk score. Scores ≥ 70 trigger an alert to your parent.",
  },
];

const NOT_MONITORED = [
  "Passwords or login credentials",
  "Banking or payment details",
  "Photos or camera content",
  "Microphone or audio",
];

export default function StatusScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>What's Monitored</Text>
        <Text style={styles.subtitle}>
          KIDSbSAFE is designed to keep you safe, not to spy on you. Here's exactly what is and isn't collected.
        </Text>

        <Text style={styles.sectionLabel}>Monitored</Text>
        {MONITORED_ITEMS.map((item) => (
          <View key={item.title} style={styles.card}>
            <Text style={styles.cardIcon}>{item.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}

        <Text style={[styles.sectionLabel, { color: "#10B981", marginTop: 24 }]}>Not Monitored</Text>
        <View style={styles.notCard}>
          {NOT_MONITORED.map((item) => (
            <View key={item} style={styles.notRow}>
              <Text style={styles.notCheck}>✓</Text>
              <Text style={styles.notText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.legalBox}>
          <Text style={styles.legalTitle}>Privacy & COPPA Compliance</Text>
          <Text style={styles.legalText}>
            KIDSbSAFE complies with COPPA (Children's Online Privacy Protection Act) and UK GDPR.
            All data is encrypted in transit and at rest. If you are 13 or older, you can request
            a review of monitoring through the consent screen.
          </Text>
        </View>

        <View style={styles.guardBtnContainer}>
          <Pressable style={styles.guardBtn} onPress={() => router.push("/(child)/network-guard")}>
            <Text style={styles.guardBtnText}>Activate Network Guard 🌐</Text>
          </Pressable>
          <Pressable style={styles.consentBtn} onPress={() => router.push("/(child)/consent")}>
            <Text style={styles.consentBtnText}>Request Monitoring Review (13+)</Text>
          </Pressable>
        </View>
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
  title: { fontSize: 26, fontWeight: "800", color: "#F8FAFC", marginBottom: 10 },
  subtitle: { fontSize: 14, color: "#94A3B8", lineHeight: 22, marginBottom: 28 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#EF4444", letterSpacing: 1.2, marginBottom: 12, textTransform: "uppercase" },
  card: {
    flexDirection: "row", alignItems: "flex-start", backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", gap: 14,
  },
  cardIcon: { fontSize: 24, marginTop: 2 },
  cardTitle: { color: "#F8FAFC", fontWeight: "600", fontSize: 14, marginBottom: 4 },
  cardDesc: { color: "#64748B", fontSize: 12, lineHeight: 18 },
  notCard: { backgroundColor: "rgba(16,185,129,0.06)", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "rgba(16,185,129,0.15)" },
  notRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 8, gap: 10 },
  notCheck: { color: "#10B981", fontWeight: "700", fontSize: 14 },
  notText: { color: "#94A3B8", fontSize: 13, flex: 1 },
  legalBox: {
    marginTop: 24, backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  legalTitle: { color: "#A78BFA", fontWeight: "700", fontSize: 13, marginBottom: 8 },
  legalText: { color: "#64748B", fontSize: 12, lineHeight: 18 },
  guardBtnContainer: {
    marginTop: 20, gap: 12,
  },
  guardBtn: {
    backgroundColor: "#7C3AED", borderRadius: 14, paddingVertical: 14, alignItems: "center",
    shadowColor: "#7C3AED", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  guardBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  consentBtn: {
    borderWidth: 1, borderColor: "rgba(167,139,250,0.3)", borderRadius: 14,
    paddingVertical: 14, alignItems: "center",
  },
  consentBtnText: { color: "#A78BFA", fontWeight: "600", fontSize: 14 },
});
