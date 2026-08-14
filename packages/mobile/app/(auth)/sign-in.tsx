import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import { authClient, captureToken } from "../../lib/auth";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await authClient.signIn.email(
        { email, password },
        { onSuccess: captureToken }
      );
      if (result.error) setError(result.error.message ?? "Invalid credentials");
      else router.replace("/");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.subtitle}>Parent Sign In</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
              placeholderTextColor="#475569"
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#475569"
            />
            {!!error && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity style={styles.btn} onPress={handleSignIn} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign In</Text>}
            </TouchableOpacity>
            <Link href="/sign-up" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Don't have an account? Sign up free</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Child device separator */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.childBtn}
            onPress={() => router.replace("/(child)/")}
          >
            <Text style={styles.childBtnEmoji}>🧒</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.childBtnTitle}>This is my child's device</Text>
              <Text style={styles.childBtnSub}>Enter pairing code from parent app</Text>
            </View>
            <Text style={styles.childBtnArrow}>→</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A0B14" },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  logo: { width: 180, height: 60, alignSelf: "center", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#94A3B8", textAlign: "center", marginBottom: 32 },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  label: { color: "#94A3B8", fontSize: 13, marginBottom: 8, marginTop: 4 },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: 14,
    color: "#F8FAFC",
    fontSize: 14,
    marginBottom: 16,
  },
  btn: {
    backgroundColor: "#7C3AED",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  error: { color: "#FCA5A5", fontSize: 13, marginBottom: 12 },
  link: { color: "#A78BFA", fontSize: 13, textAlign: "center" },
  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 24, gap: 12 },
  divider: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  dividerText: { color: "#475569", fontSize: 13 },
  childBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(236,72,153,0.08)",
    borderWidth: 1,
    borderColor: "rgba(236,72,153,0.25)",
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
  childBtnEmoji: { fontSize: 28 },
  childBtnTitle: { color: "#F8FAFC", fontWeight: "700", fontSize: 15, marginBottom: 2 },
  childBtnSub: { color: "#94A3B8", fontSize: 12 },
  childBtnArrow: { color: "#EC4899", fontSize: 18, fontWeight: "700" },
});
