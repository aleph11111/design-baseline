import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// ---------------------------------------------------------------------------
// Donor-dev gallery harness — NOT part of the baseline broadcast.
//
// This config builds the `gallery/` app that renders the archetype demos so the
// baseline can be browsed visually (and later mounted as a "design plugin" in
// the dashboard hub). It is never copied into a target project; `/style-baseline`
// and `/style-archetypes` only copy `src/...`. See STYLE.md, "Donor file scope".
// ---------------------------------------------------------------------------

export default defineConfig({
  root: "gallery",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    // The gallery imports the real primitives (../src) and the MANIFEST
    // (../docs) — both live above the gallery root, so allow the repo root.
    fs: { allow: [".."] },
  },
  optimizeDeps: {
    // Pre-bundle the heavy deps the lazy demos pull, so the dev server doesn't
    // discover them mid-session and force a full reload each time you open a
    // new archetype route. (For just viewing the gallery, prefer the static
    // preview build — `npm run gallery:view` — which avoids dev mode entirely.)
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react-router-dom",
      "next-themes",
      "lucide-react",
      "react-hook-form",
      "@hookform/resolvers/zod",
      "zod",
      "date-fns",
      "cmdk",
      "sonner",
    ],
  },
  build: {
    outDir: "../gallery-dist",
    emptyOutDir: true,
  },
});
