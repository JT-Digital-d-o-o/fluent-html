import { section, page, part, action, routes, handlers } from "../../strict-tags/lib/index.ts";
const r = routes("/x", { list: page("/"), rows: part("rows", "/rows"), del: action("/del") });
const Maybe = (specimen: boolean) => section(!specimen && r.rows().root, "x");
const app = handlers(r, { list: () => null as never, rows: () => Maybe(true), del: ({ redirect }) => redirect(r.list()) });
try { console.log(await app("rows")); } catch (e) { console.log("runtime: " + (e as Error).message); }
