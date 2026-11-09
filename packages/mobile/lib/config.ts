import Constants from "expo-constants";

/**
 * Single source of truth for the API base URL.
 *
 * app.json ships `extra.apiUrl` with a trailing slash. Interpolating that
 * directly into `${base}/api/...` yields a double slash ("//api/..."), whose
 * URL pathname never matches the server's "/api/" routes — every GPS and
 * browsing request silently hit the SPA fallback instead of the API.
 */
const configured =
  Constants.expoConfig?.extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  "";

export const API_BASE_URL = String(configured).replace(/\/+$/, "");

export function requireApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error(
      "API URL is not configured. Set expo.extra.apiUrl in app.json or EXPO_PUBLIC_API_URL."
    );
  }
  return API_BASE_URL;
}
