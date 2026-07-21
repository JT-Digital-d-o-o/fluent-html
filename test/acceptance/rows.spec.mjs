// Hand-written acceptance rows 2–28 (row 1 lives in matrix.spec.mjs; rows 26/29
// are the unit tier + the build-time size gate; row 30 is the framework-glue
// dev guard, owned by the template repo alongside W5).
import { test, expect } from "@playwright/test";
import { armGuards, reloadArena } from "./helpers.mjs";

// Row 2 — two-version skew: unknown verb skipped, exactly one console.warn,
// data-behavior-unknown mark, everything else still works, zero errors.
test("row 2: skew — unknown verb degrades defined-ly", async ({ page }) => {
  const guards = await armGuards(page);
  await page.goto("/skew");
  await page.click("#future");
  await page.click("#future"); // second interaction must NOT warn again
  await expect(page.locator("#future")).toHaveAttribute("data-behavior-unknown", "futureVerb");
  await page.click("#carrier");
  await expect(page.locator("#fx-panel")).toHaveClass(/hidden/);
  expect(guards.warnings.filter((w) => w.includes("unknown verb"))).toHaveLength(1);
  await guards.assertClean();
});

// Row 3 — registry-hash handshake: exactly one loud console.error, behaviors
// still dispatch (documented degrade).
test("row 3: stamp mismatch — one console.error, still dispatching", async ({ page }) => {
  const guards = await armGuards(page);
  await page.goto("/stamp-mismatch");
  await page.click("#carrier");
  await expect(page.locator("#fx-panel")).toHaveClass(/hidden/);
  expect(guards.errors.filter((e) => e.includes("stamp"))).toHaveLength(1);
  expect(guards.errors).toHaveLength(1);
  expect(await guards.cspViolations()).toEqual([]);
});

// Row 4 — no-htmx profile: full non-lifecycle vocabulary with no htmx runtime;
// lifecycle listeners provably inert; the mobile-menu drawer opens/closes.
test("row 4: no-htmx profile", async ({ page }) => {
  const guards = await armGuards(page);
  await page.goto("/no-htmx");
  await page.click("#carrier");
  await expect(page.locator("#fx-panel")).toHaveClass(/hidden/);
  await page.click("#menu-btn");
  await expect(page.locator("#fx-drawer")).toHaveClass(/is-open/);
  await page.click("#menu-btn");
  await expect(page.locator("#fx-drawer")).not.toHaveClass(/is-open/);
  await guards.assertClean();
});

// Row 5 — focus remap: event:"focus" fires via focusin delegation.
test("row 5: focus-event remap fires on focus", async ({ page }) => {
  const guards = await armGuards(page);
  await page.goto("/focus-remap");
  await page.focus("#carrier");
  await expect(page.locator("#fx-panel")).toHaveClass(/hidden/);
  await guards.assertClean();
});

// Row 6 — capture-phase guarantee: descendant stopPropagation cannot suppress
// an ancestor carrier's behavior.
test("row 6: descendant stopPropagation cannot kill the carrier", async ({ page }) => {
  const guards = await armGuards(page);
  await page.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => {
      document.getElementById("inner-stop").addEventListener("click", (e) => e.stopPropagation());
    });
  });
  await page.goto("/capture");
  await page.click("#inner-stop");
  await expect(page.locator("#fx-panel")).toHaveClass(/hidden/);
  await guards.assertClean();
});

// Row 7 — nested carriers, click consumption: the clipboard button copies and
// does NOT toggle the surrounding row.
test("row 7: inner clipboard consumes; outer toggle untouched", async ({ page, browserName }) => {
  const guards = await armGuards(page);
  await page.goto("/nested");
  await page.click("#copy-btn");
  await expect(page.locator("#fx-panel")).not.toHaveClass(/hidden/);
  if (browserName === "chromium") {
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("nested-copy");
  }
  await page.click("#carrier");
  await expect(page.locator("#fx-panel")).toHaveClass(/hidden/);
  await guards.assertClean();
});

// Row 8 — conditional keyboard consumption: Escape with the listbox OPEN closes
// only the listbox (form untouched, typed input preserved); with it CLOSED the
// form's onEscape fires.
test("row 8: listbox consumes Escape only while open", async ({ page }) => {
  const guards = await armGuards(page);
  await page.goto("/listbox-escape");
  await page.fill("#lb-input", "typed");
  await page.keyboard.press("Escape");
  await expect(page.locator("#fx-listbox")).toHaveClass(/hidden/);
  await expect(page.locator("#fx-panel")).not.toHaveClass(/hidden/); // form's onEscape did NOT fire
  await expect(page.locator("#lb-input")).toHaveValue("typed");
  await page.keyboard.press("Escape");
  await expect(page.locator("#fx-panel")).toHaveClass(/hidden/); // now the form's onEscape acted
  await guards.assertClean();
});

// Row 9 — drawer vs background poll: a non-containing, non-pushUrl swap never
// closes the drawer.
test("row 9: background poll leaves the drawer open", async ({ page }) => {
  const guards = await armGuards(page);
  await page.goto("/fx/drawer/0");
  await page.click("#carrier");
  await expect(page.locator("#fx-drawer")).toHaveClass(/is-open/);
  const poll = page.waitForResponse((r) => r.url().includes("/poll"));
  await page.click("#poll-btn");
  await poll;
  await expect(page.locator("#poll")).toHaveText("poll-fresh");
  await expect(page.locator("#fx-drawer")).toHaveClass(/is-open/);
  await expect(page.locator("body")).toHaveClass(/overflow-hidden/);
  await guards.assertClean();
});

// Row 10 — drawer vs navigation: pushUrl swap runs the FULL close routine.
test("row 10: nav swap fully closes the drawer", async ({ page }) => {
  const guards = await armGuards(page);
  await page.goto("/fx/drawer/0");
  await page.click("#carrier");
  await expect(page.locator("#fx-drawer")).toHaveClass(/is-open/);
  const nav = page.waitForResponse((r) => r.url().includes("/arena"));
  await page.click("#drawer-nav");
  await nav;
  await expect(page.locator("#fx-drawer")).not.toHaveClass(/is-open/);
  await expect(page.locator("#fx-drawer-backdrop")).not.toHaveClass(/is-open/);
  await expect(page.locator("body")).not.toHaveClass(/overflow-hidden/);
  // server-authoritative: the swapped-in trigger carries no aria-expanded="true"
  await expect(page.locator("#carrier")).not.toHaveAttribute("aria-expanded", "true");
  // focus is on a connected element
  expect(await page.evaluate(() => document.activeElement !== null && document.activeElement.isConnected)).toBe(true);
  await guards.assertClean();
});

// Row 11 — drawer vs containing morph: always lands closed; Tab reaches
// elements outside the (closed) drawer — no dangling document-level trap.
test("row 11: containing morph closes the drawer, trap disarmed", async ({ page }) => {
  const guards = await armGuards(page);
  await page.goto("/fx/drawer/0");
  await page.click("#carrier");
  await expect(page.locator("#fx-drawer")).toHaveClass(/is-open/);
  await reloadArena(page, "morph");
  await expect(page.locator("#fx-drawer")).not.toHaveClass(/is-open/);
  await expect(page.locator("body")).not.toHaveClass(/overflow-hidden/);
  await page.focus("#fx-search"); // focusable OUTSIDE the drawer must be reachable
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.getElementById("fx-drawer").contains(document.activeElement))).toBe(false);
  await guards.assertClean();
});

// Row 12 — reconciliation sweep: drawer DOM removed externally + any
// after:swap → scroll unlocked, trap disarmed.
test("row 12: sweep after external removal unlocks the page", async ({ page }) => {
  const guards = await armGuards(page);
  await page.goto("/fx/drawer/0");
  await page.click("#carrier");
  await expect(page.locator("body")).toHaveClass(/overflow-hidden/);
  await page.click("#remove-arena"); // removes the arena (and the drawer) via the remove verb
  await expect(page.locator("#arena")).not.toBeAttached();
  const poll = page.waitForResponse((r) => r.url().includes("/poll"));
  await page.click("#poll-btn"); // any after:swap triggers the sweep
  await poll;
  await expect(page.locator("body")).not.toHaveClass(/overflow-hidden/);
  await page.keyboard.press("Tab"); // no dangling trap
  await guards.assertClean();
});

// Row 13 — sibling drawers: opening B fully closes A first; Escape closes B only.
test("row 13: at-most-one-open across sibling drawers", async ({ page }) => {
  const guards = await armGuards(page);
  await page.goto("/drawers2");
  await page.click("#open-a");
  await expect(page.locator("#drawer-a")).toHaveClass(/is-open/);
  await page.click("#open-b");
  await expect(page.locator("#drawer-a")).not.toHaveClass(/is-open/);
  await expect(page.locator("#backdrop-a")).not.toHaveClass(/is-open/);
  await expect(page.locator("body")).not.toHaveClass(/lock-a/);
  await expect(page.locator("#open-a")).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#drawer-b")).toHaveClass(/is-open/);
  await page.keyboard.press("Escape");
  await expect(page.locator("#drawer-b")).not.toHaveClass(/is-open/);
  await expect(page.locator("#drawer-a")).not.toHaveClass(/is-open/);
  await guards.assertClean();
});

// Row 14 — Escape precedence: innermost active thing first — suggestions if
// open, the drawer on the next press.
test("row 14: one Escape closes only the innermost open thing", async ({ page }) => {
  const guards = await armGuards(page);
  await page.goto("/drawer-escape");
  await page.click("#menu-btn");
  await expect(page.locator("#fx-drawer")).toHaveClass(/is-open/);
  await page.click("#lb-input");
  await page.keyboard.press("Escape"); // 1: closes the suggestions only
  await expect(page.locator("#fx-listbox")).toHaveClass(/hidden/);
  await expect(page.locator("#fx-drawer")).toHaveClass(/is-open/);
  await page.keyboard.press("Escape"); // 2: nothing inner acts → the drawer closes
  await expect(page.locator("#fx-drawer")).not.toHaveClass(/is-open/);
  await guards.assertClean();
});

// Row 15 — trapFocus: Tab and Shift+Tab cycle inside; focus-first landed.
test("row 15: focus trap cycles within the open drawer", async ({ page }) => {
  const guards = await armGuards(page);
  await page.goto("/fx/drawer/0");
  await page.click("#carrier");
  await expect(page.locator("#drawer-nav")).toBeFocused(); // focus-first
  await page.keyboard.press("Tab");
  await expect(page.locator("#drawer-btn")).toBeFocused();
  await page.keyboard.press("Tab"); // wraps to first
  await expect(page.locator("#drawer-nav")).toBeFocused();
  await page.keyboard.press("Shift+Tab"); // wraps back to last
  await expect(page.locator("#drawer-btn")).toBeFocused();
  await guards.assertClean();
});

// Row 16 — clipboard double-click re-entrancy: restores the ORIGINAL label.
test("row 16: double-click feedback restores the original label", async ({ page }) => {
  const guards = await armGuards(page);
  await page.goto("/fx/clipboard/0");
  await page.click("#carrier");
  await page.click("#carrier"); // rapid second click while feedback active
  await expect(page.locator("#carrier")).toHaveText("Copied!");
  await expect(page.locator("#carrier")).toHaveText("Trigger"); // never sticks
  await guards.assertClean();
});

// Row 17 — feedback vs morph: the restore never clobbers a fresh server render.
test("row 17: mid-feedback morph wins over the restore", async ({ page }) => {
  const guards = await armGuards(page);
  await page.goto("/fx/clipboard/0");
  await page.click("#carrier");
  await expect(page.locator("#carrier")).toHaveText("Copied!");
  await reloadArena(page, "morph"); // fresh server render mid-feedback
  await expect(page.locator("#carrier")).toHaveText("Trigger");
  await page.waitForTimeout(1000); // past durationMs — compare guard must not fire
  await expect(page.locator("#carrier")).toHaveText("Trigger");
  await guards.assertClean();
});

// Row 18 — clipboard degraded: navigator.clipboard absent → no-op + one
// console.warn, feedback suppressed, zero errors.
test("row 18: clipboard degrade without navigator.clipboard", async ({ page }) => {
  const guards = await armGuards(page);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: undefined });
  });
  await page.goto("/fx/clipboard/0");
  await page.click("#carrier");
  await expect(page.locator("#carrier")).toHaveText("Trigger"); // feedback suppressed
  expect(guards.warnings.filter((w) => w.includes("clipboard"))).toHaveLength(1);
  await guards.assertClean();
});

// Row 19b — 422 keeps typed values, no reset.
test("row 19b: 422 preserves typed values", async ({ page }) => {
  // the deliberate 422 logs a browser network error — not a runtime error
  const guards = await armGuards(page, { allow: [/Failed to load resource/] });
  await page.goto("/reset-invalid");
  await page.fill("#form-input", "typed-value");
  const post = page.waitForResponse((r) => r.url().includes("/submit/invalid"));
  await page.click("#submit-btn");
  await post;
  await expect(page.locator("#form-input")).toHaveValue("typed-value");
  await guards.assertClean();
});

// Row 19c — 200 full-layout morph replacing the form: defined no-op, zero errors.
test("row 19c: full morph replacing the form is a defined no-op", async ({ page }) => {
  const guards = await armGuards(page);
  await page.goto("/reset-morph");
  await page.fill("#form-input", "typed-value");
  const post = page.waitForResponse((r) => r.url().includes("/reset-morph/arena"));
  await page.click("#submit-btn");
  await post;
  await expect(page.locator("#form-input")).toHaveValue(""); // the fresh server render
  await guards.assertClean();
});

// Row 20 — remove + animateOut: transitionend when a transition matches,
// timeout fallback when none does — cannot hang.
test("row 20: animateOut removes with and without a matching transition", async ({ page }) => {
  const guards = await armGuards(page);
  await page.goto("/remove-animate");
  await page.click("#rm-yes");
  await expect(page.locator("#anim-yes")).not.toBeAttached();
  await page.click("#rm-no");
  await expect(page.locator("#anim-no")).not.toBeAttached(); // timeout fallback (120ms)
  await guards.assertClean();
});

// Row 21 — onEscape scope:document fires with focus OUTSIDE the carrier.
test("row 21: document-scoped onEscape fires from anywhere", async ({ page }) => {
  const guards = await armGuards(page);
  await page.goto("/esc-doc");
  await page.focus("#outside-input");
  await page.keyboard.press("Escape");
  await expect(page.locator("#fx-panel")).toHaveClass(/hidden/);
  await guards.assertClean();
});

// ADR-05 precedence — an open drawer's Escape close preempts document-scoped
// onEscape carriers sitting behind the overlay; they fire on the NEXT press.
test("row 21b: open drawer preempts document-scoped onEscape", async ({ page }) => {
  const guards = await armGuards(page);
  await page.goto("/esc-doc");
  await page.click("#menu-btn");
  await expect(page.locator("#fx-drawer")).toHaveClass(/is-open/);
  await page.focus("#outside-input");
  await page.keyboard.press("Escape"); // 1: closes the drawer only
  await expect(page.locator("#fx-drawer")).not.toHaveClass(/is-open/);
  await expect(page.locator("#fx-panel")).not.toHaveClass(/hidden/);
  await page.keyboard.press("Escape"); // 2: now the document-scoped onEscape fires
  await expect(page.locator("#fx-panel")).toHaveClass(/hidden/);
  await guards.assertClean();
});

// Row 22 — onClickOutside: clicking back into the anchor input does NOT
// dismiss (the anti-popover=auto row). Covered inside the matrix exercise too;
// this row pins the anchor-input case explicitly.
test("row 22: anchor input click does not dismiss", async ({ page }) => {
  const guards = await armGuards(page);
  await page.goto("/fx/onClickOutside/0");
  await page.click("#inside-input");
  await page.click("#inside-input");
  await expect(page.locator("#carrier")).not.toHaveClass(/hidden/);
  await page.click("#fx-banner");
  await expect(page.locator("#carrier")).toHaveClass(/hidden/);
  await guards.assertClean();
});

// Row 23 — anchor semantics: a non-preventDefault verb navigates after the
// behavior runs; back prevents default and pops history.
test("row 23: anchors navigate unless the verb prevents default", async ({ page }) => {
  const guards = await armGuards(page);
  await page.goto("/anchor");
  await page.click("#nav-toggle");
  await expect(page).toHaveURL(/\/page2$/); // toggle ran, then the anchor navigated
  await page.goBack();
  await page.goto("/anchor");
  await page.click("#go-back");
  await expect(page).not.toHaveURL(/\/never/);
  await guards.assertClean();
});

// Row 24 — multi-verb element: both verbs fire in declaration order on one click.
test("row 24: toggleClass + clipboard both fire", async ({ page, browserName }) => {
  const guards = await armGuards(page);
  await page.goto("/multi");
  await page.click("#carrier");
  await expect(page.locator("#fx-panel")).toHaveClass(/tooltip-visible/);
  if (browserName === "chromium") {
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("multi-copy");
  }
  await guards.assertClean();
});

// Row 27 — CSP hygiene sweep: zero inline scripts, zero hx-on:*, only nonce'd
// src scripts; the asset ships immutable cache headers.
test("row 27: CSP hygiene — no inline JS anywhere", async ({ page, request }) => {
  const response = await request.get("/fx/toggle/0");
  const html = await response.text();
  expect(html).not.toMatch(/hx-on/);
  expect(html).not.toMatch(/<script(?![^>]*\bsrc=)/); // every script tag is src-based
  for (const tag of html.match(/<script[^>]*>/g) ?? []) {
    expect(tag).toMatch(/nonce="/);
  }
  const arena = await (await request.get("/fx/toggle/0/arena")).text();
  expect(arena).not.toMatch(/<script|hx-on/);
  const assetPath = html.match(/src="(\/assets\/fluent-behaviors[^"]+)"/)[1];
  const asset = await request.get(assetPath);
  expect(asset.headers()["cache-control"]).toContain("immutable");
  void page;
});

// Row 28 — native tier: command/commandfor + dialog closedby under initial
// load; Escape closes (closedby="any").
test("row 28: native dialog opens via Invoker Commands, closes via closedby", async ({ page }) => {
  const guards = await armGuards(page);
  await page.goto("/native-dialog");
  await page.click("#open-dialog");
  await expect(page.locator("#confirm-dialog")).toHaveAttribute("open", "");
  await page.keyboard.press("Escape");
  await expect(page.locator("#confirm-dialog")).not.toHaveAttribute("open", "");
  await page.click("#open-dialog");
  await page.click("#close-dialog");
  await expect(page.locator("#confirm-dialog")).not.toHaveAttribute("open", "");
  await guards.assertClean();
});
