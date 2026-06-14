import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export default function ChildHome() {
  const router = useRouter();
  const [paired, setPaired] = useState<boolean | null>(null);
  const [parentName, setParentName] = useState<string | null>(null);
  const [childName, setChildName] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem("child_paired"),
      AsyncStorage.getItem("parent_name"),
      AsyncStorage.getItem("child_name"),
    ]).then(([paired, parentName, childName]) => {
      setPaired(paired === "true");
      setParentName(parentName);
      setChildName(childName);
    });
  }, []);

  if (paired === null) return null;

  if (!paired) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
          <Text style={styles.tagline}>Child Device Setup</Text>
          <Text style={styles.desc}>
            Your parent has set up monitoring on this device.{"\n"}
            Enter the pairing code to connect.
          </Text>
          <Pressable style={styles.btn} onPress={() => router.push("/(child)/pair")}>
            <Text style={styles.btnText}>Enter Pairing Code</Text>
          </Pressable>
          <Pressable style={styles.linkBtn} onPress={() => router.push("/(child)/status")}>
            <Text style={styles.linkText}>What is monitored?</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <View style={styles.shieldWrap}>
          <Text style={styles.shieldIcon}>🛡️</Text>
        </View>
        <Image source={require("../../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        <Text style={styles.pairedTitle}>Device Protected</Text>
        {childName && <Text style={styles.childLabel}>Hi, {childName}</Text>}
        {parentName && (
          <View style={styles.parentBadge}>
            <Text style={styles.parentBadgeText}>Monitored by {parentName}</Text>
          </View>
        )}
        <Text style={styles.pairedDesc}>
          This device is being monitored to keep you safe online.
          Your parent can see activity and will be alerted if anything concerning is detected.
        </Text>
        <Pressable style={styles.browserBtn} onPress={() => router.push("/(child)/browser")}>
          <Text style={styles.browserBtnIcon}>🌐</Text>
          <Text style={styles.browserBtnText}>Open Safe Browser</Text>
        </Pressable>
        <Pressable style={styles.outlineBtn} onPress={() => router.push("/(child)/status")}>
          <Text style={styles.outlineBtnText}>View What's Monitored</Text>
        </Pressable>
        <Pressable style={styles.linkBtn} onPress={() => router.push("/(child)/consent")}>
          <Text style={styles.linkText}>I'm 13+ and want to request changes</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A0B14" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  logo: { width: 180, height: 60, marginBottom: 6 },
  tagline: { fontSize: 16, color: "#94A3B8", marginBottom: 24 },
  desc: { fontSize: 14, color: "#94A3B8", textAlign: "center", lineHeight: 22, marginBottom: 32 },
  btn: {
    backgroundColor: "#7C3AED", borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40,
    width: "100%", alignItems: "center", marginBottom: 12,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  outlineBtn: {
    borderWidth: 1, borderColor: "rgba(167,139,250,0.4)", borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 40, width: "100%", alignItems: "center", marginBottom: 12,
  },
  outlineBtnText: { color: "#A78BFA", fontWeight: "600", fontSize: 15 },
  linkBtn: { marginTop: 8 },
  linkText: { color: "#475569", fontSize: 13, textDecorationLine: "underline" },
  shieldWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(124,58,237,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  shieldIcon: { fontSize: 48 },
  pairedTitle: { fontSize: 22, fontWeight: "700", color: "#F8FAFC", marginBottom: 6 },
  childLabel: { fontSize: 16, color: "#A78BFA", marginBottom: 12 },
  parentBadge: {
    backgroundColor: "rgba(124,58,237,0.2)", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6,
    marginBottom: 20, borderWidth: 1, borderColor: "rgba(167,139,250,0.3)",
  },
  parentBadgeText: { color: "#A78BFA", fontWeight: "600", fontSize: 13 },
  pairedDesc: { fontSize: 13, color: "#64748B", textAlign: "center", lineHeight: 20, marginBottom: 28 },
  browserBtn: {
    backgroundColor: "rgba(236,72,153,0.15)", borderWidth: 1, borderColor: "rgba(236,72,153,0.4)",
    borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40, width: "100%",
    alignItems: "center", marginBottom: 12, flexDirection: "row", justifyContent: "center", gap: 10,
  },
  browserBtnIcon: { fontSize: 20 },
  browserBtnText: { color: "#EC4899", fontWeight: "700", fontSize: 16 },
});
