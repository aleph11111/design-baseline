import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// ---------------------------------------------------------------------------
// Unit test config for `src/` primitives. Separate from `vite.config.ts`,
// which is scoped to the donor-dev gallery build (root: "gallery") — see
// STYLE.md, "Donor file scope". This config is repo-root scoped so tests can
// live alongside the primitives they cover under `src/`.
// ---------------------------------------------------------------------------

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    // jsdom environment setup alone costs 26–36s per run, so vitest's 5s
    // default leaves interaction-heavy tests (ThemeToggle, SettingsTableShell)
    // timing out under load even though they pass in isolation.
    testTimeout: 30_000,
  },
});
