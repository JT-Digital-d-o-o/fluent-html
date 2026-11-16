// What the encoders do when the types are bypassed (any, spread, JSON from a request).
import { render, json, css, fire, poll, swap, html } from "sealed";
import { ids, projects } from "../screens/projects.routes";

const any = (v: unknown) => v as any;
const cases: Record<string, () => unknown> = {
  "hx typo passes tsc (hx-trgger)": () => <button {...any({ "hx-trgger": "click" })}>x</button>,
  "data-hx-get": () => <div data-hx-get="/x">x</div>,
  "onclick via spread": () => <button {...any({ onclick: "alert(1)" })}>x</button>,
  "style string via any": () => <div style={any("color:red;background:url(//evil)")}>x</div>,
  "script string via any": () => <script>{any("alert(1)")}</script>,
  "forged Html shape as a child": () => <p>{any(JSON.parse('{"s":"<script>alert(1)</script>","id":"x"}'))}</p>,
  "forged Verb shape": () => <button hx={any({ attrs: ' onclick="alert(1)"' })}>x</button>,
  "forged Route shape in href": () => <a href={any({ kind: "page", method: "get", url: "javascript:alert(1)" })}>x</a>,
  "verb given a string URL": () => <button hx={swap(any("javascript:alert(1)"))}>x</button>,
  "dynamic tag from data: script": () => { const T = any("script"); return <T>{"alert(1)"}</T>; },
  "dynamic tag from data: unknown": () => { const T = any("x onload=alert(1)"); return <T>x</T>; },
  "srcdoc with scripts and same origin": () => <iframe srcdoc="<p>x</p>" sandbox="allow-scripts allow-same-origin" />,
  "poll on an element with another id": () => <span id={ids.projectList} hx={poll(projects.status({ id: 1 }))}>x</span>,
  "nonce missing at render": () => render(<script src="/js/app.js" />),
  "nonce attribute by hand": () => <script {...any({ nonce: "abc" })} src="/js/app.js" />,
  "html tag with a hole": () => (html as any)`<b>${"x"}</b>`,
  "html tag called as a function": () => (html as any)(["<script>alert(1)</script>"]),
  "css hole in a selector": () => css`${any("body")}{color:red}`,
  "vals string": () => <button hx={fire(projects.remove({ id: 1 }), { vals: any("js:alert(1)") })}>x</button>,
  "stringified view": () => `${<b>x</b>}`,
  "route param from data with a slash": () => render(<a href={projects.detail({ id: any("1/../../admin") })}>x</a>),
  "CONTROL json in script renders": () => render(<script>{json({ v: "</script><!--<script>" })}</script>),
  "CONTROL url from data neutralised, no throw": () => render(<a href={any(" java\tscript:alert(1)")}>x</a>),
  "CONTROL css value from data dropped, no throw": () => render(<div style={{ color: "red;background:url(//evil)", width: "40%" }}>x</div>),
};
let thrown = 0, rendered = 0;
for (const [name, fn] of Object.entries(cases)) {
  try {
    const v = fn();
    const s = typeof v === "string" ? v : render(v as never, { nonce: "bm9uY2U" });
    rendered++;
    console.log(`RENDERED  ${name}\n          ${s}`);
  } catch (e) {
    thrown++;
    console.log(`REFUSED   ${name}\n          ${(e as Error).message}`);
  }
}
console.log(`\nrefused ${thrown}, rendered ${rendered} (the 3 CONTROL cases are meant to render)`);
