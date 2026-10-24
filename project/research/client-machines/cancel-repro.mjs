// Does the rule Cut learned (a touch pan ends a drag with pointercancel, no pointerup) hold for the
// other scrub UIs? The real clip-cut.js and clip-speed.js on their own markup. Chromium: a real touch
// pan through CDP, so the browser itself decides to scroll and cancels. Firefox and WebKit: the same
// event sequence dispatched by hand (the scripts' logic only).
import { createRequire } from "node:module";
const pw = createRequire("/Users/tony/jt-digital/fluent-html/package.json")("playwright-core");
const JS = "/Users/tony/jt-digital/everyframe-composer/public/js/";

const cutter = `
<div data-clip-cut data-cut-duration="10" style="padding:20px">
  <video data-cut-video muted></video>
  <div data-cut-track style="position:relative;width:300px;height:48px;background:#ddd"><div data-cut-head style="position:absolute;top:0;bottom:0;width:2px;background:red"></div></div>
  <div data-cut-time></div><button data-cut-play type="button">Play</button>
  <div data-cut-list></div><input type="hidden" data-cut-pieces><div data-cut-summary></div>
  <button data-cut-submit type="button"></button><button data-cut-toggle type="button"></button>
  <template data-cut-seg-tpl><div style="position:absolute;top:0;bottom:0"><span data-cut-seg-label></span></div></template>
  <template data-cut-row-tpl data-cut-noun="Piece"><div><span data-cut-row-name></span><span data-cut-row-range></span></div></template>
  <template data-cut-mark-tpl><div style="position:absolute;top:0;bottom:0;width:2px"></div></template>
</div>`;

const speeds = ["0.5", "1", "1.5", "2"];
const speed = `
<div data-clip-speed data-speed-in="0" data-speed-span="10" style="padding:20px">
  <video data-speed-video muted></video>
  <div data-speed-ruler style="position:relative;width:300px;height:48px;background:#ddd"></div>
  ${speeds.map((v) => `<input type="radio" name="speed" value="${v}"${v === "1" ? " checked" : ""}>`).join("")}
  <div data-speed-bar></div><span data-speed-label></span><span data-speed-word-label></span>
  <div data-speed-knob></div><div data-speed-fill></div><span data-speed-length></span><span data-speed-total></span>
  <div data-speed-head></div><span data-speed-now></span>
</div>`;

const page = (body) => `<!doctype html><html><head><meta name="viewport" content="width=device-width"></head><body style="margin:0">${body}<div style="height:3000px"></div></body></html>`;

// Seeks are what a scrub does: watch the video's currentTime writes without needing media.
const watch = () => {
  window.__log = { seeks: 0, events: [] };
  const v = document.querySelector("video");
  let t = 0;
  Object.defineProperty(v, "currentTime", { get: () => t, set: (x) => { t = x; window.__log.seeks++; } });
  for (const type of ["pointerdown", "pointermove", "pointerup", "pointercancel"])
    document.addEventListener(type, (e) => window.__log.events.push(`${type}:${e.pointerType}`), true);
};
const checked = () => document.querySelector('input[name="speed"]:checked')?.value;

async function realPan(pg, cdp, x, y) {
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  for (let i = 1; i <= 8; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y - i * 25 }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await pg.waitForTimeout(300);
}

async function fakePan(pg, sel) {
  await pg.evaluate((sel) => {
    const el = document.querySelector(sel);
    const r = el.getBoundingClientRect();
    const at = { bubbles: true, cancelable: true, pointerId: 1, isPrimary: true, clientX: r.left + r.width * 0.8, clientY: r.top + r.height / 2 };
    el.dispatchEvent(new PointerEvent("pointerdown", { ...at, pointerType: "touch", buttons: 1 }));
    el.dispatchEvent(new PointerEvent("pointercancel", { ...at, pointerType: "touch", clientX: 0, clientY: 0 }));
  }, sel);
}

// A mouse that only passes over, no button down.
async function hover(pg, sel, real) {
  if (real) {
    const box = await pg.locator(sel).boundingBox();
    await pg.mouse.move(box.x + 5, box.y + box.height / 2);
    for (let i = 1; i <= 6; i++) await pg.mouse.move(box.x + 5 + i * 40, box.y + box.height / 2);
    return;
  }
  await pg.evaluate((sel) => {
    const el = document.querySelector(sel);
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 6; i++)
      el.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 1, pointerType: "mouse", isPrimary: true, buttons: 0, clientX: r.left + 5 + i * 40, clientY: r.top + r.height / 2 }));
  }, sel);
}

for (const engine of ["chromium", "firefox", "webkit"]) {
  const browser = await pw[engine].launch();
  const real = engine === "chromium";
  const ctx = await browser.newContext({ viewport: { width: 400, height: 700 }, hasTouch: true });

  // clip-cut
  let pg = await ctx.newPage();
  await pg.setContent(page(cutter));
  await pg.addScriptTag({ path: JS + "clip-cut.js" });
  await pg.evaluate(watch);
  if (real) {
    const cdp = await ctx.newCDPSession(pg);
    const box = await pg.locator("[data-cut-track]").boundingBox();
    await realPan(pg, cdp, box.x + box.width * 0.8, box.y + box.height / 2);
  } else await fakePan(pg, "[data-cut-track]");
  const afterPan = await pg.evaluate(() => ({ ...window.__log, scrolled: window.scrollY }));
  await pg.evaluate(() => window.scrollTo(0, 0));
  await pg.evaluate(() => { window.__log.seeks = 0; });
  await hover(pg, "[data-cut-track]", real);
  const hoverSeeks = await pg.evaluate(() => window.__log.seeks);
  console.log(`${engine} clip-cut: pan ${real ? "(real)" : "(dispatched)"} events [${[...new Set(afterPan.events)].join(", ")}], page scrolled ${afterPan.scrolled}px, seeks during the pan ${afterPan.seeks}; then a mouse passing over with no button: ${hoverSeeks} seeks`);
  await pg.close();

  // clip-speed
  pg = await ctx.newPage();
  await pg.setContent(page(speed));
  await pg.addScriptTag({ path: JS + "clip-speed.js" });
  await pg.evaluate(watch);
  const before = await pg.evaluate(checked);
  if (real) {
    const cdp = await ctx.newCDPSession(pg);
    const box = await pg.locator("[data-speed-ruler]").boundingBox();
    await realPan(pg, cdp, box.x + box.width * 0.95, box.y + box.height / 2);
  } else await fakePan(pg, "[data-speed-ruler]");
  const afterPanSpeed = await pg.evaluate(checked);
  const ev = await pg.evaluate(() => [...new Set(window.__log.events)].join(", "));
  await pg.evaluate(() => window.scrollTo(0, 0));
  await pg.evaluate(() => { const r = document.querySelector('input[value="1"]'); r.checked = true; });
  await hover(pg, "[data-speed-ruler]", real);
  const afterHover = await pg.evaluate(checked);
  console.log(`${engine} clip-speed: speed ${before}× before; a pan that started on the ruler left it at ${afterPanSpeed}× (events [${ev}]); reset to 1×, a mouse passing over with no button left it at ${afterHover}×`);
  await browser.close();
}
