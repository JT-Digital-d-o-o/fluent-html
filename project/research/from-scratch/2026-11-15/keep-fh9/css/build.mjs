// Does Tailwind's own scanner find every class the fluent-html 9 screens write, with no extractor
// and no safelist? Builds css/app.css through @tailwindcss/postcss (Tailwind 4.3.3, borrowed from
// a sibling repo's node_modules), then checks each class token of the rendered screens for a rule.
//   node css/build.mjs <dir holding node_modules with @tailwindcss/postcss>
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(resolve(process.argv[2], "package.json"));
const postcss = require("postcss");
const tailwind = require("@tailwindcss/postcss");
const from = resolve("css/app.css");
const t0 = performance.now();
const out = await postcss([tailwind({ base: resolve("css") })]).process(readFileSync(from, "utf8"), { from });
const ms = Math.round(performance.now() - t0);
writeFileSync("out/app.fh9.css", out.css);

const tokens = new Set();
for (const f of readdirSync("out/fh9")) {
  for (const m of readFileSync(`out/fh9/${f}`, "utf8").matchAll(/class="([^"]*)"/g)) {
    for (const t of m[1].replace(/&amp;/g, "&").split(/\s+/)) if (t) tokens.add(t);
  }
}
const esc = (c) => c.replace(/[^a-zA-Z0-9_-]/g, (ch) => "\\" + ch);
const missing = [...tokens].filter((t) => !out.css.includes("." + esc(t)));
console.log(`tailwind build ${ms} ms, ${out.css.length} B; class tokens in rendered screens: ${tokens.size}; without a rule: ${missing.length}`, missing);
