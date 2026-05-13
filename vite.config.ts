import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const updateSWVersion = (filePath: string, version: string) => {
  if (existsSync(filePath)) {
    const content = readFileSync(filePath, "utf-8");
    return content.replace("{{BUILD_VERSION}}", version);
  }
  return null;
};

export default defineConfig({
  plugins: [
    react(),
    {
      name: "update-sw-version",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/sw.js") {
            const content = updateSWVersion(
              resolve(__dirname, "public/sw.js"),
              "dev",
            );
            if (content) {
              res.setHeader("Content-Type", "application/javascript");
              res.end(content);
              return;
            }
          }
          next();
        });
      },
      closeBundle() {
        const swPath = resolve(__dirname, "dist/sw.js");
        const version = `v${Date.now()}`;
        const content = updateSWVersion(swPath, version);
        if (content) {
          writeFileSync(swPath, content);
          console.log(`\n✓ Service Worker version updated to ${version}\n`);
        }
      },
    },
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom")
          ) {
            return "react-vendor";
          }
          if (id.includes("node_modules/framer-motion")) {
            return "motion";
          }
        },
      },
    },
    // Inline small assets to reduce requests
    assetsInlineLimit: 4096,
  },
});
