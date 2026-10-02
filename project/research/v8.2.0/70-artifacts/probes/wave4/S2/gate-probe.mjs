// B-01 dev-gate predicate reconciliation: 8.1.0 bytes per cast-only shape vs 4 candidate predicates.
import * as F from "fluent-html/dist/src/index.js";
const { A, setDevChecks, render, defineRoutes } = F;
setDevChecks(false);
const r = defineRoutes("/team", { index: { method: "get", path: "/" } });
const valid = r.index();
const fnEndpoint = { method: "get", endpoint: r.index }; // what hxGet(routes.x) uncalled builds
const shapes = {
  "valid route callable": valid,
  "method GET": { ...valid, method: "GET" },
  "method POST": { ...valid, method: "POST" },
  "URL-object endpoint": { method: "get", endpoint: new URL("https://example.com/team") },
  "String-object endpoint": { method: "get", endpoint: new String("/team") },
  "null clear": null,
  "false clear": false,
  "0 clear": 0,
  "empty-string clear": "",
  "spread '/team'": { ..."/team" },
  "spread uncalled callable": { ...r.index },
  "function endpoint (hxGet uncalled)": fnEndpoint,
  "method 'get x'": { method: "get x", endpoint: "/team" },
  "OOB-only cast": { swapOob: "true" },
};
const M = { get: true, post: true, put: true, patch: true, delete: true };
const has = (m) => typeof m === "string" && Object.prototype.hasOwnProperty.call(M, m.toLowerCase());
const preds = {
  rfc: (h) => typeof h.endpoint === "string" && ["get","post","put","patch","delete"].includes(h.method),
  bc: (h) => h.endpoint != null && has(h.method),
  rc: (h) => (typeof h.endpoint === "string" || h.endpoint instanceof String) && has(h.method),
  s2: (h) => h.endpoint != null && typeof h.endpoint !== "function" && has(h.method),
};
const guards = { neq: (h) => h != null, truthy: (h) => !!h };
const rows = [];
for (const [name, bag] of Object.entries(shapes)) {
  let html;
  try { html = render(A("x").setHtmx(bag)); } catch (e) { html = "THROW " + e.message; }
  const row = { name, html: html.slice(0, 110) };
  for (const [g, gf] of Object.entries(guards)) for (const [p, pf] of Object.entries(preds)) {
    let out;
    if (!gf(bag)) out = "pass";
    else { try { out = pf(bag) ? "pass" : "THROW"; } catch (e) { out = "TypeError"; } }
    row[`${g}/${p}`] = out;
  }
  rows.push(row);
}
for (const r of rows) console.log(JSON.stringify(r));
