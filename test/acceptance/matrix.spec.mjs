// Acceptance row 1 — MECHANICAL CORE: every registry verb (10 built-ins + the
// jt:listboxNav framework pack) × every mandatory fixture × its declared
// trigger × {initial load, plain outerHTML swap, outerMorph}, under real strict
// CSP, against the production-built minified asset. Hard gates per test: the
// verb's postcondition, zero console errors, zero securitypolicyviolation.
import { test, expect } from "@playwright/test";
import { armGuards, reloadArena } from "./helpers.mjs";
import { registerAcceptanceExtensions, allBehaviors } from "./registry.mjs";

registerAcceptanceExtensions();
const ROWS = allBehaviors();
const STAGES = ["initial", "swap", "morph"];

// Per-verb postcondition exercises. Each runs against a fresh arena.
const EXERCISES = {
  async toggle(page, _fixture, i) {
    await page.click("#carrier");
    await expect(page.locator("#fx-panel")).toHaveClass(/hidden/);
    if (i === 1) {
      await expect(page.locator("#fx-second")).toHaveClass(/hidden/);
      await page.click("#carrier");
      await expect(page.locator("#fx-panel")).not.toHaveClass(/hidden/);
      await expect(page.locator("#fx-panel")).toHaveCSS("display", "flex");
    } else {
      await page.click("#carrier");
      await expect(page.locator("#fx-panel")).not.toHaveClass(/hidden/);
    }
  },
  async toggleClass(page) {
    await page.click("#carrier");
    await expect(page.locator("#fx-panel")).toHaveClass(/is-active/);
    await page.click("#carrier");
    await expect(page.locator("#fx-panel")).not.toHaveClass(/is-active/);
  },
  async remove(page, _fixture, i) {
    await page.click("#carrier");
    await expect(page.locator(i === 1 ? "#alert-wrap" : "#fx-banner")).not.toBeAttached();
  },
  async clipboard(page, fixture, i, browserName) {
    await page.click("#carrier");
    if (i === 0) {
      await expect(page.locator("#carrier")).toHaveText("Copied!");
      // transient restore after durationMs (300) — never sticks
      await expect(page.locator("#carrier")).toHaveText("Trigger");
    } else {
      await expect(page.locator("#carrier")).toHaveClass(/copied/);
      await expect(page.locator("#carrier")).not.toHaveClass(/copied/);
    }
    if (browserName === "chromium") {
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(copied).toBe(fixture.value ?? new URL(page.url()).origin + fixture.path);
    }
  },
  async drawer(page) {
    await page.click("#carrier");
    await expect(page.locator("#fx-drawer")).toHaveClass(/is-open/);
    await expect(page.locator("#fx-drawer-backdrop")).toHaveClass(/is-open/);
    await expect(page.locator("body")).toHaveClass(/overflow-hidden/);
    await expect(page.locator("#carrier")).toHaveAttribute("aria-expanded", "true");
    // focusFirst → first focusable inside the drawer
    await expect(page.locator("#drawer-nav")).toBeFocused();
    await page.click("#carrier");
    await expect(page.locator("#fx-drawer")).not.toHaveClass(/is-open/);
    await expect(page.locator("body")).not.toHaveClass(/overflow-hidden/);
    await expect(page.locator("#carrier")).toHaveAttribute("aria-expanded", "false");
  },
  async onEscape(page) {
    await page.click("#inner-input");
    await page.keyboard.press("Escape");
    // action:click → #fx-cancel → its toggle hides the panel
    await expect(page.locator("#fx-panel")).toHaveClass(/hidden/);
  },
  async onClickOutside(page) {
    await page.click("#inside-input");
    await expect(page.locator("#carrier")).not.toHaveClass(/hidden/); // inside never dismisses
    await page.click("#fx-banner");
    await expect(page.locator("#carrier")).toHaveClass(/hidden/);
  },
  async resetOnSuccess(page) {
    await page.fill("#form-input", "typed-value");
    await page.click("#submit-btn");
    await expect(page.locator("#elsewhere")).toHaveText("submitted");
    await expect(page.locator("#form-input")).toHaveValue("");
  },
  async back(page) {
    // history seeded by the stage runner (goto /fx/toggle/0 first)
    await page.click("#carrier");
    await expect(page).toHaveURL(/\/fx\/toggle\/0$/);
  },
  async focus(page) {
    await page.click("#carrier");
    await expect(page.locator("#fx-search")).toBeFocused();
  },
  async "jt:listboxNav"(page) {
    await page.click("#carrier");
    await page.keyboard.press("ArrowDown");
    await expect(page.locator("#fx-listbox [role=option]").first()).toHaveClass(/active/);
    await page.keyboard.press("ArrowDown");
    await expect(page.locator("#fx-listbox [role=option]").nth(1)).toHaveClass(/active/);
    await expect(page.locator("#fx-listbox [role=option]").first()).not.toHaveClass(/active/);
    await page.keyboard.press("Escape");
    await expect(page.locator("#fx-listbox")).toHaveClass(/hidden/);
  },
};

for (const { name, fixtures } of ROWS) {
  for (let i = 0; i < fixtures.length; i++) {
    for (const stage of STAGES) {
      test(`${name}[${i}] — ${stage}`, async ({ page, browserName }) => {
        const guards = await armGuards(page);
        if (name === "back") await page.goto("/fx/toggle/0"); // seed history for history.back()
        await page.goto(`/fx/${encodeURIComponent(name)}/${i}`);
        if (stage !== "initial") await reloadArena(page, stage === "morph" ? "morph" : "plain");
        if (name === "back" && stage !== "initial") {
          // the reload consumed no history; back still returns to the seeded entry
        }
        await EXERCISES[name](page, fixtures[i], i, browserName);
        await guards.assertClean();
      });
    }
  }
}
