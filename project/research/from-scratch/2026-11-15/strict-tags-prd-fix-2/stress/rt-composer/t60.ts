import { page, action, ref, handlers, el, layout, a, button, form, field } from "./lib.ts";
declare const S: { parse(x: unknown): { name: string; note: string } };
const d60 = page("/x60", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "search", owns: ["q"] }, p1: { reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] }, p2: { reason: "defer" }, a0: action(), a1: action(S), a2: action() });
const r60 = ref(d60);
handlers(d60, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, form(self.p0.search().form, field(self.p0.search().input)), a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), await parts.p2(), button(r60.a0(), "Go"), forms.a1.errors.name, button(r60.a1(), "Go"), button(r60.a2(), "Go")),
  parts: { p0: async ({ input }) => el("p0", input.q, input.sort), p1: { load: async () => ({ state: "running" as const, view: el("p1") }), stalled: () => el("p1") }, p2: () => el("p2") },
  actions: { a0: async ({ redirect, self }) => redirect(self()), a1: async ({ body, redirect, invalid, self }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(self())), a2: async ({ redirect, self }) => redirect(self()) },
});
const d125 = page("/x125", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "search", owns: ["q"] }, p1: { reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] }, a0: action(), a1: action(S) });
const r125 = ref(d125);
handlers(d125, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, form(self.p0.search().form, field(self.p0.search().input)), a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), button(r125.a0(), "Go"), forms.a1.errors.name, button(r125.a1(), "Go")),
  parts: { p0: async ({ input }) => el("p0", input.q, input.sort), p1: { load: async () => ({ state: "running" as const, view: el("p1") }), stalled: () => el("p1") } },
  actions: { a0: async ({ redirect, self }) => redirect(self()), a1: async ({ body, redirect, invalid, self }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(self())) },
});
