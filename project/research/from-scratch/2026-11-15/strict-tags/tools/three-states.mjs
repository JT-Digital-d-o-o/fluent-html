// The shape that failed Lean Tags on K4 in the bake-off: one document showing one form in three
// states. Without a scope the document does not render (development); with one, ids are unique.
//   node tools/three-states.mjs
import { writeFileSync } from "node:fs";
import { cls, doc, h2, section } from "../lib/index.ts";
import { ProjectForm } from "../screens/views/projects.form.view.ts";

const states = [
  ["Initial", {}],
  ["Invalid", { values: { name: "" }, errors: { name: "Name is required" } }],
  ["Saved", { values: { name: "Atlas" } }],
];
const page = (scoped) =>
  doc({ title: "Three states" }, states.map(([title, state]) => section(cls("mt-8"), h2(title), ProjectForm(scoped ? { ...state, scope: title } : state))));
try {
  page(false);
  console.log("unscoped: rendered (unexpected)");
} catch (e) {
  console.log("unscoped: " + e.message);
}
const html = page(true).h;
writeFileSync(new URL("../out/three-states.html", import.meta.url), html + "\n");
const ids = [...html.matchAll(/\sid="([^"]*)"/g)].map((m) => m[1]);
console.log(`scoped: ${ids.length} ids, ${new Set(ids).size} distinct`);
