// Writes the bench page to out/ for html-validate and compares it with fluent-html 8's expected output.
// Run: node bench/write-output.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { build, render } from "./arm.mjs";

const out = render(build());
const expected = readFileSync(new URL("../../fixtures/bench/expected.fh8.html", import.meta.url), "utf8");
const squash = (s) => s.replace(/>\s+</g, "><").trim();
const norm = (s) => squash(s).replaceAll(' type="button"', "");
console.log("bytes", Buffer.byteLength(out), "expected", Buffer.byteLength(expected));
console.log('same as fluent-html 8 ignoring whitespace and the default type="button":', norm(out) === norm(expected));
writeFileSync(new URL("../out/bench-page.fragment.html", import.meta.url), out);
writeFileSync(
  new URL("../out/bench-page.document.html", import.meta.url),
  '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Bench</title></head><body>' + out + "</body></html>",
);
