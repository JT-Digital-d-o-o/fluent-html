import { page, action, ref, handlers, el, layout, a, button, form, field } from "./lib.ts";
declare const S: { parse(x: unknown): { name: string; note: string } };
const d3 = page("/x3", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "search", owns: ["q"] }, p1: { reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] }, p2: { reason: "defer" }, a0: action(), a1: action(S), a2: action() });
const r3 = ref(d3);
handlers(d3, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, form(self.p0.search().form, field(self.p0.search().input)), a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), await parts.p2(), button(r3.a0(), "Go"), forms.a1.errors.name, button(r3.a1(), "Go"), button(r3.a2(), "Go")),
  parts: { p0: async ({ input }) => el("p0", input.q, input.sort), p1: { load: async () => ({ state: "running" as const, view: el("p1") }), stalled: () => el("p1") }, p2: () => el("p2") },
  actions: { a0: async ({ redirect }) => redirect(r3()), a1: async ({ body, redirect, invalid }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(r3())), a2: async ({ redirect }) => redirect(r3()) },
});
const d68 = page("/x68", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "search", owns: ["q"] }, p1: { reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] }, p2: { reason: "defer" }, a0: action(), a1: action(S), a2: action() });
const r68 = ref(d68);
handlers(d68, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, form(self.p0.search().form, field(self.p0.search().input)), a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), await parts.p2(), button(r68.a0(), "Go"), forms.a1.errors.name, button(r68.a1(), "Go"), button(r68.a2(), "Go")),
  parts: { p0: async ({ input }) => el("p0", input.q, input.sort), p1: { load: async () => ({ state: "running" as const, view: el("p1") }), stalled: () => el("p1") }, p2: () => el("p2") },
  actions: { a0: async ({ redirect }) => redirect(r68()), a1: async ({ body, redirect, invalid }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(r68())), a2: async ({ redirect }) => redirect(r68()) },
});
const d133 = page("/x133", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "search", owns: ["q"] }, p1: { reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] }, a0: action(), a1: action(S) });
const r133 = ref(d133);
handlers(d133, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, form(self.p0.search().form, field(self.p0.search().input)), a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), button(r133.a0(), "Go"), forms.a1.errors.name, button(r133.a1(), "Go")),
  parts: { p0: async ({ input }) => el("p0", input.q, input.sort), p1: { load: async () => ({ state: "running" as const, view: el("p1") }), stalled: () => el("p1") } },
  actions: { a0: async ({ redirect }) => redirect(r133()), a1: async ({ body, redirect, invalid }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(r133())) },
});
