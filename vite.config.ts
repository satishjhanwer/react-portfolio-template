import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { yearsExperience } from "./src/utils/experience.ts";
import { renderOgImageCached } from "./scripts/og-image.ts";
import { buildInfo } from "./scripts/build-info.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const fillYears = (content: string) => content.replaceAll("{{YEARS_EXPERIENCE}}", yearsExperience);

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
            const content = updateSWVersion(resolve(__dirname, "public/sw.js"), "dev");
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
    {
      name: "years-experience",
      transformIndexHtml: fillYears,
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/manifest.json") {
            const manifest = readFileSync(resolve(__dirname, "public/manifest.json"), "utf-8");
            res.setHeader("Content-Type", "application/manifest+json");
            res.end(fillYears(manifest));
            return;
          }
          next();
        });
      },
      closeBundle() {
        const manifestPath = resolve(__dirname, "dist/manifest.json");
        if (existsSync(manifestPath)) {
          writeFileSync(manifestPath, fillYears(readFileSync(manifestPath, "utf-8")));
        }
      },
    },
    {
      name: "og-image",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url !== "/og-image.png") {
            return next();
          }
          renderOgImageCached(__dirname)
            .then((png) => {
              res.setHeader("Content-Type", "image/png");
              res.end(png);
            })
            .catch(next);
        });
      },
      async generateBundle() {
        this.emitFile({
          type: "asset",
          fileName: "og-image.png",
          source: await renderOgImageCached(__dirname),
        });
      },
    },
    {
      name: "build-info",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url !== "/build-info.json") {
            return next();
          }
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(buildInfo(__dirname, null)));
        });
      },
      generateBundle(_, bundle) {
        const chunks = Object.values(bundle).flatMap((item) =>
          item.type === "chunk"
            ? [{ fileName: item.fileName, code: item.code, isEntry: item.isEntry, imports: item.imports }]
            : [],
        );
        this.emitFile({
          type: "asset",
          fileName: "build-info.json",
          source: JSON.stringify(buildInfo(__dirname, chunks), null, 2),
        });
      },
    },
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "react-vendor";
          }
          if (id.includes("node_modules/framer-motion")) {
            return "motion";
          }
        },
      },
    },
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 700,
  },
});
