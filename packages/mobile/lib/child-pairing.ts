import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { requireApiBaseUrl } from "./config";

/**
 * Local child-device pairing state.
 *
 * `app/(child)/pair.tsx` writes these keys when it claims a pairing code. The
 * AsyncStorage entries are a *display cache* only: the authoritative link is
 * `children.device_token` on the server. A cached flag can outlive the real
 * link (re-seeded database, deleted child, different account), which is why
 * `verifyPairedDevice()` re-checks it on launch instead of trusting it.
 */
export const PAIRING_KEYS = {
  paired: "child_paired",
  childName: "child_name",
  parentName: "parent_name",
  childId: "child_id",
  deviceToken: "child_device_token",
} as const;

export type PairedDevice = {
  childId: string;
  childName: string;
  parentName: string;
};

/**
 * `unreachable` is deliberately distinct from `unpaired`: a device that is
 * simply offline must not be told its pairing is gone.
 */
export type VerifyResult =
  | { status: "paired"; device: PairedDevice }
  | { status: "unpaired" }
  | { status: "unreachable" };

/** expo-secure-store has no web implementation, so every call is guarded. */
async function secureGet(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function secureSet(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // Unsupported runtime; the server remains the source of truth.
  }
}

async function secureDelete(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Nothing to delete when SecureStore is unavailable.
  }
}

/** Re-validate the stored device token against the API. */
export async function verifyPairedDevice(): Promise<VerifyResult> {
  const deviceToken = await secureGet(PAIRING_KEYS.deviceToken);
  if (!deviceToken) return { status: "unpaired" };

  let res: Response;
  try {
    res = await fetch(`${requireApiBaseUrl()}/api/children/device`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceToken }),
    });
  } catch {
    // Offline: do not destroy a pairing we cannot disprove.
    return { status: "unreachable" };
  }

  if (res.ok) {
    const body = (await res.json().catch(() => null)) as {
      child?: { id?: string; name?: string };
      family?: { parentName?: string };
    } | null;

    if (body?.child?.id && body.child.name) {
      const device: PairedDevice = {
        childId: body.child.id,
        childName: body.child.name,
        parentName: body.family?.parentName ?? "Your Parent",
      };
      // Keep the cache in step with the server so the two cannot drift.
      await AsyncStorage.multiSet([
        [PAIRING_KEYS.paired, "true"],
        [PAIRING_KEYS.childName, device.childName],
        [PAIRING_KEYS.parentName, device.parentName],
      ]);
      await secureSet(PAIRING_KEYS.childId, device.childId);
      return { status: "paired", device };
    }
    return { status: "unreachable" };
  }

  // The server has no child for this token: the local pairing is stale.
  if (res.status === 404 || res.status === 401 || res.status === 410) {
    return { status: "unpaired" };
  }
  // 429 / 5xx: the server is busy or broken, not telling us we are unpaired.
  return { status: "unreachable" };
}

/** Remove every local trace of the pairing. */
export async function clearPairedDevice(): Promise<void> {
  await AsyncStorage.multiRemove([
    PAIRING_KEYS.paired,
    PAIRING_KEYS.childName,
    PAIRING_KEYS.parentName,
  ]);
  await Promise.all([
    secureDelete(PAIRING_KEYS.childId),
    secureDelete(PAIRING_KEYS.deviceToken),
  ]);
}
