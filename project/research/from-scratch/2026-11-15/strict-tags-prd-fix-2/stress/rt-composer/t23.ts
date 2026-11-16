import { page, action, ref, handlers, el, layout, a, button, form, field } from "./lib.ts";
declare const S: { parse(x: unknown): { name: string; note: string } };
const d23 = page("/x23", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] }, p1: { reason: "defer" }, p2: { reason: "search", owns: ["q"] }, a0: action(), a1: action(S), a2: action() });
const r23 = ref(d23);
handlers(d23, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), await parts.p2(), button(r23.a0(), "Go"), forms.a1.errors.name, button(r23.a1(), "Go"), button(r23.a2(), "Go")),
  parts: { p0: { load: async () => ({ state: "running" as const, view: el("p0") }), stalled: () => el("p0") }, p1: () => el("p1"), p2: async ({ input }) => el("p2", input.q, input.sort) },
  actions: { a0: async ({ redirect, self }) => redirect(self()), a1: async ({ body, redirect, invalid, self }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(self())), a2: async ({ redirect, self }) => redirect(self()) },
});
const d88 = page("/x88", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] }, p1: { reason: "defer" }, p2: { reason: "search", owns: ["q"] }, a0: action(), a1: action(S) });
const r88 = ref(d88);
handlers(d88, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), await parts.p2(), button(r88.a0(), "Go"), forms.a1.errors.name, button(r88.a1(), "Go")),
  parts: { p0: { load: async () => ({ state: "running" as const, view: el("p0") }), stalled: () => el("p0") }, p1: () => el("p1"), p2: async ({ input }) => el("p2", input.q, input.sort) },
  actions: { a0: async ({ redirect, self }) => redirect(self()), a1: async ({ body, redirect, invalid, self }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(self())) },
});
