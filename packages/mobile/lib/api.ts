import { hc } from "hono/client";
import type { AppType } from "@template/web";
import { getToken } from "./auth";
import { requireApiBaseUrl } from "./config";

// requireApiBaseUrl() throws at module load with a clear message if the app
// was built without an API URL, instead of issuing requests to "undefined".
const client = hc<AppType>(requireApiBaseUrl(), {
  headers: () => {
    const headers: Record<string, string> = {};
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  },
});

export const api = client.api;
