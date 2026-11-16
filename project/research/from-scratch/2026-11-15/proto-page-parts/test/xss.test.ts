// Escaping on the XSS fixtures. Two layers:
//   1. the shared fixture set (../fixtures/xss) through xss/adapter.mjs: zero escapes, every benign case round-trips;
//   2. the sinks only parts have (a title, a List key, a search box's value and URL, a re-rendered form, a confirm
//      dialog, Link params and query): every hostile fixture payload must leave the document's shape exactly as a
//      benign value does, and reach no script sink.
// Run: node --test test/xss.test.ts
import { test } from "node:test";
import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parse } from "parse5";
import { CASES } from "../../fixtures/xss/cases.mjs";
import { page, Page, Link, Search, List, invalid, redirect, Type, Div, P, app } from "../kit/index.ts";

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

test("fixture set: 0 escapes, every benign case round-trips, only hx-confirm unsupported", () => {
  let raw: string;
  try {
    raw = execFileSync(process.execPath, [here("../../fixtures/xss/check.mjs"), here("../xss/adapter.mjs"), "--json"], { encoding: "utf8" });
  } catch (e) {
    raw = (e as { stdout: string }).stdout;
  }
  const r = JSON.parse(raw) as { k3Escapes: number; results: { id: string; ctx: string; verdict: string; benign: boolean }[] };
  assert.equal(r.k3Escapes, 0, r.results.filter((x) => x.verdict.startsWith("escape")).map((x) => x.id).join(", "));
  assert.deepEqual(r.results.filter((x) => x.verdict === "broken").map((x) => x.id), []);
  assert.deepEqual([...new Set(r.results.filter((x) => x.verdict === "unsupported").map((x) => x.ctx))], ["htmx-confirm"]);
  assert.equal(r.results.length, CASES.length);
});

// ---------- part sinks ----------

const HOSTILE: string[] = [
  ...new Set(
    (CASES as { ctx: string; payload: unknown; benign: boolean }[])
      .filter((c) => !c.benign && typeof c.payload === "string" && ["text", "attr-title", "url-href", "htmx-get", "htmx-vals"].includes(c.ctx))
      .map((c) => c.payload as string),
  ),
];

let payload = "x";
const list = page("/p", { query: { q: Type.Optional(Type.String()) } });
const rows = list.region("rows", { load: () => [{ id: payload, name: payload }] });
const doc = page("/d/:slug", { params: { slug: Type.String() } });
const remove = doc.action("remove", { confirm: { title: payload, body: payload, confirm: payload, cancel: payload }, run: () => redirect(list) });
const edit = doc.form("edit", {
  schema: Type.Object({ name: Type.String(), note: Type.Optional(Type.String()) }),
  submit: () => invalid({ note: payload }),
});
const strict = doc.form("strict", { schema: Type.Object({ n: Type.Integer() }), submit: () => redirect(list) });
list.view(({ query }) =>
  Page({ title: payload, description: payload },
    Search({ into: rows, name: "q", label: payload, placeholder: payload }),
    Link({ to: doc, params: { slug: payload }, query: {} }, payload),
    Link({ to: list, query: { q: query.q ?? payload } }, payload),
    rows.show(),
  ),
);
rows.view(({ data }) => List({ items: data, key: (r) => r.id, row: (r) => P(r.name), empty: P("none") }));
doc.view(({ params }) => Page({ title: params.slug }, Div(params.slug), remove.button({}, payload), edit.show({ name: payload, note: payload })));
edit.view((f) => [f.field("name", payload, { hint: payload, placeholder: payload }), f.field("note", payload), f.submit(payload)]);
strict.view((f) => [f.field("n", payload), f.submit(payload)]);
const site = app({ list, doc });

type Node = { nodeName: string; tagName?: string; attrs?: { name: string; value: string }[]; childNodes?: Node[]; content?: Node };
function shape(html: string): { tags: string[]; sinks: string[] } {
  const tags: string[] = [];
  const sinks: string[] = [];
  const walk = (n: Node) => {
    for (const c of n.childNodes ?? []) {
      if (c.tagName) {
        const names = (c.attrs ?? []).map((a) => a.name).sort();
        tags.push(c.tagName + "[" + names.join(",") + "]");
        if (c.tagName === "script" && !(c.attrs ?? []).some((a) => a.name === "src")) sinks.push("inline script");
        for (const a of c.attrs ?? []) {
          if (/^on|^(data-)?hx-on/.test(a.name)) sinks.push(`handler ${a.name}`);
          if (/^(href|src|action|formaction)$/.test(a.name) && /^\s*(javascript|vbscript|data):/i.test(a.value.replace(/[\t\n\r]/g, ""))) sinks.push(`${a.name}=${a.value}`);
          if (/^(data-)?hx-(get|post|put|patch|delete|confirm|vals|headers)$/.test(a.name) && /^(js|javascript):/.test(a.value)) sinks.push(`${a.name}=${a.value}`);
        }
        walk(c);
        if (c.content) walk(c.content);
      }
    }
  };
  walk(parse(html) as unknown as Node);
  return { tags, sinks };
}

const requests: [string, () => Promise<string>][] = [
  ["page: title, description, search label/placeholder, links, List key and row", async () => (await site.handle({ method: "GET", url: "/p" })).body],
  ["search: the query echoed into the box and its URL", async () => (await site.handle({ method: "GET", url: "/p?q=" + encodeURIComponent(payload) })).body],
  ["region alone", async () => (await site.handle({ method: "GET", url: "/p?q=" + encodeURIComponent(payload), headers: { "hx-request": "true", "hx-target": "div#p-rows" } })).body],
  ["detail: param in text, action confirm dialog, prefilled form", async () => (await site.handle({ method: "GET", url: "/d/" + encodeURIComponent(payload) })).body],
  ["form 422 with htmx: submitted values and a server message echoed", async () =>
    (await site.handle({ method: "POST", url: "/d/s?/edit", headers: { "hx-request": "true" }, body: { name: payload, note: payload } })).body],
  ["form 422 without htmx: the whole page", async () => (await site.handle({ method: "POST", url: "/d/s?/edit", body: { name: payload, note: payload } })).body],
  ["form 422 from the schema: the rejected value echoed", async () =>
    (await site.handle({ method: "POST", url: "/d/s?/strict", headers: { "hx-request": "true" }, body: { n: payload } })).body],
];

for (const [label, run] of requests) {
  test(`part sink, ${label}: every hostile payload keeps the benign shape`, async () => {
    payload = "x";
    const benign = shape(await run());
    assert.deepEqual(benign.sinks, []);
    for (const p of HOSTILE) {
      payload = p;
      const got = shape(await run());
      assert.deepEqual(got.sinks, [], `payload ${JSON.stringify(p)}`);
      assert.deepEqual(got.tags, benign.tags, `payload ${JSON.stringify(p)} changed the document's shape`);
    }
    payload = "x";
  });
}

test("part sinks covered", () => assert.ok(HOSTILE.length >= 30, `${HOSTILE.length} distinct hostile payloads`));
