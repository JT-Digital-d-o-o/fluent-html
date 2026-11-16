import { page, action, ref, handlers, el, layout, a, button, form, field } from "./lib.ts";
declare const S: { parse(x: unknown): { name: string; note: string } };
const d24 = page("/x24", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] }, p1: { reason: "defer" }, p2: { reason: "search", owns: ["q"] }, a0: action(), a1: action(S), a2: action() });
const r24 = ref(d24);
handlers(d24, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), await parts.p2(), button(r24.a0(), "Go"), forms.a1.errors.name, button(r24.a1(), "Go"), button(r24.a2(), "Go")),
  parts: { p0: { load: async () => ({ state: "running" as const, view: el("p0") }), stalled: () => el("p0") }, p1: () => el("p1"), p2: async ({ input }) => el("p2", input.q, input.sort) },
  actions: { a0: async ({ redirect }) => redirect(r24()), a1: async ({ body, redirect, invalid }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(r24())), a2: async ({ redirect }) => redirect(r24()) },
});
const d89 = page("/x89", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] }, p1: { reason: "defer" }, p2: { reason: "search", owns: ["q"] }, a0: action(), a1: action(S) });
const r89 = ref(d89);
handlers(d89, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), await parts.p2(), button(r89.a0(), "Go"), forms.a1.errors.name, button(r89.a1(), "Go")),
  parts: { p0: { load: async () => ({ state: "running" as const, view: el("p0") }), stalled: () => el("p0") }, p1: () => el("p1"), p2: async ({ input }) => el("p2", input.q, input.sort) },
  actions: { a0: async ({ redirect }) => redirect(r89()), a1: async ({ body, redirect, invalid }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(r89())) },
});
