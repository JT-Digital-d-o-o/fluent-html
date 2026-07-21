// Acceptance-matrix harness (ADR-12): runs against the production-built,
// minified runtime asset under real strict CSP, htmx pinned in package.json.
// Chromium per-PR; set ACCEPT_ENGINES=all for the WebKit+Firefox state rows
// (the per-PR-vs-nightly CI budget decision is still open in the pm todo).
import { defineConfig } from "@playwright/test";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const engines =
  process.env.ACCEPT_ENGINES === "all"
    ? ["chromium", "webkit", "firefox"]
    : ["chromium"];

export default defineConfig({
  testDir: here,
  testMatch: /.*\.spec\.mjs/,
  timeout: 20_000,
  // Serial: clipboard rows read the OS-level clipboard, which is shared across
  // parallel workers in the same browser process.
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4783",
  },
  projects: engines.map((name) => ({
    name,
    use: {
      browserName: name,
      // Clipboard rows read navigator.clipboard — permission grants are Chromium-only.
      ...(name === "chromium" ? { permissions: ["clipboard-read", "clipboard-write"] } : {}),
    },
  })),
  webServer: {
    command: "node app.mjs",
    cwd: here,
    url: "http://127.0.0.1:4783/fx/toggle/0",
    reuseExistingServer: !process.env.CI, // a stale local server is convenient; CI must test the fresh asset
    timeout: 30_000,
  },
});
