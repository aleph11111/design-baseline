// Screenshot baselines: every kind:page archetype at the device triad, rendered
// only inside the pinned Playwright image (STYLE.md "The device triad").
// Run: npm run screenshots  (compare)  /  npm run screenshots:update  (regenerate)
import { defineConfig } from "@playwright/test";
import { playwrightProjects } from "./src/testing/devices.mjs";
import { assertInPlaywrightImage } from "./src/testing/docker.mjs";

assertInPlaywrightImage();

export default defineConfig({
  testDir: "tests",
  snapshotPathTemplate: "tests/screenshots/{projectName}/{arg}{ext}",
  projects: playwrightProjects.map(({ name, use }) => ({ name, use: { ...use } })),
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: { baseURL: "http://localhost:4173" },
  expect: {
    // two identical consecutive frames are required; a 2560px page on a loaded box needs longer than 5s
    timeout: 20000,
    // css scale: a laptop14/phone baseline stores CSS pixels, not 2x/3x device pixels
    toHaveScreenshot: { animations: "disabled", caret: "hide", scale: "css" },
  },
  webServer: {
    command: "npx vite preview --configLoader runner --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: false,
  },
});
