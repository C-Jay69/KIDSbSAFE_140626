import { Stack } from "expo-router";

export default function ChildLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0A0B14" },
        animation: "slide_from_right",
      }}
    />
  );
}
