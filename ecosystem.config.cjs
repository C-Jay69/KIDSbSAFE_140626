module.exports = {
  apps: [
    {
      name: "web-app",
      cwd: "./packages/web",
      // The server lives at packages/web/src/api/server.ts. Pointing at
      // "src/server.ts" (the previous value) made `npm start` fail with
      // MODULE_NOT_FOUND before the process could bind a port.
      script: "src/api/server.ts",
      interpreter: "bun",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      restart_delay: 1000,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 4200,
      },
    },
  ],
};
