// Confirms the prototype's bench page equals expected.fh8.html except for type="button" on
// each <button> and the newlines fluent-html 8 puts between siblings. Writes the page for html-validate.
//   node tools/bench-page-diff.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { build, render } from "../bench/lt-arm.mjs";
const here = new URL(".", import.meta.url);
const expected = readFileSync(new URL("../../fixtures/bench/expected.fh8.html", here), "utf8");
const got = render(build());
const squash = (s) => s.replace(/>\s+</g, "><").trim();
const buttons = (got.match(/ type="button"/g) ?? []).length;
console.log("buttons with type:", buttons);
console.log("equal after removing type=\"button\" and sibling newlines:", squash(got.replaceAll(' type="button"', "")) === squash(expected));
writeFileSync(new URL("../out/bench-page.fragment.html", here), got + "\n");
writeFileSync(new URL("../out/bench-page.document.html", here), `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Our Store</title></head><body>${got}</body></html>\n`);
