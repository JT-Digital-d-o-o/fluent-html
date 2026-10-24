// The landing's loop media, with the real htmx and loops.js: a `.nav` to the same page is a morph
// of #main-content with the same render. Do the stills and loops keep the files loops.js gave them?
import { createRequire } from "node:module";
const pw = createRequire("/Users/tony/jt-digital/fluent-html/package.json")("playwright-core");
const JS = "/Users/tony/jt-digital/everyframe-composer/public/js/";
const GIF = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

// LoopMedia({ load: "lazy" }) and LoopVideo as home.everyframe.components.ts renders them.
const tile = (n) =>
  `<span aria-hidden="true"><img alt="" data-loop-still="${GIF}#${n}"><video muted loop playsinline preload="none" data-loop-src="/loop-${n}.mp4"></video></span>`;
const render = `<main id="main-content">${tile(1)}${tile(2)}</main>`;

for (const engine of ["chromium", "firefox", "webkit"]) {
  const browser = await pw[engine].launch();
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><html><body>${render}</body></html>`);
  await page.addScriptTag({ path: JS + "htmx.min.js" });
  await page.addScriptTag({ path: JS + "loops.js" });
  const read = () => page.evaluate(() => [...document.querySelectorAll("#main-content img, #main-content video")].map((e) => e.getAttribute("src") ?? "∅"));
  await page.waitForFunction(() => [...document.querySelectorAll("#main-content img, #main-content video")].every((e) => e.getAttribute("src")));
  const before = await read();
  await page.evaluate((html) => htmx.swap({ target: document.getElementById("main-content"), text: html, swap: "outerMorph" }), render);
  await page.waitForTimeout(500);
  const after = await read();
  const blank = after.filter((s) => s === "∅").length;
  console.log(`${engine}: before ${before.filter((s) => s !== "∅").length}/4 with a file, after the morph ${4 - blank}/4`);
  await browser.close();
}
