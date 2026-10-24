// Two ForEachKeyed lists of different tables on one page: users keyed 1..3, projects keyed 1..3,
// so <li id="1"> appears twice. The reader types into user 2's field; the server re-renders with
// one more project at the top. Where does the typed text end up, and do the rows keep identity?
import { createRequire } from "node:module";
const pw = createRequire("/Users/tony/jt-digital/fluent-html/package.json")("playwright-core");
const HTMX = "/Users/tony/jt-digital/everyframe-composer/public/js/htmx.min.js";

const users = (ks) => `<ul id="users">${ks.map((k) => `<li id="${k}"><span>user ${k}</span><input type="text"></li>`).join("")}</ul>`;
const projects = (ks) => `<ol id="projects">${ks.map((k) => `<li id="${k}"><span>project ${k}</span><input type="text"></li>`).join("")}</ol>`;
const page1 = `${users([1, 2, 3])}${projects([1, 2, 3])}`;
const cases = {
  "a project added at the top": `${users([1, 2, 3])}${projects([4, 1, 2, 3])}`,
  "projects listed first": `${projects([1, 2, 3])}${users([1, 2, 3])}`,
  "user 2 removed": `${users([1, 3])}${projects([1, 2, 3])}`,
};

for (const engine of ["chromium", "firefox", "webkit"]) {
  const browser = await pw[engine].launch();
  const page = await browser.newPage();
  await page.setContent("<!doctype html><html><body></body></html>");
  await page.addScriptTag({ path: HTMX });
  for (const [name, page2] of Object.entries(cases)) {
    const r = await page.evaluate(async ({ page1, page2 }) => {
      document.body.innerHTML = `<div id="root">${page1}</div>`;
      const rows = [...document.querySelectorAll("li")];
      rows.forEach((li) => { li.__was = li.querySelector("span").textContent; });
      document.querySelector("#users li:nth-child(2) input").value = "typed into user 2";
      await htmx.swap({ target: document.getElementById("root"), text: `<div id="root">${page2}</div>`, swap: "outerMorph" });
      const now = [...document.querySelectorAll("li")];
      return {
        typedUnder: now.find((li) => li.querySelector("input").value)?.querySelector("span").textContent ?? "lost",
        crossed: now.filter((li) => li.__was && li.__was !== li.querySelector("span").textContent).map((li) => `${li.__was} → ${li.querySelector("span").textContent}`),
      };
    }, { page1, page2 });
    console.log(`${engine} | ${name}: typed text under "${r.typedUnder}"; rows that became another row: ${r.crossed.join(", ") || "none"}`);
  }
  await browser.close();
}
