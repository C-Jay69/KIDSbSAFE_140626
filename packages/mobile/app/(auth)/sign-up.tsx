import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import { authClient, captureToken } from "../../lib/auth";

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await authClient.signUp.email(
        { name, email, password },
        { onSuccess: captureToken }
      );
      if (result.error) setError(result.error.message ?? "Registration failed");
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
          <Text style={styles.brand}>KIDSbSAFE</Text>
          <Text style={styles.subtitle}>Create Parent Account</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Jane Smith" placeholderTextColor="#475569" />
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" placeholderTextColor="#475569" />
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Min. 8 characters" placeholderTextColor="#475569" />
            {!!error && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity style={styles.btn} onPress={handleSignUp} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
            </TouchableOpacity>
            <Link href="/sign-in" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Already have an account? Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A0B14" },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  brand: { fontSize: 32, fontWeight: "800", color: "#A78BFA", textAlign: "center", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#94A3B8", textAlign: "center", marginBottom: 32 },
  card: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 20, padding: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  label: { color: "#94A3B8", fontSize: 13, marginBottom: 8, marginTop: 4 },
  input: { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 14, color: "#F8FAFC", fontSize: 14, marginBottom: 16 },
  btn: { backgroundColor: "#7C3AED", borderRadius: 14, padding: 16, alignItems: "center", marginTop: 8, marginBottom: 16 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  error: { color: "#FCA5A5", fontSize: 13, marginBottom: 12 },
  link: { color: "#A78BFA", fontSize: 13, textAlign: "center" },
});
