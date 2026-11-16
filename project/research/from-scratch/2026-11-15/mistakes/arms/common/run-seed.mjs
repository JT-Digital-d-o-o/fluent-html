// Runs one seed: imports it, calls its default export, prints {ok, answers:[{status, html}]} or {ok:false, error}.
//   node arms/common/run-seed.mjs <seed.ts>
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
const norm = (a) => (typeof a === "string" ? { status: 200, html: a } : { status: a.status ?? 200, html: String(a.html ?? a.body ?? ""), navigates: a.navigates === true });
try {
  const mod = await import(pathToFileURL(resolve(process.argv[2])).href);
  let out = await mod.default();
  out = Array.isArray(out) ? await Promise.all(out) : [out];
  console.log(JSON.stringify({ ok: true, answers: out.map(norm) }));
} catch (e) {
  console.log(JSON.stringify({ ok: false, error: String(e?.message ?? e).split("\n")[0].slice(0, 300) }));
}
