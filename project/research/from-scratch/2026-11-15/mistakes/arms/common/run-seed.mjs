// Runs one seed: imports it, calls its default export, prints {ok, answers:[{status, html}]} or {ok:false, error}.
// An answer may also say how the client swaps it: `navigates` (a full navigation) or `target` (a selector the library
// named in a header, such as HX-Location's), for oracles that need it (HX-8).
//   node arms/common/run-seed.mjs <seed.ts>
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
const norm = (a) => (typeof a === "string" ? { status: 200, html: a } : { status: a.status ?? 200, html: String(a.html ?? a.body ?? ""), navigates: a.navigates === true, ...(typeof a.target === "string" ? { target: a.target } : {}) });
try {
  const mod = await import(pathToFileURL(resolve(process.argv[2])).href);
  let out = await mod.default();
  out = Array.isArray(out) ? await Promise.all(out) : [out];
  console.log(JSON.stringify({ ok: true, answers: out.map(norm) }));
} catch (e) {
  console.log(JSON.stringify({ ok: false, error: String(e?.message ?? e).split("\n")[0].slice(0, 300) }));
}
