import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import { readFileSync } from "node:fs";

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
// woff2 via its asset pipeline but copies no un-referenced source files, so an
// OFL.txt beside the .woff2 in source would be left behind. Emit it through
// Rollup's asset pipeline (not a post-hoc disk copy) so it lands in the exact
// assets dir the woff2 lands in — following any --outDir/--assetsDir override
// (e.g. check:detail-sheet builds to ../gallery-dist-dev) and never touching a
// directory that may not exist yet — so both travel together into the built
// gallery (gallery-dist/, which is gitignored).
const buildOutDir = "../gallery-dist";
const buildAssetsDir = "assets";

function copyOflLicense(): Plugin {
  const from = fileURLToPath(new URL("./gallery/fonts/OFL.txt", import.meta.url));
  let assetsDir = buildAssetsDir;
  return {
    name: "gallery-copy-inter-ofl",
    apply: "build",
    // Read the *resolved* config: build.outDir/--outDir may be overridden on
    // the CLI (check:detail-sheet), so the config default is not authoritative.
    configResolved(config) {
      assetsDir = config.build.assetsDir;
    },
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: `${assetsDir}/OFL.txt`,
        source: readFileSync(from),
      });
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
