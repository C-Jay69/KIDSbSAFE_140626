import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function ConsentScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid = name.trim().length > 0 && Number(age) >= 13 && reason.trim().length >= 20;

  async function handleSubmit() {
    if (!isValid) return;
    setLoading(true);
    // In a real scenario this would POST to an API endpoint.
    // For MVP we simulate a brief delay and confirm submission.
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Request Submitted</Text>
          <Text style={styles.successDesc}>
            Your request has been sent to your parent. They will review it and may adjust your monitoring settings.
            This usually takes 24–48 hours.
          </Text>
          <Pressable style={styles.btn} onPress={() => router.replace("/(child)/")}>
            <Text style={styles.btnText}>Back to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          <Text style={styles.title}>Monitoring Review Request</Text>
          <Text style={styles.desc}>
            If you are 13 or older, you have the right to request a review of your monitoring settings.
            This request will be sent to your parent.
          </Text>

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ You must be 13 or older to submit this form. Providing false information is a violation of our Terms of Service.
            </Text>
          </View>

          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            placeholderTextColor="#475569"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Your Age</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="e.g. 14"
            placeholderTextColor="#475569"
            keyboardType="number-pad"
            maxLength={2}
          />
          {age.length > 0 && Number(age) < 13 && (
            <Text style={styles.ageError}>Must be 13 or older to submit this request.</Text>
          )}

          <Text style={styles.label}>Reason for Request</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={reason}
            onChangeText={setReason}
            placeholder="Explain why you want monitoring adjusted or removed..."
            placeholderTextColor="#475569"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <Text style={styles.charHint}>{reason.length} characters (min 20)</Text>

          <Pressable
            style={[styles.btn, !isValid && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={!isValid || loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Submit Request</Text>}
          </Pressable>

          <Text style={styles.note}>
            This request does not automatically change your monitoring. Your parent must approve any changes.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A0B14" },
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  back: { marginBottom: 28, alignSelf: "flex-start" },
  backText: { color: "#A78BFA", fontSize: 15 },
  title: { fontSize: 24, fontWeight: "800", color: "#F8FAFC", marginBottom: 10 },
  desc: { fontSize: 14, color: "#94A3B8", lineHeight: 22, marginBottom: 20 },
  warningBox: {
    backgroundColor: "rgba(245,158,11,0.1)", borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: "rgba(245,158,11,0.3)", marginBottom: 24,
  },
  warningText: { color: "#FCD34D", fontSize: 12, lineHeight: 18 },
  label: { color: "#94A3B8", fontSize: 13, fontWeight: "600", marginBottom: 8 },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 12, padding: 14, color: "#F8FAFC", fontSize: 15, marginBottom: 18,
  },
  textArea: { minHeight: 120, borderRadius: 12 },
  ageError: { color: "#EF4444", fontSize: 12, marginTop: -14, marginBottom: 18 },
  charHint: { color: "#475569", fontSize: 11, marginTop: -14, marginBottom: 24, textAlign: "right" },
  btn: {
    backgroundColor: "#7C3AED", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginBottom: 16,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  note: { color: "#475569", fontSize: 12, textAlign: "center", lineHeight: 18 },
  successIcon: { fontSize: 56, marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: "800", color: "#F8FAFC", marginBottom: 12 },
  successDesc: { fontSize: 14, color: "#94A3B8", textAlign: "center", lineHeight: 22, marginBottom: 32 },
});
