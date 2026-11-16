import { page, action, ref, handlers, el, layout, a, button, form, field } from "./lib.ts";
declare const S: { parse(x: unknown): { name: string; note: string } };
const d40 = page("/x40", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "defer" }, p1: { reason: "search", owns: ["q"] }, p2: { reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] }, a0: action(), a1: action(S), a2: action() });
const r40 = ref(d40);
handlers(d40, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), await parts.p2(), button(r40.a0(), "Go"), forms.a1.errors.name, button(r40.a1(), "Go"), button(r40.a2(), "Go")),
  parts: { p0: () => el("p0"), p1: async ({ input }) => el("p1", input.q, input.sort), p2: { load: async () => ({ state: "running" as const, view: el("p2") }), stalled: () => el("p2") } },
  actions: { a0: async ({ redirect }) => redirect(r40()), a1: async ({ body, redirect, invalid }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(r40())), a2: async ({ redirect }) => redirect(r40()) },
});
const d105 = page("/x105", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "defer" }, p1: { reason: "search", owns: ["q"] }, a0: action(), a1: action(S) });
const r105 = ref(d105);
handlers(d105, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), button(r105.a0(), "Go"), forms.a1.errors.name, button(r105.a1(), "Go")),
  parts: { p0: () => el("p0"), p1: async ({ input }) => el("p1", input.q, input.sort) },
  actions: { a0: async ({ redirect }) => redirect(r105()), a1: async ({ body, redirect, invalid }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(r105())) },
});
