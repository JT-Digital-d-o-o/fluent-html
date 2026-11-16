// Renders the three screens through the prototype dispatcher and writes the HTML to out/.
import { writeFileSync } from "node:fs";
import { dispatch } from "../src/hx.ts";
import ctl from "./projects.controller.ts";

const doc = (title, body) => `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<title>${title}</title>\n</head>\n<body>\n<main id="main">\n${body}\n</main>\n</body>\n</html>\n`;
const out = (name, a) => {
  const file = new URL(`../out/${name}.html`, import.meta.url);
  writeFileSync(file, a.title === undefined ? doc("Fragment", a.html ?? "") : doc(a.title.replace(/[<&]/g, ""), a.html));
  console.log(String(a.status).padEnd(4), name.padEnd(22), a.location ?? `${a.html.length} chars`);
};

out("r1-list", await dispatch(ctl, "list"));
out("r1-rows-search", await dispatch(ctl, "rows", { query: { q: "atlas" } }));
out("r1-rows-empty", await dispatch(ctl, "rows", { query: { q: "zzz" } }));
out("r2-new", await dispatch(ctl, "new"));
out("r2-create-invalid", await dispatch(ctl, "create", { body: { name: "ab", ownerEmail: "nope", status: "active", notes: "<b>hi</b>" } }));
out("r2-create-taken", await dispatch(ctl, "create", { body: { name: "Billing & invoices", ownerEmail: "a@b.co", status: "paused" } }));
const ok = await dispatch(ctl, "create", { body: { name: "Gamma", ownerEmail: "a@b.co", status: "paused" } });
console.log(String(ok.status).padEnd(4), "r2-create-valid".padEnd(22), ok.location);
out("r3-detail-running", await dispatch(ctl, "detail", { params: { id: 1 } }));
out("r3-status-done", await dispatch(ctl, "status", { params: { id: 1 } }));
