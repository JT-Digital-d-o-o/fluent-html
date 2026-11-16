// Every class the screens render has a rule in the built CSS: node tools/css-coverage.mjs <app.css> <out.html>...
import { readFileSync } from "node:fs";
const [cssPath, ...files] = process.argv.slice(2);
const css = readFileSync(cssPath, "utf8");
const escape = (c) => c.replace(/[^a-zA-Z0-9_-]/g, (ch) => "\\" + ch);
const seen = new Set();
for (const f of files) for (const m of readFileSync(f, "utf8").matchAll(/ class="([^"]*)"/g)) for (const c of m[1].split(/\s+/)) if (c) seen.add(c);
const missing = [...seen].filter((c) => !css.includes("." + escape(c)));
console.log(`${seen.size} distinct classes in ${files.length} file(s), ${missing.length} without a rule${missing.length ? ": " + missing.join(" ") : ""}`);
process.exit(missing.length ? 1 : 0);
