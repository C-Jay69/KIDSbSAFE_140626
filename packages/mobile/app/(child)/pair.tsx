import {
  View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { api } from "../../lib/api";

export default function PairScreen() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePair() {
    if (code.trim().length !== 6) {
      Alert.alert("Invalid Code", "Pairing code must be 6 characters.");
      return;
    }
    setLoading(true);
    try {
      // Get or create a stable device token
      let deviceToken = await SecureStore.getItemAsync("child_device_token");
      if (!deviceToken) {
        deviceToken = Math.random().toString(36).substring(2, 18) + Date.now().toString(36);
        await SecureStore.setItemAsync("child_device_token", deviceToken);
      }

      const res = await api.children["claim-pair"].$post({
        json: { pairingCode: code.trim().toUpperCase(), deviceToken },
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Pairing failed");
      }

      const data = await res.json() as { child: { name: string }; family: { parentName: string } };
      await AsyncStorage.setItem("child_paired", "true");
      await AsyncStorage.setItem("child_name", data.child.name);
      await AsyncStorage.setItem("parent_name", data.family.parentName);

      router.replace("/(child)/");
    } catch (e: any) {
      Alert.alert("Pairing Failed", e.message ?? "Invalid or expired code. Please check with your parent.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.container}>
          <Pressable style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          <Text style={styles.title}>Enter Pairing Code</Text>
          <Text style={styles.desc}>
            Your parent generated a 6-character code in the KIDSbSAFE parent app.
            Enter it below to link this device.
          </Text>

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              placeholder="e.g. A1B2C3"
              placeholderTextColor="#475569"
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
              keyboardType="default"
              returnKeyType="done"
              onSubmitEditing={handlePair}
            />
            <Text style={styles.charCount}>{code.length}/6</Text>
          </View>

          <Pressable
            style={[styles.btn, (loading || code.length !== 6) && styles.btnDisabled]}
            onPress={handlePair}
            disabled={loading || code.length !== 6}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Connect Device</Text>
            )}
          </Pressable>

          <Text style={styles.note}>
            Ask your parent to open KIDSbSAFE → Children → Generate Pairing Code.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A0B14" },
  container: { flex: 1, padding: 24 },
  back: { marginBottom: 32, alignSelf: "flex-start" },
  backText: { color: "#A78BFA", fontSize: 15 },
  title: { fontSize: 26, fontWeight: "800", color: "#F8FAFC", marginBottom: 12 },
  desc: { fontSize: 14, color: "#94A3B8", lineHeight: 22, marginBottom: 32 },
  inputWrap: { marginBottom: 24 },
  input: {
    backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(167,139,250,0.3)",
    borderRadius: 14, padding: 20, fontSize: 28, fontWeight: "800", color: "#F8FAFC",
    letterSpacing: 8, textAlign: "center",
  },
  charCount: { color: "#475569", fontSize: 12, textAlign: "right", marginTop: 6 },
  btn: {
    backgroundColor: "#7C3AED", borderRadius: 14, paddingVertical: 18, alignItems: "center", marginBottom: 24,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  note: { color: "#475569", fontSize: 12, textAlign: "center", lineHeight: 18 },
});
