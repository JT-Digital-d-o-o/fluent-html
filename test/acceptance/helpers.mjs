import { expect } from "@playwright/test";

/**
 * Arms the hard gates every matrix row runs under: zero console errors and
 * zero securitypolicyviolation events (acceptance row 1). Call `assertClean()`
 * at the end of the test; rows that EXPECT a console signal read
 * `errors`/`warnings` directly instead.
 */
export async function armGuards(page, { allow = [] } = {}) {
  const errors = [];
  const warnings = [];
  page.on("console", (message) => {
    const text = message.text();
    if (allow.some((re) => re.test(text))) return;
    if (message.type() === "error") errors.push(text);
    if (message.type() === "warning") warnings.push(text);
  });
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.addInitScript(() => {
    window.__csp = [];
    document.addEventListener("securitypolicyviolation", (e) => {
      window.__csp.push(`${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  return {
    errors,
    warnings,
    cspViolations: () => page.evaluate(() => window.__csp),
    async assertClean() {
      expect(errors).toEqual([]);
      expect(await page.evaluate(() => window.__csp)).toEqual([]);
    },
  };
}

/** Click one of the arena reload buttons and wait for the swap round-trip. */
export async function reloadArena(page, kind) {
  const responsePromise = page.waitForResponse((r) => r.url().includes("/arena"));
  await page.click(kind === "morph" ? "#reload-morph" : "#reload-plain");
  await responsePromise;
  await expect(page.locator("#arena")).toBeAttached();
}
