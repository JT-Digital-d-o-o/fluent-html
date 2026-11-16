// The detail screen (R3) body in six spellings, same routes, wires and components, to compare
// the markup syntax alone. Characters with and without whitespace; tokens = characters / 4.
//   node tools/count-alt.mjs
import { readFileSync } from "node:fs";
const here = new URL("..", import.meta.url);
const body = (s) => s.replace(/^import [\s\S]*?;\n/gm, "").trim();
const read = (p) => body(readFileSync(new URL(p, here), "utf8"));
const arms = [
  ["fluent-html 8 (typed chain)", "screens/fh8/views/projects.detail.view.ts"],
  ["JSX", "probes/alt-syntax/detail.jsx.txt"],
  ["html tagged template", "probes/alt-syntax/detail.html-template.txt"],
  ["hiccup arrays", "probes/alt-syntax/detail.hiccup.txt"],
  ["tag({ class: \"…\" }, …)", "probes/alt-syntax/detail.props-object.txt"],
  ["Lean Tags: tag(tw`…`, …)", "screens/lt/views/projects.detail.view.ts"],
  ["backtick tags: tag`…`(…)", "attic/screens-backtick/views/projects.detail.view.ts"],
];
const base = read(arms[0][1]);
for (const [name, path] of arms) {
  const s = read(path);
  const dense = s.replace(/\s+/g, "").length;
  console.log(`${name.padEnd(30)} ${String(s.length).padStart(5)} ch ${String(Math.round(s.length / 4)).padStart(4)} tok  x${(s.length / base.length).toFixed(2)} | no whitespace ${String(dense).padStart(5)} ch  x${(dense / base.replace(/\s+/g, "").length).toFixed(2)}`);
}
