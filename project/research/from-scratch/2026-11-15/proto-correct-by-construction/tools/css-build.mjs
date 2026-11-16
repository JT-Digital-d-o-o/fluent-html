// Builds the stylesheet from the theme plus the generated @source inline file, with stock Tailwind,
// and confirms that every class in the file got a rule.
//   node tools/css-build.mjs <theme.css> <classes.css>
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
const [themePath, classesPath] = process.argv.slice(2);
const require = createRequire(resolve(process.env.TAILWIND_FROM ?? process.cwd(), "noop.js"));
const twModule = await import(require.resolve("tailwindcss"));
const compile = twModule.compile ?? twModule.default.compile;
const twDir = dirname(require.resolve("tailwindcss/package.json"));
const classes = readFileSync(classesPath, "utf8");
const compiler = await compile(readFileSync(themePath, "utf8") + "\n" + classes, {
  base: dirname(resolve(themePath)),
  loadStylesheet: async (id, base) => {
    const path = id === "tailwindcss" ? join(twDir, "index.css") : id.startsWith("tailwindcss/") ? join(twDir, id.slice(12) + (id.endsWith(".css") ? "" : ".css")) : resolve(base, id);
    return { path, base: dirname(path), content: readFileSync(path, "utf8") };
  },
});
const css = compiler.build([]);
const wanted = [...classes.matchAll(/@source inline\("(.*)"\);/g)].map((m) => m[1].replace(/\\(.)/g, "$1"));
const selector = (c) => "." + c.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
const missing = wanted.filter((c) => !css.includes(selector(c)));
console.log(`${wanted.length} classes in ${classesPath}, ${wanted.length - missing.length} have a rule in the built stylesheet (${css.length} B)${missing.length ? ": missing " + missing.join(" ") : ""}`);
process.exit(missing.length ? 1 : 0);
