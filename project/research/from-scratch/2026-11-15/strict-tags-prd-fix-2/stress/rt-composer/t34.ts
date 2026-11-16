import { page, action, ref, handlers, el, layout, a, button, form, field } from "./lib.ts";
declare const S: { parse(x: unknown): { name: string; note: string } };
const d34 = page("/x34", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] }, p1: { reason: "defer" }, p2: { reason: "search", owns: ["q"] }, a0: action(), a1: action(S), a2: action() });
const r34 = ref(d34);
handlers(d34, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), await parts.p2(), button(r34.a0(), "Go"), forms.a1.errors.name, button(r34.a1(), "Go"), button(r34.a2(), "Go")),
  parts: { p0: { load: async () => ({ state: "running" as const, view: el("p0") }), stalled: () => el("p0") }, p1: () => el("p1"), p2: async ({ input }) => el("p2", input.q, input.sort) },
  actions: { a0: async ({ redirect, self }) => redirect(self()), a1: async ({ body, redirect, invalid, self }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(self())), a2: async ({ redirect, self }) => redirect(self()) },
});
const d99 = page("/x99", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] }, p1: { reason: "defer" }, p2: { reason: "search", owns: ["q"] }, a0: action(), a1: action(S) });
const r99 = ref(d99);
handlers(d99, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), await parts.p2(), button(r99.a0(), "Go"), forms.a1.errors.name, button(r99.a1(), "Go")),
  parts: { p0: { load: async () => ({ state: "running" as const, view: el("p0") }), stalled: () => el("p0") }, p1: () => el("p1"), p2: async ({ input }) => el("p2", input.q, input.sort) },
  actions: { a0: async ({ redirect, self }) => redirect(self()), a1: async ({ body, redirect, invalid, self }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(self())) },
});
