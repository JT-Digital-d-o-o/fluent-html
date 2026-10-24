// Direct repros of the lens-law counterexamples, outside fast-check.
import { createRequire } from "node:module";
const pw = createRequire("/Users/tony/jt-digital/fluent-html/package.json")("playwright-core");
const HTMX = "/Users/tony/jt-digital/everyframe-composer/public/js/htmx.min.js";

for (const engine of ["chromium", "firefox", "webkit"]) {
  const browser = await pw[engine].launch();
  const page = await browser.newPage();
  await page.setContent("<!doctype html><html><body></body></html>");
  await page.addScriptTag({ path: HTMX });
  const out = await page.evaluate(async () => {
    const morph = (html) => htmx.swap({ target: document.getElementById("root"), text: `<div id="root">${html}</div>`, swap: "outerMorph" });
    const r = {};

    // 1. Identity: #c moves out of its wrapper; does the element with id c stay the same object?
    document.body.innerHTML = `<div id="root"><div class="wrap"><div><div id="c"><input type="text"></div></div></div><div></div></div>`;
    const c = document.getElementById("c");
    const input = c.querySelector("input");
    input.value = "typed";
    input.focus();
    await morph(`<div id="c"><input type="text"></div><div class="wrap"><div></div></div><div></div>`);
    const now = document.getElementById("c");
    r.identity = {
      sameObject: now === c,
      nowIsOldWrapper: now.__wasWrapper === true,
      typedKept: now.querySelector("input").value === "typed",
      focusKept: document.activeElement === now.querySelector("input"),
      oldConnected: c.isConnected,
    };

    // 2. Scroll across a raw moveBefore / insertBefore, no htmx.
    const box = () => {
      document.body.innerHTML = `<div id="p"><div id="s" style="overflow:auto;height:20px"><div style="height:200px"></div></div><div id="d"></div></div>`;
      const s = document.getElementById("s");
      s.scrollTop = 40;
      return s;
    };
    let s = box();
    if (document.getElementById("p").moveBefore) document.getElementById("p").moveBefore(s, null);
    r.moveBeforeScroll = Element.prototype.moveBefore ? s.scrollTop : "no moveBefore";
    s = box();
    document.getElementById("p").insertBefore(s, null);
    r.insertBeforeScroll = s.scrollTop;
    return r;
  });
  console.log(engine, browser.version(), JSON.stringify(out));
  await browser.close();
}
