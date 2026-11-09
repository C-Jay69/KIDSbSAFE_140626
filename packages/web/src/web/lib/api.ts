import { hc } from "hono/client";
import type { AppType } from "../../api";
import { getToken } from "./auth";

const client = hc<AppType>("/", {
  headers: () => {
    const headers: Record<string, string> = {};
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  },
});

export const api = client.api;
