import { page, action, ref, handlers, el, layout, a, button, form, field } from "./lib.ts";
declare const S: { parse(x: unknown): { name: string; note: string } };
const d51 = page("/x51", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "search", owns: ["q"] }, p1: { reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] }, p2: { reason: "defer" }, a0: action(), a1: action(S), a2: action() });
const r51 = ref(d51);
handlers(d51, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, form(self.p0.search().form, field(self.p0.search().input)), a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), await parts.p2(), button(r51.a0(), "Go"), forms.a1.errors.name, button(r51.a1(), "Go"), button(r51.a2(), "Go")),
  parts: { p0: async ({ input }) => el("p0", input.q, input.sort), p1: { load: async () => ({ state: "running" as const, view: el("p1") }), stalled: () => el("p1") }, p2: () => el("p2") },
  actions: { a0: async ({ redirect }) => redirect(r51()), a1: async ({ body, redirect, invalid }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(r51())), a2: async ({ redirect }) => redirect(r51()) },
});
const d116 = page("/x116", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "search", owns: ["q"] }, p1: { reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] }, a0: action(), a1: action(S) });
const r116 = ref(d116);
handlers(d116, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, form(self.p0.search().form, field(self.p0.search().input)), a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), button(r116.a0(), "Go"), forms.a1.errors.name, button(r116.a1(), "Go")),
  parts: { p0: async ({ input }) => el("p0", input.q, input.sort), p1: { load: async () => ({ state: "running" as const, view: el("p1") }), stalled: () => el("p1") } },
  actions: { a0: async ({ redirect }) => redirect(r116()), a1: async ({ body, redirect, invalid }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(r116())) },
});
