import { page, action, ref, handlers, el, layout, a, button, form, field } from "./lib.ts";
declare const S: { parse(x: unknown): { name: string; note: string } };
const d58 = page("/x58", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "defer" }, p1: { reason: "search", owns: ["q"] }, p2: { reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] }, a0: action(), a1: action(S), a2: action() });
const r58 = ref(d58);
handlers(d58, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), await parts.p2(), button(r58.a0(), "Go"), forms.a1.errors.name, button(r58.a1(), "Go"), button(r58.a2(), "Go")),
  parts: { p0: () => el("p0"), p1: async ({ input }) => el("p1", input.q, input.sort), p2: { load: async () => ({ state: "running" as const, view: el("p2") }), stalled: () => el("p2") } },
  actions: { a0: async ({ redirect, self }) => redirect(self()), a1: async ({ body, redirect, invalid, self }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(self())), a2: async ({ redirect, self }) => redirect(self()) },
});
const d123 = page("/x123", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "defer" }, p1: { reason: "search", owns: ["q"] }, a0: action(), a1: action(S) });
const r123 = ref(d123);
handlers(d123, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, a(self({ sort: "name" }), "Name"), await parts.p0(), await parts.p1(), button(r123.a0(), "Go"), forms.a1.errors.name, button(r123.a1(), "Go")),
  parts: { p0: () => el("p0"), p1: async ({ input }) => el("p1", input.q, input.sort) },
  actions: { a0: async ({ redirect, self }) => redirect(self()), a1: async ({ body, redirect, invalid, self }) => (body.name === "" ? invalid({ name: "Required" }) : redirect(self())) },
});
