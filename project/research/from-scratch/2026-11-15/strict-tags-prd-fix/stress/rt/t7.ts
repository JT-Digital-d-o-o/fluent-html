import { page, action, ref, handlers, el, layout, a, button, form, field } from "./lib.ts";
declare const S: { parse(x: unknown): { name: string; note: string } };
const d7 = page("/x7", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "defer" }, p1: { reason: "search", owns: ["q"] }, p2: { reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] }, a0: action(), a1: action(S), a2: action() });
const r7 = ref(d7);
handlers(d7, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), await parts.p2(), button(r7.a0(), "Go"), forms.a1.errors.name, button(r7.a1(), "Go"), button(r7.a2(), "Go")),
  parts: { p0: () => el("p0"), p1: async ({ input }) => el("p1", input.q, input.sort), p2: { load: async () => ({ state: "running" as const, view: el("p2") }), stalled: () => el("p2") } },
  actions: { a0: async ({ redirect }) => redirect(r7()), a1: async ({ body, redirect, invalid }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(r7())), a2: async ({ redirect }) => redirect(r7()) },
});
const d72 = page("/x72", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "defer" }, p1: { reason: "search", owns: ["q"] }, p2: { reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] }, a0: action(), a1: action(S), a2: action() });
const r72 = ref(d72);
handlers(d72, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), await parts.p2(), button(r72.a0(), "Go"), forms.a1.errors.name, button(r72.a1(), "Go"), button(r72.a2(), "Go")),
  parts: { p0: () => el("p0"), p1: async ({ input }) => el("p1", input.q, input.sort), p2: { load: async () => ({ state: "running" as const, view: el("p2") }), stalled: () => el("p2") } },
  actions: { a0: async ({ redirect }) => redirect(r72()), a1: async ({ body, redirect, invalid }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(r72())), a2: async ({ redirect }) => redirect(r72()) },
});
const d137 = page("/x137", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "defer" }, p1: { reason: "search", owns: ["q"] }, a0: action(), a1: action(S) });
const r137 = ref(d137);
handlers(d137, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), button(r137.a0(), "Go"), forms.a1.errors.name, button(r137.a1(), "Go")),
  parts: { p0: () => el("p0"), p1: async ({ input }) => el("p1", input.q, input.sort) },
  actions: { a0: async ({ redirect }) => redirect(r137()), a1: async ({ body, redirect, invalid }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(r137())) },
});
