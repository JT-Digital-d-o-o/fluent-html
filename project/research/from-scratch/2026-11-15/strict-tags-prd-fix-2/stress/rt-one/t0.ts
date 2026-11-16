import { page, action, ref, handlers, el, layout, a, button, form, field } from "./lib.ts";
declare const S: { parse(x: unknown): { name: string; note: string } };
const d0 = page("/x0", { q: "string?", sort: "string?", page: "number?" }, { p0: { reason: "search", owns: ["q"] }, a0: action() });
const r0 = ref(d0);
handlers(d0, {
  page: async ({ input, self, parts, forms }) => layout(input.sort, form(self.p0.search().form, field(self.p0.search().input)), a(self({ sort: "name" }), "Name"), await parts.p0(), button(r0.a0(), "Go")),
  parts: { p0: async ({ input }) => el("p0", input.q, input.sort) },
  actions: { a0: async ({ redirect, self }) => redirect(self()) },
});
