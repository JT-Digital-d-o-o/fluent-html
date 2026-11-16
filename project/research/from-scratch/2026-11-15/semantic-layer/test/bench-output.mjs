// Compares the kit's bench page with fluent-html 8's expected output and writes it for html-validate.
// Run: node test/bench-output.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { build, render } from "../bench-arm.mjs";

const out = render(build());
const expected = readFileSync(new URL("../../fixtures/bench/expected.fh8.html", import.meta.url), "utf8");
const squash = (s) => s.replace(/>\s+</g, "><").trim();
const norm = (s) => squash(s).replaceAll(' type="button"', "");
const a = norm(out);
const b = norm(expected);

console.log("bytes", Buffer.byteLength(out), "expected", Buffer.byteLength(expected));
console.log("same ignoring whitespace:", squash(out) === squash(expected));
console.log('same ignoring whitespace and the default type="button":', a === b);
if (a !== b) {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  console.log("first difference at", i, "\n kit:", a.slice(Math.max(0, i - 60), i + 120), "\n fh8:", b.slice(Math.max(0, i - 60), i + 120));
}
writeFileSync(new URL("../out/bench-page.fragment.html", import.meta.url), out);
