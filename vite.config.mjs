import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";
import os from "node:os";

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: "dist",  // Change from "build" to "dist"
    chunkSizeWarningLimit: 2000,
  },
  plugins: [
    tsconfigPaths(),
    react(),
    tagger(),
    // Accept client-side debug logs and print to terminal during dev
    {
      name: "client-log-proxy",
      configureServer(server) {
        server.middlewares.use("/__client-log", (req, res, next) => {
          if (req.method !== "POST") return next();
          let body = "";
          req.on("data", (chunk) => (body += chunk));
          req.on("end", () => {
            try {
              const data = JSON.parse(body || "{}");
              const msg = data?.message || "client-log";
              const meta = data?.meta ? ` ${JSON.stringify(data.meta)}` : "";
              server.config.logger.info(`[client] ${msg}${meta}`);
            } catch {
              server.config.logger.info(`[client] ${body}`);
            }
            res.statusCode = 204;
            res.end();
          });
        });
      },
    },
    // Logs Local, Network (LAN) and Internet URLs on dev startup
    {
      name: "access-urls-logger",
      configureServer(server) {
        server.httpServer?.once("listening", async () => {
          try {
            const addr = server.httpServer?.address();
            const port = typeof addr === "object" && addr ? addr.port : (server.config.server.port || 5173);
            const protocol = server.config.server.https ? "https" : "http";

            // Collect LAN IPv4 addresses
            const ifaces = os.networkInterfaces?.() || {};
            const lanIPs = Object.values(ifaces)
              .flat()
              .filter(Boolean)
              .filter((a) => a.family === 'IPv4' && !a.internal)
              .map((a) => a.address);

            const primaryLan = lanIPs[0];

            // fetch WAN IP with a short timeout
            let wan = null;
            try {
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 2500);
              const res = await fetch("https://api.ipify.org?format=json", { signal: controller.signal });
              clearTimeout(timeout);
              if (res.ok) {
                const data = await res.json().catch(() => ({}));
                wan = data?.ip || null;
              }
            } catch {}

            const cyan = "\x1b[36m";
            const reset = "\x1b[0m";

            // Always print the four lines requested
            const lines = [];
            lines.push(`  \u279C  Local:   ${cyan}${protocol}://localhost:${port}/${reset}`);
            if (primaryLan) {
              lines.push(`  \u279C  Network: ${cyan}${protocol}://${primaryLan}:${port}/${reset}`);
            }
            // Print additional LAN IPs (if any) as extra Network lines
            lanIPs.slice(1).forEach((ip) => {
              lines.push(`  \u279C  Network: ${cyan}${protocol}://${ip}:${port}/${reset}`);
            });
            if (wan) {
              lines.push(`  \u279C  internet: ${cyan}${protocol}://${wan}:${port}/${reset}`);
            }

            if (lines.length) {
              server.config.logger.info("\n" + lines.join("\n") + "\n");
            }
          } catch {
            // ignore WAN IP lookup errors; just don't print
          }
        });
      },
    },
  ],
  server: {
    port: "4028",
    host: "0.0.0.0",
    strictPort: true,
    allowedHosts: ['.amazonaws.com', '.builtwithrocket.new']
  }
});
