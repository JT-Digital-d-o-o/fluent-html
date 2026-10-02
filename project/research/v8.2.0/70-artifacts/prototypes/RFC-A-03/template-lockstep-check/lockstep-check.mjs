// Template-side lockstep check (proposed for projects-template tests/unit): the htmx build the
// template serves must be one the installed fluent-html's executed oracle ran against.
import { readFileSync } from "node:fs";
const ORG = process.env.ORG_ROOT;
if (!ORG) throw new Error("set ORG_ROOT to the directory holding the repo checkouts");
const tpl = JSON.parse(readFileSync(`${ORG}/projects-template/templates/full-stack/package.json`, "utf8"));
const libPath = process.argv[2] ?? `${ORG}/projects-template/templates/full-stack/node_modules/fluent-html/package.json`;
const lib = JSON.parse(readFileSync(libPath, "utf8"));
const served = tpl.devDependencies?.["htmx.org"] ?? tpl.dependencies?.["htmx.org"];
const oracled = Object.values(lib.devDependencies ?? {}).flatMap((v) => (v.startsWith("npm:htmx.org@") ? [v.slice("npm:htmx.org@".length)] : [])).concat(lib.devDependencies?.["htmx.org"] ?? []);
if (!oracled.includes(served)) {
  console.error(`template serves htmx.org@${served}, but fluent-html@${lib.version} ran its grammar oracle against ${oracled.map((v) => "htmx.org@" + v).join(", ")} only; bump the lib's htmx-served alias (and run test:grammar) before bumping the template`);
  process.exit(1);
}
console.log(`ok: htmx.org@${served} is in fluent-html@${lib.version}'s oracle matrix (${oracled.join(", ")})`);
