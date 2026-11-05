import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import path from "node:path";
import { copyFileSync } from "node:fs";

// ---------------------------------------------------------------------------
// Donor-dev gallery harness — NOT part of the baseline broadcast.
//
// This config builds the `gallery/` app that renders the archetype demos so the
// baseline can be browsed visually (and later mounted as a "design plugin" in
// the dashboard hub). It never reaches a consumer: the package `files` list
// carries `src/...` only. See STYLE.md, "Donor file scope".
//
// All `gallery*` scripts pass `--configLoader runner`; see vitest.config.ts for
// why (esbuild parses every ancestor `package.json`, so a corrupt main-checkout
// one breaks runs from inside a worktree). `root: "gallery"` does not help.
// ---------------------------------------------------------------------------

// The Inter woff2 (gallery/fonts/) is licensed under SIL OFL 1.1, which requires
// its copyright notice and license text to ship alongside it. Vite emits the
// woff2 into <outDir>/<assetsDir>/ (hashed) but copies no un-referenced source
// files, so the OFL.txt would be left behind. This build-only copy plugin puts
// it in the exact same dir the woff2 lands in, so both travel together into the
// built gallery (gallery-dist/, which is gitignored).
const buildOutDir = "../gallery-dist";
const buildAssetsDir = "assets";

function copyOflLicense(): Plugin {
  return {
    name: "gallery-copy-inter-ofl",
    apply: "build",
    closeBundle() {
      const from = fileURLToPath(new URL("./gallery/fonts/OFL.txt", import.meta.url));
      // outDir is relative to root ("gallery"); resolve it the same way Vite
      // does so the destination matches where the emitted woff2 lands exactly.
      const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "gallery");
      const to = path.resolve(appRoot, buildOutDir, buildAssetsDir, "OFL.txt");
      copyFileSync(from, to);
    },
  };
}

export default defineConfig({
  root: "gallery",
  // Relative base + hash routing (see gallery/main.tsx) so the built gallery is
  // position-independent: it works served at "/" standalone AND iframed under an
  // arbitrary subpath by the hub (e.g. /api/design/gallery/) with no rewrites.
  base: "./",
  plugins: [react(), tailwindcss(), copyOflLicense()],
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
      "cmdk",
      "sonner",
    ],
  },
  build: {
    outDir: buildOutDir,
    assetsDir: buildAssetsDir,
    emptyOutDir: true,
  },
});
