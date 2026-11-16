// What the spellings that compile render.   node render.ts
import { render } from "../../strict-tags/lib/index.ts";
import * as f from "./forge.ts";
for (const k of ["f9", "f10", "f11", "f12", "f13", "f14", "f15", "f16"] as const) {
  try { const v = f[k](); console.log(k, [v].flat().map((x) => (x ? render(x) : String(x))).join("")); } catch (e) { console.log(k, "throws:", (e as Error).message.slice(0, 90)); }
}
