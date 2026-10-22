import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: { url: "http://localhost/" },
    },
    setupFiles: ["src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.ts"],
    env: { TZ: "UTC" },
    restoreMocks: true,
    unstubGlobals: true,
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "text", "html"],
      include: ["src/utils/**", "src/i18n/**", "src/hooks/**", "src/components/**", "src/App.tsx"],
      exclude: [
        "src/i18n/locales/**",
        "src/i18n/messages.ts",
        "src/components/index.ts",
        "src/test/**",
        "**/*.test.{ts,tsx}",
        "**/*.css",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
