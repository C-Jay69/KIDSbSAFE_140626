import { serve } from "bun";
import app from "./index";

const port = Number(process.env.PORT ?? 3000);

// Vite builds the SPA into packages/web/dist (two levels up from src/api)
const distDir = `${import.meta.dir}/../../dist`;
const indexPath = `${distDir}/index.html`;

// Map common extensions to content types for static assets.
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
};

function mimeFor(pathname: string): string {
  const ext = pathname.slice(pathname.lastIndexOf("."));
  return MIME[ext] ?? "application/octet-stream";
}

function safeJoin(base: string, pathname: string): string {
  const clean = decodeURIComponent(pathname)
    .replace(/^\/+/, "")
    .split("..").join("");
  return clean ? `${base}/${clean}` : `${base}/index.html`;
}

const server = serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);

    // 1) API requests -> real Hono app (DB-backed, auth, etc.)
    if (url.pathname.startsWith("/api")) {
      return app.fetch(request);
    }

    // 2) Static assets (has a file extension) -> serve from dist
    if (url.pathname.includes(".")) {
      const filePath = safeJoin(distDir, url.pathname);
      const file = Bun.file(filePath);
      if (await file.exists()) {
        return new Response(file, { headers: { "Content-Type": mimeFor(url.pathname) } });
      }
      return new Response("Not found", { status: 404 });
    }

    // 3) SPA fallback -> index.html (handles /pricing, /dashboard, etc. on refresh)
    const index = Bun.file(indexPath);
    if (await index.exists()) {
      return new Response(index, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    return new Response("Build output not found. Run `bun run build` first.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
});

console.log(`KIDSbSAFE web server listening on http://localhost:${server.port}`);
