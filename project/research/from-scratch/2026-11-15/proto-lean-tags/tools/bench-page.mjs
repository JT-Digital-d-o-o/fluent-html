// Writes the bench page in both arms for html-validate, and checks Lean Tags' page equals
// expected.fh8.html except for type="button" on each <button> and the newlines fh8 puts between siblings.
//   node tools/bench-page.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { build, render } from "../bench/lean-tags.mjs";
const out = new URL("../out/", import.meta.url);
mkdirSync(new URL("fh8/", out), { recursive: true });
const expected = readFileSync(new URL("../../fixtures/bench/expected.fh8.html", import.meta.url), "utf8");
const got = render(build());
const squash = (s) => s.replace(/>\s+</g, "><").trim();
const doc = (body) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Our Store</title></head><body>${body}</body></html>\n`;
console.log('buttons given type="button":', (got.match(/ type="button"/g) ?? []).length);
console.log('equal to expected.fh8.html after removing type="button" and sibling newlines:', squash(got.replaceAll(' type="button"', "")) === squash(expected));
writeFileSync(new URL("bench-page.fragment.html", out), got + "\n");
writeFileSync(new URL("bench-page.document.html", out), doc(got));
writeFileSync(new URL("fh8/bench-page.fragment.html", out), expected.endsWith("\n") ? expected : expected + "\n");
writeFileSync(new URL("fh8/bench-page.document.html", out), doc(expected));
