// Is the Hoisted HTML bench page the same document as fluent-html 8's, apart from the
// declared differences (type="button" on the 12 buttons, whitespace between tags)?
import { readFileSync, writeFileSync } from "node:fs";
import { build, render } from "./hoisted-html.mjs";

const expected = readFileSync(new URL("../../fixtures/bench/expected.fh8.html", import.meta.url), "utf8");
const out = render(build());
writeFileSync(new URL("../out/bench-page.hoisted.html", import.meta.url), out);
const squash = (s) => s.replace(/>\s+</g, "><").trim();
const mine = squash(out).replaceAll(' type="button"', "");
const theirs = squash(expected);
console.log("bytes", Buffer.byteLength(out), "fh8", Buffer.byteLength(expected));
console.log('identical after removing type="button" and inter-tag whitespace:', mine === theirs);
if (mine !== theirs) {
  let i = 0;
  while (mine[i] === theirs[i]) i++;
  console.log("first difference at", i, "\n mine:", mine.slice(Math.max(0, i - 60), i + 80), "\n fh8: ", theirs.slice(Math.max(0, i - 60), i + 80));
}
