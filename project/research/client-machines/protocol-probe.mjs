// What each engine actually sends for the gestures the model must describe, with real input.
import { createRequire } from "node:module";
const pw = createRequire("/Users/tony/jt-digital/fluent-html/package.json")("playwright-core");

const html = `<!doctype html><html><body style="margin:0">
<div id="row" style="display:flex;gap:40px;padding:40px">
  <div id="A" tabindex="0" style="width:120px;height:80px;background:#cde"></div>
  <div id="B" style="width:120px;height:80px;background:#edc"></div>
</div></body></html>`;

const setup = (mode) => {
  window.__log = [];
  const A = document.getElementById("A");
  const types = ["pointerdown", "pointerup", "pointercancel", "click", "auxclick", "contextmenu", "gotpointercapture", "lostpointercapture", "keydown"];
  for (const t of types)
    document.addEventListener(t, (e) => {
      const id = e.target.id || e.target.nodeName;
      window.__log.push(`${t}@${id}${e.button !== undefined && e.button > 0 && t !== "keydown" ? `(b${e.button})` : ""}`);
    }, true);
  let moves = 0;
  document.addEventListener("pointermove", () => { moves++; }, true);
  window.__moves = () => moves;
  A.addEventListener("pointerdown", (e) => {
    if (mode.capture) A.setPointerCapture(e.pointerId);
    if (mode.remove) setTimeout(() => A.remove(), 0);
    if (mode.move) setTimeout(() => {
      const row = document.getElementById("row");
      if (mode.move === "moveBefore" && row.moveBefore) row.moveBefore(A, null);
      else row.insertBefore(A, null);
    }, 0);
  });
};

const cases = {
  "drag A→B, capture": { capture: true },
  "drag A→B, no capture": {},
  "drag A→B, capture, Escape mid-drag": { capture: true, escape: true },
  "capture, A removed mid-drag": { capture: true, remove: true },
  "capture, A moved by insertBefore": { capture: true, move: "insertBefore" },
  "capture, A moved by moveBefore": { capture: true, move: "moveBefore" },
  "right press on A": { right: true },
};

for (const engine of ["chromium", "firefox", "webkit"]) {
  const browser = await pw[engine].launch();
  console.log(`\n=== ${engine} ${browser.version()}`);
  for (const [name, mode] of Object.entries(cases)) {
    const page = await browser.newPage();
    await page.setContent(html);
    await page.evaluate(setup, mode);
    const a = await page.locator("#A").boundingBox();
    const b = await page.locator("#B").boundingBox();
    if (mode.right) {
      await page.mouse.move(a.x + 20, a.y + 20);
      await page.mouse.down({ button: "right" });
      await page.mouse.up({ button: "right" });
    } else {
      await page.mouse.move(a.x + 20, a.y + 20);
      await page.mouse.down();
      await page.waitForTimeout(30);
      await page.mouse.move(a.x + 60, a.y + 30, { steps: 3 });
      if (mode.escape) await page.keyboard.press("Escape");
      await page.mouse.move(b.x + 20, b.y + 20, { steps: 5 });
      await page.mouse.up();
    }
    await page.waitForTimeout(50);
    const log = await page.evaluate(() => window.__log);
    const moveBefore = await page.evaluate(() => typeof Element.prototype.moveBefore === "function");
    console.log(`${name}${mode.move === "moveBefore" && !moveBefore ? " (no moveBefore: fell back)" : ""}: ${log.join(" → ")}`);
    await page.close();
  }
  await browser.close();
}
