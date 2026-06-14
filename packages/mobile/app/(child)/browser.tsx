import { useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, Pressable, TextInput,
  ActivityIndicator, Platform, KeyboardAvoidingView, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewNavigation } from "react-native-webview";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_BASE =
  Constants.expoConfig?.extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  "https://kidsbsa-njincq3-preview-4200.runable.site";

// URLs that are always safe to skip scanning (performance)
const SKIP_DOMAINS = [
  "google.com", "googleapis.com", "gstatic.com",
  "apple.com", "icloud.com",
  "cloudflare.com", "fastly.net",
];

function shouldSkip(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return SKIP_DOMAINS.some(d => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

function normaliseUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // If it looks like a domain, add https
  if (/^[\w-]+\.[a-z]{2,}/i.test(trimmed)) return `https://${trimmed}`;
  // Otherwise treat as a search query
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
}

const BLOCK_HTML = `
<html>
<head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
body{background:#0A0B14;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:sans-serif;}
.box{text-align:center;padding:32px;max-width:340px;}
.shield{font-size:80px;margin-bottom:16px;}
h1{color:#EF4444;font-size:22px;margin-bottom:8px;}
p{color:#94A3B8;font-size:14px;line-height:22px;}
</style></head>
<body><div class="box">
<div class="shield">🛡️</div>
<h1>Site Blocked</h1>
<p>This website has been blocked by KIDSbSAFE because it contains content that is not suitable. Your parent has been notified.</p>
</div></body></html>
`;

export default function SafeBrowser() {
  const router = useRouter();
  const webviewRef = useRef<WebView>(null);
  const [url, setUrl] = useState("https://www.google.com");
  const [inputUrl, setInputUrl] = useState("google.com");
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState("");
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const scanningRef = useRef<Set<string>>(new Set());

  const scanUrl = useCallback(async (navUrl: string, title?: string) => {
    if (shouldSkip(navUrl)) return true;
    if (scanningRef.current.has(navUrl)) return true;
    scanningRef.current.add(navUrl);

    try {
      const childId = await AsyncStorage.getItem("child_id");
      if (!childId) return true; // no childId = not paired, allow

      const res = await fetch(`${API_BASE}/api/browse/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, url: navUrl, title }),
      });
      const data = await res.json() as { safe: boolean; block: boolean; reason?: string };

      if (data.block) {
        setBlocked(true);
        setBlockedReason(data.reason ?? "Content not allowed");
        return false;
      }
    } catch {
      // network error — fail open (don't block)
    } finally {
      scanningRef.current.delete(navUrl);
    }
    return true;
  }, []);

  const handleNavigationStateChange = useCallback((nav: WebViewNavigation) => {
    setCanGoBack(nav.canGoBack);
    setCanGoForward(nav.canGoForward);
    if (nav.url && !nav.loading) {
      setInputUrl(nav.url.replace(/^https?:\/\/(www\.)?/, ""));
      // Scan asynchronously — WebView already loaded but we log/alert
      scanUrl(nav.url, nav.title ?? undefined);
    }
  }, [scanUrl]);

  const handleShouldStartLoadWithRequest = useCallback(
    (request: { url: string }) => {
      // We allow load to start — scanning happens async to avoid blocking UX
      // For known-bad domains we do a quick sync domain check
      const url = request.url.toLowerCase();
      const BAD_DOMAINS_QUICK = [
        "pornhub", "xvideos", "xhamster", "brazzers", "chaturbate",
        "bet365", "pokerstars", "888casino",
      ];
      const isBad = BAD_DOMAINS_QUICK.some(d => url.includes(d));
      if (isBad) {
        setBlocked(true);
        setBlockedReason("This domain is blocked by KIDSbSAFE");
        return false;
      }
      setBlocked(false);
      return true;
    },
    []
  );

  const navigate = useCallback((rawInput: string) => {
    const full = normaliseUrl(rawInput);
    setBlocked(false);
    setUrl(full);
    setInputUrl(rawInput);
  }, []);

  const handleGoPress = useCallback(() => navigate(inputUrl), [inputUrl, navigate]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header bar */}
      <View style={styles.header}>
        <Pressable style={styles.headerBack} onPress={() => router.back()}>
          <Text style={styles.headerBackText}>✕</Text>
        </Pressable>

        <View style={styles.urlBar}>
          <Text style={styles.lockIcon}>🔒</Text>
          <TextInput
            style={styles.urlInput}
            value={inputUrl}
            onChangeText={setInputUrl}
            onSubmitEditing={handleGoPress}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            placeholder="Search or enter address"
            placeholderTextColor="#475569"
            selectTextOnFocus
          />
          <Pressable onPress={handleGoPress} style={styles.goBtn}>
            <Text style={styles.goBtnText}>Go</Text>
          </Pressable>
        </View>
      </View>

      {/* KIDSbSAFE badge */}
      <View style={styles.safeBadge}>
        <Text style={styles.safeBadgeText}>🛡️ KIDSbSAFE Browser — activity is monitored</Text>
      </View>

      {/* Blocked screen */}
      {blocked ? (
        <View style={styles.blockedScreen}>
          <Text style={styles.blockedShield}>🛡️</Text>
          <Text style={styles.blockedTitle}>Site Blocked</Text>
          <Text style={styles.blockedDesc}>
            This website has been blocked because it contains content that isn't suitable.
            {"\n\n"}Your parent has been notified.
          </Text>
          {blockedReason ? <Text style={styles.blockedReason}>{blockedReason}</Text> : null}
          <Pressable style={styles.blockedBackBtn} onPress={() => {
            setBlocked(false);
            setUrl("https://www.google.com");
            setInputUrl("google.com");
          }}>
            <Text style={styles.blockedBackText}>Go to Google</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {loading && (
            <View style={styles.loadingBar}>
              <ActivityIndicator size="small" color="#7C3AED" />
            </View>
          )}
          <WebView
            ref={webviewRef}
            source={{ uri: url }}
            style={styles.webview}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onNavigationStateChange={handleNavigationStateChange}
            onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
          />

          {/* Nav controls */}
          <View style={styles.navBar}>
            <Pressable
              onPress={() => webviewRef.current?.goBack()}
              disabled={!canGoBack}
              style={[styles.navBtn, !canGoBack && styles.navBtnDisabled]}
            >
              <Text style={[styles.navBtnText, !canGoBack && { color: "#2D3748" }]}>←</Text>
            </Pressable>
            <Pressable
              onPress={() => webviewRef.current?.goForward()}
              disabled={!canGoForward}
              style={[styles.navBtn, !canGoForward && styles.navBtnDisabled]}
            >
              <Text style={[styles.navBtnText, !canGoForward && { color: "#2D3748" }]}>→</Text>
            </Pressable>
            <Pressable onPress={() => webviewRef.current?.reload()} style={styles.navBtn}>
              <Text style={styles.navBtnText}>↻</Text>
            </Pressable>
            <Pressable
              onPress={() => { setUrl("https://www.google.com"); setInputUrl("google.com"); }}
              style={styles.navBtn}
            >
              <Text style={styles.navBtnText}>⌂</Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0A0B14" },
  header: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 12,
    paddingVertical: 8, gap: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerBack: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center",
  },
  headerBackText: { color: "#94A3B8", fontSize: 16, fontWeight: "700" },
  urlBar: {
    flex: 1, flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 12,
    paddingHorizontal: 10, height: 40, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  lockIcon: { fontSize: 12, marginRight: 6 },
  urlInput: { flex: 1, color: "#F8FAFC", fontSize: 13, padding: 0 },
  goBtn: {
    backgroundColor: "#7C3AED", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4, marginLeft: 6,
  },
  goBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  safeBadge: {
    backgroundColor: "rgba(124,58,237,0.15)", borderBottomWidth: 1,
    borderBottomColor: "rgba(124,58,237,0.2)", paddingVertical: 5, alignItems: "center",
  },
  safeBadgeText: { color: "#A78BFA", fontSize: 11, fontWeight: "600" },
  webview: { flex: 1 },
  loadingBar: {
    position: "absolute", top: 98, left: 0, right: 0,
    zIndex: 10, alignItems: "center", paddingVertical: 4,
  },
  navBar: {
    flexDirection: "row", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)",
    backgroundColor: "#0A0B14", paddingBottom: 4,
  },
  navBtn: { flex: 1, alignItems: "center", paddingVertical: 10 },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: { color: "#A78BFA", fontSize: 20, fontWeight: "600" },
  blockedScreen: {
    flex: 1, alignItems: "center", justifyContent: "center", padding: 32,
  },
  blockedShield: { fontSize: 80, marginBottom: 16 },
  blockedTitle: { fontSize: 24, fontWeight: "800", color: "#EF4444", marginBottom: 12 },
  blockedDesc: { fontSize: 14, color: "#94A3B8", textAlign: "center", lineHeight: 22, marginBottom: 16 },
  blockedReason: {
    fontSize: 12, color: "#EF4444", textAlign: "center",
    backgroundColor: "rgba(239,68,68,0.1)", borderRadius: 8, padding: 10, marginBottom: 24,
  },
  blockedBackBtn: {
    backgroundColor: "#7C3AED", borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 40,
  },
  blockedBackText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
