// Renders the three reference screens through the controller and checks the behaviours the
// brief names. Writes each answer to out/ for html-validate.
//   node tools/run-screens.mjs
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import dispatch from "../screens/lt/projects.controller.ts";
import { finishJob } from "../support/projects.service.ts";

const out = resolve(dirname(fileURLToPath(import.meta.url)), "../out");
mkdirSync(out, { recursive: true });
const save = (name, html) => writeFileSync(resolve(out, name), html + "\n");
const checks = [];
const check = (name, fn) => { fn(); checks.push(name); };

// R1
const list = await dispatch("list", { input: {} });
save("r1-list.html", list.body);
check("R1 search box reloads the list region after typing stops", () => {
  assert.match(list.body, /<input class="[^"]+" type="search" placeholder="Search projects" aria-label="Search projects" name="q" hx-get="\/projects\/rows" hx-trigger="input changed delay:300ms, search" hx-target="#project-list" hx-swap="outerMorph"/);
  assert.match(list.body, /<div class="[^"]+" id="project-list">/);
});
check("R1 each row links to the detail page", () => assert.match(list.body, /<a class="[^"]+" href="\/projects\/1">/));
check("R1 text is escaped", () => assert.ok(list.body.includes("Atlas &lt;redesign&gt;") && list.body.includes("Q3 &amp; Q4")));
const rows = await dispatch("rows", { input: { q: "zzz" } });
save("r1-rows-empty.fragment.html", rows.body);
check("R1 the fragment answers the region alone, with the empty state", () => {
  assert.ok(rows.body.startsWith('<div class="rounded-card border border-line bg-surface" id="project-list">'));
  assert.ok(rows.body.includes("No projects match &quot;zzz&quot;"));
});

// R2
const fresh = await dispatch("new");
save("r2-new.html", fresh.body);
const bad = await dispatch("create", { body: { name: "", description: "x".repeat(501), status: "nope" } });
save("r2-invalid.fragment.html", bad.body);
check("R2 an invalid submit answers 422 with the form region and each field's error", () => {
  assert.equal(bad.status, 422);
  assert.ok(bad.body.startsWith('<form class="grid max-w-lg gap-4" id="projects-create-form" action="/projects" method="post" hx-post="/projects"'));
  assert.ok(bad.body.includes('hx-status:422="target:#projects-create-form swap:outerMorph push:false"'));
  assert.ok(bad.body.includes('name="name" id="projects-create-name" aria-invalid="true" aria-describedby="projects-create-name-error"'));
  assert.match(bad.body, /<span id="projects-create-name-error" class="[^"]+">Name is required<\/span>/);
  assert.ok(bad.body.includes("Keep the description under 500 characters"));
  assert.ok(bad.body.includes("Choose one of: active, paused"));
});
const good = await dispatch("create", { body: { name: "New one", description: "", status: "paused" } });
check("R2 a valid submit redirects to the new project", () => assert.deepEqual(good, { status: 303, location: "/projects/3" }));

// R3
const detail = await dispatch("detail", { input: { id: 1 } });
save("r3-detail.html", detail.body);
check("R3 the delete button opens a native dialog", () => {
  assert.match(detail.body, /<button class="[^"]+" command="show-modal" commandfor="delete-project" type="button">Delete<\/button>/);
  assert.match(detail.body, /<dialog class="[^"]+" id="delete-project" closedby="any">/);
  assert.match(detail.body, /<button class="[^"]+" hx-post="\/projects\/1\/delete"[^>]* type="button">Delete project<\/button>/);
});
check("R3 the badge polls while the job runs", () =>
  assert.match(detail.body, /<span class="[^"]+" id="project-status" hx-get="\/projects\/1\/status" hx-trigger="every 2s" hx-target="this" hx-swap="outerHTML">Exporting…<\/span>/));
finishJob(1);
const settled = await dispatch("status", { input: { id: 1 } });
save("r3-status-done.fragment.html", settled.body);
check("R3 the badge stops polling when the job is done", () =>
  assert.equal(settled.body, '<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-success/10 text-success" id="project-status">Export ready</span>'));
check("R3 a missing project answers 404", async () => assert.equal((await dispatch("detail", { input: { id: 99 } })).status, 404));

for (const c of checks) console.log("ok  " + c);
console.log(`${checks.length} checks passed`);
