// The three reference screens driven through app(): each asserts the behaviour its screen names, and
// every answer is written to out/ for html-validate. Run: node --test test/screens.test.ts
import { test } from "node:test";
import { mkdirSync, writeFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import { app } from "../kit/index.ts";
import "../screens/styles.ts";
import * as projects from "../screens/projects.ts";
import { db } from "../screens/data.ts";

const site = app(projects);
const out = new URL("../out/", import.meta.url);
mkdirSync(out, { recursive: true });
const hx = (target?: string) => ({ "hx-request": "true", ...(target ? { "hx-target": target } : {}) });
let n = 0;
const save = (name: string, body: string, fragment: boolean) => {
  writeFileSync(new URL(`${name}.${fragment ? "fragment" : "document"}.html`, out), body);
  n++;
};
const count = (s: string, needle: string) => s.split(needle).length - 1;

test("R1: list, search into the region, rows link to detail, empty state", async () => {
  const full = await site.handle({ method: "GET", url: "/projects" });
  assert.equal(full.status, 200);
  assert.match(full.body, /^<!DOCTYPE html>/);
  assert.match(full.body, /<link rel="stylesheet" href="\/app.css"><script src="\/htmx.js" defer><\/script><\/head>/);
  assert.equal(count(full.body, "<h1"), 1);
  assert.match(full.body, /<search><form method="get" action="\/projects"><label for="projects-rows-q" class="sr-only">Search projects<\/label>/);
  assert.match(full.body, /hx-get="\/projects" hx-target="#projects-rows" hx-swap="outerMorph" hx-trigger="input changed delay:300ms, search" hx-sync="this:replace" hx-push-url="true"/);
  assert.match(full.body, /<div id="projects-rows"><ul [^>]*><li id="projects-rows-1"><a href="\/projects\/1" hx-get="\/projects\/1" hx-target="#main-content"/);
  assert.ok(full.body.includes("Borealis &lt;b&gt;"), "row text is escaped");
  assert.ok(!full.body.includes("kit-region"), "no unresolved region marker");
  save("r1-list", full.body, false);

  const region = await site.handle({ method: "GET", url: "/projects?q=apo", headers: hx("div#projects-rows") });
  assert.match(region.body, /^<div id="projects-rows"><ul/);
  assert.equal(count(region.body, "<li"), 1);
  save("r1-rows", region.body, true);

  const empty = await site.handle({ method: "GET", url: "/projects?q=%3Cscript%3E", headers: hx("div#projects-rows") });
  assert.ok(empty.body.includes("No projects match &quot;&lt;script&gt;&quot;"), "empty state, query escaped");
  assert.ok(!empty.body.includes("<ul"), "no empty list element");
  save("r1-empty", empty.body, true);

  const typed = await site.handle({ method: "GET", url: "/projects?q=apo" });
  assert.match(typed.body, /name="q" value="apo"/, "the box shows the current query after a reload");

  const nav = await site.handle({ method: "GET", url: "/projects", headers: hx("main#main-content") });
  assert.match(nav.body, /^<title>Projects<\/title><main id="main-content"/, "htmx navigation answers main only");
});

test("R2: create form; invalid answers 422 into the form region; valid redirects", async () => {
  const page = await site.handle({ method: "GET", url: "/projects/new" });
  assert.match(page.body, /<form id="projects-new-create" method="post" action="\/projects\/new\?\/create" hx-post="\/projects\/new\?\/create" hx-target="this" hx-swap="outerMorph"/);
  assert.match(page.body, /<label for="projects-new-create-name"[^>]*>Name<\/label><input type="text" id="projects-new-create-name" name="name" required/);
  assert.match(page.body, /maxlength="80"/);
  assert.match(page.body, /<textarea id="projects-new-create-description" name="description" aria-describedby="projects-new-create-description-hint"/);
  assert.match(page.body, /<option value="draft" selected>Draft<\/option><option value="active">Active<\/option>/);
  save("r2-form", page.body, false);

  const bad = await site.handle({ method: "POST", url: "/projects/new?/create", headers: hx("form#projects-new-create"), body: { name: "", description: "x".repeat(501), status: "nope" } });
  assert.equal(bad.status, 422);
  assert.match(bad.body, /^<form id="projects-new-create"/, "the 422 is the form region alone");
  assert.match(bad.body, /name="name" required aria-invalid="true" aria-describedby="projects-new-create-name-error"/);
  assert.match(bad.body, /<p id="projects-new-create-name-error"[^>]*>Required<\/p>/);
  assert.match(bad.body, /aria-describedby="projects-new-create-description-hint projects-new-create-description-error"/);
  assert.match(bad.body, /At most 500 characters/);
  assert.match(bad.body, /Choose one of the options/);
  save("r2-invalid", bad.body, true);

  const badPlain = await site.handle({ method: "POST", url: "/projects/new?/create", body: { name: "", status: "draft" } });
  assert.equal(badPlain.status, 422);
  assert.match(badPlain.body, /^<!DOCTYPE html>/, "without htmx the 422 is the whole page");
  assert.match(badPlain.body, /projects-new-create-name-error/);
  save("r2-invalid-nojs", badPlain.body, false);

  const taken = await site.handle({ method: "POST", url: "/projects/new?/create", headers: hx(), body: { name: "Apollo", status: "draft" } });
  assert.equal(taken.status, 422);
  assert.match(taken.body, /value="Apollo"/, "submitted values are kept");
  assert.match(taken.body, /A project with this name exists/);

  const ok = await site.handle({ method: "POST", url: "/projects/new?/create", headers: hx(), body: { name: "Cassini", status: "active" } });
  assert.equal(ok.status, 204);
  assert.equal(JSON.parse(ok.headers["hx-location"]!).path, "/projects/3");
  const okPlain = await site.handle({ method: "POST", url: "/projects/new?/create", body: { name: "Deimos", status: "draft" } });
  assert.equal(okPlain.status, 303);
  assert.equal(okPlain.headers.location, "/projects/4");
});

test("R3: detail; delete opens a native dialog; the status region polls until the job ends", async () => {
  const page = await site.handle({ method: "GET", url: "/projects/1" });
  assert.match(page.body, /<button type="button" class="[^"]*" command="show-modal" commandfor="projects-id-delete-dialog">Delete<\/button><dialog id="projects-id-delete-dialog" closedby="any" aria-labelledby="projects-id-delete-dialog-title"/);
  assert.match(page.body, /<form method="post" action="\/projects\/1\?\/delete" hx-post="\/projects\/1\?\/delete"/);
  assert.match(page.body, /<button type="button" command="close" commandfor="projects-id-delete-dialog"/);
  assert.match(page.body, /<div id="projects-id-status" role="status" hx-get="\/projects\/1" hx-trigger="every 2s" hx-target="this" hx-swap="outerHTML">/);
  save("r3-detail", page.body, false);

  const tick = await site.handle({ method: "GET", url: "/projects/1", headers: hx("div#projects-id-status") });
  assert.match(tick.body, /^<div id="projects-id-status" role="status" hx-get=/, "a poll answers the region alone, still polling");
  save("r3-status-running", tick.body, true);

  db.setJob(1, { state: "done", progress: 100 });
  const last = await site.handle({ method: "GET", url: "/projects/1", headers: hx("div#projects-id-status") });
  assert.match(last.body, /^<div id="projects-id-status" role="status"><span/, "the finished render carries no trigger: polling stops");
  assert.ok(!last.body.includes("hx-trigger"));
  save("r3-status-done", last.body, true);

  const gone = await site.handle({ method: "GET", url: "/projects/99", headers: hx("div#projects-id-status") });
  assert.equal(gone.body, '<div id="projects-id-status" role="status"></div>', "a missing row answers the terminal shell");
  assert.equal((await site.handle({ method: "GET", url: "/projects/99" })).status, 404);
  assert.equal((await site.handle({ method: "GET", url: "/projects/abc" })).status, 404);

  const del = await site.handle({ method: "POST", url: "/projects/1?/delete", headers: hx() });
  assert.equal(del.status, 204);
  assert.equal(JSON.parse(del.headers["hx-location"]!).path, "/projects");
  assert.equal((await site.handle({ method: "GET", url: "/projects/1" })).status, 404);
});

test("every answer was written to out/", () => assert.equal(n, 9));

