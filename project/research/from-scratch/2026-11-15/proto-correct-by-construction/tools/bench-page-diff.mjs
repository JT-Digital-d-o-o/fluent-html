// The bench page against fluent-html 8's expected output, with the design's stated differences removed.
//   node tools/bench-page-diff.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { build, render } from "../bench/strict-tags.mjs";

const html = render(build());
writeFileSync(new URL("../out/bench-page.fragment.html", import.meta.url), html + "\n");
writeFileSync(
  new URL("../out/bench-page.document.html", import.meta.url),
  `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Bench page</title></head><body>${html}</body></html>\n`,
);
const expected = readFileSync(new URL("../../fixtures/bench/expected.fh8.html", import.meta.url), "utf8");
const squash = (s) => s.replace(/>\s+</g, "><").trim();
const mine = squash(html).replaceAll(' type="button"', "").replaceAll(' href="#"', "");
console.log(`strict-tags ${html.length} B, expected ${expected.length} B, equal once type="button" (12) and href="#" (7) are removed: ${mine === squash(expected)}`);
