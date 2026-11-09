import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "./config";

let watchSubscription: Location.LocationSubscription | null = null;
let isRunning = false;

async function postLocation(lat: number, lng: number, accuracy: number | null) {
  try {
    const deviceToken = await SecureStore.getItemAsync("child_device_token");
    if (!deviceToken) return;
    await fetch(`${API_BASE_URL}/api/geo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceToken, lat, lng, accuracy }),
    });
  } catch {
    // Network errors are non-fatal for a background location reporter.
  }
}

export async function startGpsTracking(): Promise<boolean> {
  if (isRunning) return true;

  const paired = await SecureStore.getItemAsync("child_id");
  if (!paired) return false; // not paired yet

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") return false;

  isRunning = true;

  // Send an immediate fix.
  try {
    const current = await Location.getCurrentPositionAsync({});
    await postLocation(
      current.coords.latitude,
      current.coords.longitude,
      current.coords.accuracy
    );
  } catch {
    // ignore — watcher will catch up
  }

  // Then watch for movement and report updates.
  watchSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 30000, // at most every 30s
      distanceInterval: 50, // or every 50m
    },
    (loc: Location.LocationObject) => {
      postLocation(loc.coords.latitude, loc.coords.longitude, loc.coords.accuracy);
    }
  );

  return true;
}

export function stopGpsTracking() {
  if (watchSubscription) {
    watchSubscription.remove();
    watchSubscription = null;
  }
  isRunning = false;
}
