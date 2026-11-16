// Writes the idiomatic fluent-html 9 bench page as a fragment and as a minimal document.
import { writeFileSync } from "node:fs";
const m = await import("./fh9-idiomatic.mjs");
const html = m.render(m.build());
writeFileSync("out/bench-page.fh9.fragment.html", html);
writeFileSync("out/bench-page.fh9.document.html", `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>Bench page</title>\n</head>\n<body>\n${html}\n</body>\n</html>\n`);
console.log(html.length, "chars");
