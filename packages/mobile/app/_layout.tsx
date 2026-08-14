import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AutumnProvider } from "autumn-js/react";
import { authClient } from "../lib/auth";

const queryClient = new QueryClient();

function AuthGuard() {
  const { data: session, isPending } = authClient.useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;
    const inAuthGroup = segments[0] === "(auth)";
    const inChildGroup = segments[0] === "(child)";
    if (!session && !inAuthGroup && !inChildGroup) router.replace("/sign-in");
    if (session && inAuthGroup) router.replace("/");
  }, [session, isPending, segments]);

  const inChildGroup = segments[0] === "(child)";

  // Don't wrap child screens in AutumnProvider — no session there
  if (inChildGroup) {
    return <Slot />;
  }

  return (
    <AutumnProvider useBetterAuth>
      <Slot />
    </AutumnProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthGuard />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
