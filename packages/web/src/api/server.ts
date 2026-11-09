import { serve } from "bun";
import path from "node:path";
import app from "./index";

const port = Number(process.env.PORT ?? 3000);

// Vite builds the SPA into packages/web/dist (two levels up from src/api)
const distDir = path.resolve(import.meta.dir, "../../dist");
const indexPath = path.join(distDir, "index.html");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json; charset=utf-8",
};

// Only these extensions are treated as static assets. A URL such as
// /reports/v1.0 is a client route and must fall through to index.html.
const ASSET_EXTENSION = /\.(?:html?|m?js|css|json|svg|png|jpe?g|webp|ico|woff2?|ttf|map)$/i;

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
};

function mimeFor(pathname: string): string {
  const ext = path.extname(pathname).toLowerCase();
  return MIME[ext] ?? "application/octet-stream";
}

/**
 * Resolve a request path inside `base`, or return null if it escapes.
 *
 * The old implementation decoded the path and stripped every ".." substring.
 * Besides being a crude traversal filter, malformed percent-encoding threw an
 * uncaught URIError and produced a 500. Resolve, then verify containment.
 */
function safeJoin(base: string, pathname: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const normalized = path.posix.normalize(decoded).replace(/^\/+/, "");
  const full = path.resolve(base, normalized);
  const root = path.resolve(base);

  if (full !== root && !full.startsWith(root + path.sep)) return null;
  return full;
}

function htmlHeaders(cacheControl: string): HeadersInit {
  return {
    ...SECURITY_HEADERS,
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": cacheControl,
  };
}

const server = serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);

    // Collapse duplicate slashes. A client configured with a trailing-slash
    // base URL ("https://host/") produces "//api/geo", which never matches a
    // "/api/" route and silently falls through to the SPA — the request looks
    // like a 200 but never reaches the API.
    const pathname = url.pathname.replace(/\/{2,}/g, "/");

    try {
      // 1) API requests -> real Hono app (DB-backed, auth, etc.)
      if (pathname === "/api" || pathname.startsWith("/api/")) {
        if (pathname === url.pathname) return await app.fetch(request);
        const rewritten = new URL(request.url);
        rewritten.pathname = pathname;
        return await app.fetch(new Request(rewritten, request));
      }

      // 2) Static assets (known file extensions) -> serve from dist
      if (ASSET_EXTENSION.test(pathname)) {
        const filePath = safeJoin(distDir, pathname);
        if (!filePath) return new Response("Bad request", { status: 400 });

        const file = Bun.file(filePath);
        if (await file.exists()) {
          const isHashedAsset = url.pathname.startsWith("/assets/");
          return new Response(file, {
            headers: {
              ...SECURITY_HEADERS,
              "Content-Type": mimeFor(url.pathname),
              "Cache-Control": isHashedAsset
                ? "public, max-age=31536000, immutable"
                : "public, max-age=3600",
            },
          });
        }
        return new Response("Not found", { status: 404 });
      }

      // 3) SPA fallback -> index.html (handles /pricing, /dashboard, etc. on refresh)
      const index = Bun.file(indexPath);
      if (await index.exists()) {
        return new Response(index, { headers: htmlHeaders("no-cache") });
      }

      return new Response("Build output not found. Run `bun run build` first.", {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } catch (err) {
      console.error("[server] unhandled request error:", err);
      return new Response("Internal Server Error", {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8", ...SECURITY_HEADERS },
      });
    }
  },
});

console.log(`KIDSbSAFE web server listening on http://localhost:${server.port}`);
