// Smoke test for serve(): the three screens over real HTTP.
//   node tools/serve-smoke.mjs
import assert from "node:assert/strict";
import { serve } from "lean-tags";
import app from "../screens/lt/projects.controller.ts";

const server = serve([app], 0);
await new Promise((r) => server.once("listening", r));
const base = `http://127.0.0.1:${server.address().port}`;
const get = (path, headers) => fetch(base + path, { headers, redirect: "manual" });
const post = (path, body, headers = {}) =>
  fetch(base + path, { method: "POST", body: new URLSearchParams(body), headers: { "content-type": "application/x-www-form-urlencoded", ...headers }, redirect: "manual" });
const lines = [];
const ok = (name, cond) => { assert.ok(cond, name); lines.push("ok  " + name); };

let r = await get("/projects");
ok("GET /projects answers the list page", r.status === 200 && (await r.text()).includes('id="project-list"'));
r = await get("/projects/rows?q=zzz");
ok("GET /projects/rows?q=zzz answers the region alone", r.status === 200 && (await r.text()).startsWith('<div class="rounded-card border border-line bg-surface" id="project-list">'));
r = await get("/projects/1");
ok("GET /projects/1 answers the detail page", r.status === 200);
r = await get("/projects/abc");
ok("GET /projects/abc (not a number) answers 404", r.status === 404);
r = await get("/projects/99");
ok("GET /projects/99 answers 404", r.status === 404);
r = await post("/projects", { name: "", status: "active" });
ok("POST /projects invalid answers 422 with the form", r.status === 422 && (await r.text()).startsWith("<form"));
r = await post("/projects", { name: "Smoke", status: "active" });
ok("POST /projects valid answers 303 to the new project", r.status === 303 && /^\/projects\/\d+$/.test(r.headers.get("location")));
r = await post("/projects", { name: "Smoke 2", status: "paused" }, { "hx-request": "true" });
ok("POST /projects from htmx answers HX-Redirect", r.status === 200 && /^\/projects\/\d+$/.test(r.headers.get("hx-redirect")));
server.close();
console.log(lines.join("\n") + `\n${lines.length} checks passed`);
