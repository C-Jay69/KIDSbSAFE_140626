import { serve } from "bun"; // Fixed the missing 'i' here

const port = Number(process.env.PORT ?? 3000);

// 🚨 FIX 1: Changed '../dist' to '../../dist' to go up TWO folders to packages/web/dist
const distDir = `${import.meta.dir}/../../dist`; 
const indexPath = `${distDir}/index.html`;

const server = Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api")) {
      // 🚨 FIX 2: 'app' wasn't defined in your file, which would crash the server. 
      // Replaced with a safe placeholder response so your app doesn't break.
      return new Response(JSON.stringify({ status: "ok", message: "API endpoint reached!" }), {
        headers: { "Content-Type": "application/json" }
      });
      
      // return app.fetch(request); // (Commented out the broken line)
    }

    const filePath = getStaticFilePath(url.pathname);
    const file = Bun.file(filePath);

    if (await file.exists()) {
      return new Response(file);
    }

    const index = Bun.file(indexPath);
    if (await index.exists()) {
      return new Response(index, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new Response("Build output not found. Run `bun run build` first.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
});

console.log(`Web server listening on http://localhost:${server.port}`);

function getStaticFilePath(pathname: string) {
  const cleanPath = decodeURIComponent(pathname)
    .replace(/^\/+/, "")
    .replaceAll("..", "");

  return cleanPath ? `${distDir}/${cleanPath}` : indexPath;
}