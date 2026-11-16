// Writes the prototype's bench page and reports how it differs from fluent-html 8's.
import { readFileSync, writeFileSync } from "node:fs";
import { build, render } from "../out/bench-page.mjs";
const out = render(build());
const expected = readFileSync(new URL("../../fixtures/bench/expected.fh8.html", import.meta.url), "utf8");
const squash = (s) => s.replace(/>\s+</g, "><").trim();
const moved = (s) => s.replace(/ type="button"/g, "").replace(/(<button)( class="[^"]*")( hx-post="[^"]*" hx-swap="none")/g, "$1$2$3");
writeFileSync(new URL("../out/bench-page.fragment.html", import.meta.url), out.replace(/></g, ">\n<") + "\n");
writeFileSync(new URL("../out/bench-page.document.html", import.meta.url), `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Bench page</title>\n</head>\n<body>\n${out.replace(/></g, ">\n<")}\n</body>\n</html>\n`);
console.log("bytes", Buffer.byteLength(out), "expected", Buffer.byteLength(expected));
console.log("same ignoring whitespace:", squash(out) === squash(expected));
console.log("same ignoring whitespace and the button type attribute:", squash(moved(out)) === squash(expected));
console.log("button types:", (out.match(/ type="button"/g) ?? []).length);
