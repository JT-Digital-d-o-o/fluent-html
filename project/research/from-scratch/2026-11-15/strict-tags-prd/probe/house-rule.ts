// A probe, not a design: the house rule as types on a page that owns its parts. Standalone, no library.
// Each "✗" line must be a tsc error and each "✓" line must not. Run: sh run.sh
declare const root: unique symbol;
type El<Root extends string = never> = { readonly [root]: Root };
type Page = { readonly page: true };
type Spec = "string?" | "number?";
type Q = Record<string, Spec>;
type In<T extends Q> = { [K in keyof T]?: T[K] extends "number?" ? number : string };

// The closed union: a targeted swap names one of these, and each carries what makes it safe.
type Search<K extends string> = { readonly reason: "search"; readonly owns: readonly K[] };
type Poll = { readonly reason: "poll"; readonly every: `${number}s`; readonly max: number };
type Defer = { readonly reason: "defer" };
type Part = Search<string> | Poll | Defer;
type Parts = Record<string, Part>;

type Owned<P extends Parts> = { [N in keyof P]: P[N] extends Search<infer K> ? K : never }[keyof P];
type OwnsItsPage<T extends Q, P extends Parts> = {
  [N in keyof P]: P[N] extends Search<infer K> ? ([K] extends [keyof T] ? unknown : "✗ a search part owns keys of its page's query") : unknown;
};
type PageDef<T extends Q, P extends Parts> = { readonly path: string; readonly query: T; readonly parts: P };
declare function page<const T extends Q, const P extends Parts = {}>(path: `/${string}`, query: T, parts?: P & OwnsItsPage<T, P>): PageDef<T, P>;

type Again<N extends string> = { readonly again: El<N> };
type Done = { readonly done: true };
declare function again<N extends string>(view: El<N>): Again<N>;
declare function done(): Done;

type Answer<N extends string, D extends Part> = D extends Poll ? Again<N> | Done : El<N>;
type Handlers<T extends Q, P extends Parts> = {
  page: (ctx: { input: Omit<In<T>, Owned<P>>; parts: { [N in keyof P & string]: () => Promise<El<N>> } }) => Page | Promise<Page>;
  parts: { [N in keyof P & string]: (ctx: { input: In<T> }) => Answer<N, P[N]> | Promise<Answer<N, P[N]>> };
};
declare function handlers<T extends Q, P extends Parts>(def: PageDef<T, P>, h: Handlers<T, P>): void;

declare function el<N extends string>(id: N, ...kids: unknown[]): El<N>;
declare function layout(...kids: unknown[]): Page;
declare const find: (q?: string, sort?: string) => Promise<string[]>;
declare const job: () => Promise<"running" | "done">;

const list = page("/projects", { q: "string?", sort: "string?" }, {
  rows: { reason: "search", owns: ["q"] },
  status: { reason: "poll", every: "2s", max: 150 },
  tips: { reason: "defer" },
});

handlers(list, { // ✓ the page places its parts and never sees q
  page: async ({ input, parts }) => layout(input.sort, await parts.rows(), await parts.status(), await parts.tips()),
  parts: {
    rows: async ({ input }) => el("rows", (await find(input.q, input.sort)).length),
    status: async () => ((await job()) === "running" ? again(el("status", "Exporting")) : done()),
    tips: () => el("tips"),
  },
});

handlers(list, {
  page: async ({ input, parts }) => layout((await find(input.q)).length, await parts.rows()), // ✗ a count from the search key outside its part
  parts: {
    rows: async ({ input }) => el("rows", input.q),
    status: async () => done(),
    tips: () => el("tips"),
  },
});

handlers(list, {
  page: async ({ parts }) => layout(await parts.rows()),
  parts: {
    rows: async () => el("status"), // ✗ a part answers its own root
    status: async () => el("status", "Exporting"), // ✗ a poll answers again(view) or done()
    tips: () => el("tips"),
  },
});

page("/a", {}, { feed: { reason: "poll", every: "2s" } }); // ✗ a poll without its bound
page("/b", {}, { rows: { reason: "sort" } }); // ✗ not a reason
page("/c", { q: "string?" }, { rows: { reason: "search", owns: ["term"] } }); // ✗ owns a key the page does not have
page("/d", { q: "string?" }, { rows: { reason: "search", owns: ["q"] } }); // ✓
page("/e", {}); // ✓ a page with no parts: every answer is the page
