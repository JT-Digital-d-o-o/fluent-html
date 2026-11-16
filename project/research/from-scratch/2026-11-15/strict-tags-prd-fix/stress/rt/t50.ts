import { page, action, ref, handlers, el, layout, a, button, form, field } from "./lib.ts";
declare const S: { parse(x: unknown): { name: string; note: string } };
const d50 = page("/x50", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] }, p1: { reason: "defer" }, p2: { reason: "search", owns: ["q"] }, a0: action(), a1: action(S), a2: action() });
const r50 = ref(d50);
handlers(d50, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), await parts.p2(), button(r50.a0(), "Go"), forms.a1.errors.name, button(r50.a1(), "Go"), button(r50.a2(), "Go")),
  parts: { p0: { load: async () => ({ state: "running" as const, view: el("p0") }), stalled: () => el("p0") }, p1: () => el("p1"), p2: async ({ input }) => el("p2", input.q, input.sort) },
  actions: { a0: async ({ redirect }) => redirect(r50()), a1: async ({ body, redirect, invalid }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(r50())), a2: async ({ redirect }) => redirect(r50()) },
});
const d115 = page("/x115", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] }, p1: { reason: "defer" }, a0: action(), a1: action(S) });
const r115 = ref(d115);
handlers(d115, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), button(r115.a0(), "Go"), forms.a1.errors.name, button(r115.a1(), "Go")),
  parts: { p0: { load: async () => ({ state: "running" as const, view: el("p0") }), stalled: () => el("p0") }, p1: () => el("p1") },
  actions: { a0: async ({ redirect }) => redirect(r115()), a1: async ({ body, redirect, invalid }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(r115())) },
});
