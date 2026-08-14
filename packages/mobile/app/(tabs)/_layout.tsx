import { Tabs } from "expo-router";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0F1120",
          borderTopColor: "rgba(255,255,255,0.06)",
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 12,
        },
        tabBarActiveTintColor: "#A78BFA",
        tabBarInactiveTintColor: "#475569",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard", tabBarIcon: ({ color }) => <TabIcon emoji="⬛" color={color} /> }} />
      <Tabs.Screen name="alerts" options={{ title: "Alerts", tabBarIcon: ({ color }) => <TabIcon emoji="🔔" color={color} /> }} />
      <Tabs.Screen name="children" options={{ title: "Children", tabBarIcon: ({ color }) => <TabIcon emoji="👨‍👩‍👧" color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color }) => <TabIcon emoji="⚙️" color={color} /> }} />
    </Tabs>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{emoji}</Text>;
}
