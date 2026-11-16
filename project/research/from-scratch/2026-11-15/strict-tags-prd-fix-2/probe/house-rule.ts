// A probe, not a design: the house rule typed onto a route table where parts and actions hang off a page.
// Standalone, no library. Each "✗" line must be a tsc error and each "✓" line must not. Run: sh run.sh
declare const root: unique symbol;
type El<Root extends string = never> = { readonly [root]: Root };
type Page = { readonly page: true };
type Redirect = { readonly redirect: true };
type Invalid = { readonly invalid: true };
type PageRef<P extends string = string> = { readonly ref: "page"; readonly to: P };
type FreshRef<P extends string> = PageRef<P> & { readonly fresh: true };
type ActionRef = { readonly ref: "action" };
type PartRef<N extends string> = { readonly ref: "part"; readonly name: N };
type Wire<On extends string> = { readonly wire: On };
type Awaitable<X> = X | Promise<X>;

type Spec = "string?" | "number?";
type Q = Record<string, Spec>;
type In<T extends Q> = { [K in keyof T]?: T[K] extends "number?" ? number : string };

// The closed union. A targeted swap names one of these, and each carries what makes it safe.
type Search<K extends string> = { readonly reason: "search"; readonly owns: readonly [K, ...K[]] };
type Poll<L extends string, S extends string> = {
  readonly reason: "poll"; readonly every: `${number}s`; readonly max: number;
  readonly live: readonly [L, ...L[]]; readonly settled: readonly [S, ...S[]];
};
type Defer = { readonly reason: "defer" };
type Action<Bd = undefined> = { readonly action: true; readonly body: Bd };
declare function action(): Action;
declare function action<Bd>(schema: { parse(x: unknown): Bd }): Action<Bd>;

type Check<T extends Q, M> = {
  [N in keyof M]: M[N] extends Action<infer Bd> ? ([Extract<keyof Bd, Owned<M>>] extends [never] ? unknown : "✗ a body field shares its name with a query key this page's search owns: rename the field, the live search travels with every post")
    : M[N] extends { readonly reason: "search" }
      ? M[N] extends Search<infer K> ? ([K] extends [keyof T] ? unknown : "✗ a search part owns keys of its page's query") : "✗ a search part names the query keys it owns: owns: [\"q\"]"
    : M[N] extends { readonly reason: "poll" }
      ? M[N] extends Poll<infer L, infer S>
        ? ([Extract<L, S>] extends [never] ? unknown : "✗ a state is live or settled, not both")
        : "✗ a poll names every, max, the states it runs in (live) and at least one state it stops in (settled)"
    : M[N] extends { readonly reason: "defer" } ? (keyof M[N] extends "reason" ? unknown : "✗ a deferred part takes no trigger and no method: it loads once, by GET")
    : "✗ a targeted swap names its reason: \"search\", \"poll\" or \"defer\". Without one it is a page: link to it and the full layout answers";
};
type PageDef<P extends string, T extends Q, M> = { readonly path: P; readonly query: T; readonly members: M };
declare function page<const P extends `/${string}`, const T extends Q, const M extends Record<string, unknown> = {}>(path: P, query: T, members?: M & Check<T, M>): PageDef<P, T, M>;

type Owned<M> = { [N in keyof M]: M[N] extends Search<infer K> ? K : never }[keyof M];
type PartKeys<M> = { [N in keyof M]: M[N] extends { readonly reason: string } ? N : never }[keyof M] & string;
type SearchKeys<M> = { [N in keyof M]: M[N] extends Search<string> ? N : never }[keyof M] & string;
type ActionKeys<M> = { [N in keyof M]: M[N] extends Action<any> ? N : never }[keyof M] & string;
type BodyOf<A> = A extends Action<infer Bd> ? Bd : never;
type FormKeys<M> = { [N in keyof M]: M[N] extends Action<infer Bd> ? (undefined extends Bd ? never : N) : never }[keyof M] & string;

// A link to a page. With no input it is the fresh page. With input, every key a search part owns is said out loud.
type Carry<A, O> = [O] extends [never] ? unknown : [O] extends [keyof A] ? unknown
  : "✗ this page's search owns a query key: build the link with self({ … }), which keeps it, or name the key (q: undefined drops it)";
type Link<P extends string, T extends Q, M> = { (): FreshRef<P>; <const A extends In<T>>(input: A & Carry<A, Owned<M>>): PageRef<P> };
type Refs<P extends string, T extends Q, M> = Link<P, T, M> & { readonly [N in ActionKeys<M>]: () => ActionRef } & { readonly [N in PartKeys<M>]: PartRef<N> };
declare function ref<P extends string, T extends Q, M>(def: PageDef<P, T, M>): Refs<P, T, M>;

// What a handler gets instead of the owned keys: its page, with the query of the request kept. On the wire every request the page
// sends carries the search control's live value, so the query kept is the one on screen and not the one of the last render.
type Keep<P extends string, T extends Q, M> = (over?: Omit<In<T>, Owned<M> & string>) => PageRef<P>;
type Self<P extends string, T extends Q, M> = Keep<P, T, M> & { readonly [N in SearchKeys<M>]: { search(): { form: Wire<"form">; input: Wire<"input"> } } };
type State<Bd> = { readonly values: Partial<Bd>; readonly errors: { [K in keyof Bd]?: string } };

type PollAnswer<N extends string, P> = P extends Poll<infer L, infer S> ? { readonly state: L | S; readonly view: El<N> } : never;
type PartEntry<T extends Q, N extends string, P> = P extends Poll<string, string>
  ? { load: (ctx: { input: In<T> }) => Awaitable<PollAnswer<N, P>>; stalled: (ctx: { input: In<T> }) => Awaitable<El<N>> }
  : (ctx: { input: In<T> }) => Awaitable<El<N>>;
// A redirect back to the action's own page says what happens to the live search, as a link does.
type Back<R, P extends string, O> = [O] extends [never] ? unknown : R extends FreshRef<P>
  ? "✗ this page's search owns a query key: redirect(self()) keeps the live search, or name the key to drop it (q: undefined)" : unknown;
type ActionEntry<P extends string, T extends Q, M, A> = (ctx: { input: In<T>; self: Keep<P, T, M>; body: BodyOf<A>; redirect<R extends PageRef>(to: R & Back<R, P, Owned<M>>): Redirect; invalid(errors: { [K in keyof BodyOf<A>]?: string }): Invalid })
  => Awaitable<Redirect | (undefined extends BodyOf<A> ? never : Invalid) | { readonly "✗ a mutation answers its page: return redirect(page), and the full layout re-renders every region": never }>;
type Handlers<P extends string, T extends Q, M> = {
  page: (ctx: { input: Omit<In<T>, Owned<M> & string>; self: Self<P, T, M>; parts: { [N in PartKeys<M>]: () => Promise<El<N>> }; forms: { [N in FormKeys<M>]: State<BodyOf<M[N]>> } }) => Awaitable<Page>;
  parts: { [N in PartKeys<M>]: PartEntry<T, N, M[N]> };
  actions: { [N in ActionKeys<M>]: ActionEntry<P, T, M, M[N]> };
};
declare function handlers<P extends string, T extends Q, M>(def: PageDef<P, T, M>, h: Handlers<P, T, M>): void;

declare function el<N extends string>(id: N, ...kids: unknown[]): El<N>;
declare function layout(...kids: unknown[]): Page;
declare function a(to: PageRef, ...kids: unknown[]): El;
declare function button(to: ActionRef, ...kids: unknown[]): El;
declare function form(wire: Wire<"form">, ...kids: unknown[]): El;
declare function field(wire: Wire<"input">): El;
declare const find: (q?: string, sort?: string) => Promise<string[]>;
type Job = "queued" | "running" | "done" | "failed";
declare const job: () => Promise<Job>;
declare const ProjectInput: { parse(x: unknown): { name: string } };

const list = page("/projects", { q: "string?", sort: "string?" }, {
  rows: { reason: "search", owns: ["q"] },
  status: { reason: "poll", every: "2s", max: 150, live: ["queued", "running"], settled: ["done", "failed"] },
  tips: { reason: "defer" },
  remove: action(),
  create: action(ProjectInput),
});
const projects = ref(list);
const plain = page("/reports", { sort: "string?" }, { clear: action() });
const detail = ref(page("/projects/detail", {}));

handlers(list, { // ✓ the page never sees q: it places the part, echoes the search through self and keeps q in its sort link
  page: async ({ input, self, parts, forms }) => {
    const s = self.rows.search();
    return layout(input.sort, form(s.form, field(s.input)), a(self({ sort: "name" }), "Name"), await parts.rows(), await parts.status(), await parts.tips(), forms.create.errors.name);
  },
  parts: {
    rows: async ({ input }) => el("rows", (await find(input.q, input.sort)).length),
    status: { load: async () => ({ state: await job(), view: el("status", "Exporting") }), stalled: () => el("status", "Still running. Reload to check.") },
    tips: () => el("tips"),
  },
  actions: {
    remove: async ({ redirect, self }) => redirect(self()), // ✓ back to the list as it is on screen: search and sort kept
    create: async ({ body, redirect, invalid }) => (body.name === "" ? invalid({ name: "Name is required" }) : redirect(detail())), // ✓ another page
  },
});

const ok = { rows: async () => el("rows"), status: { load: async () => ({ state: "done" as const, view: el("status") }), stalled: () => el("status") }, tips: () => el("tips") };
const acts = { remove: async (c: { redirect(to: PageRef): Redirect }) => c.redirect(detail()), create: async (c: { redirect(to: PageRef): Redirect }) => c.redirect(detail()) };

handlers(list, {
  page: async ({ input, parts }) => layout((await find(input.q)).length, await parts.rows()), // ✗ HX-8 search: a count from the search key outside its part
  parts: ok, actions: acts,
});
handlers(list, {
  page: async ({ parts }) => layout(await parts.rows()),
  parts: ok,
  actions: {
    remove: async () => el("rows"), // ✗ HX-8 counter, badge, flash: a mutation answers a part
    create: acts.create,
  },
});
handlers(list, {
  page: async ({ parts }) => layout(await parts.rows()),
  parts: {
    rows: async () => el("status"), // ✗ a part answers its own root
    status: { load: async () => ({ state: "paused" as const, view: el("status") }), stalled: () => el("status") }, // ✗ a state the poll did not declare
    tips: () => el("tips"),
  },
  actions: acts,
});
handlers(list, {
  page: async ({ parts }) => layout(await parts.rows()),
  parts: {
    rows: ok.rows,
    status: async () => el("status", "Exporting"), // ✗ a poll answers its state and view, and says what a stalled poll shows
    tips: ok.tips,
  },
  actions: acts,
});

handlers(list, {
  page: async ({ parts }) => layout(await parts.rows()),
  parts: ok,
  actions: {
    remove: async ({ redirect }) => redirect(projects()), // ✗ live search: a redirect to its own fresh page drops what the user typed
    create: async ({ input, redirect }) => redirect(projects({ sort: input.sort, q: undefined })), // ✓ drops the search, said out loud
  },
});
handlers(plain, { page: async () => layout(), parts: {}, actions: { clear: async ({ redirect }) => redirect(ref(plain)()) } }); // ✓ no owned key, nothing to lose

a(projects(), "Projects"); // ✓ the fresh page
a(projects({ q: "apollo" }), "Apollo"); // ✓ a deep link that names the key
a(projects({ sort: "name", q: undefined }), "Name"); // ✓ drops the search, said out loud
a(projects({ sort: "name" }), "Name"); // ✗ a link that sets a query key and drops the search without saying so
a(projects.rows, "Reload rows"); // ✗ HX-1: a part is not an address, so nothing can be aimed at it
button(projects.rows, "Reload rows"); // ✗ the same on a button
button(projects.remove(), "Delete"); // ✓ an action goes on a button and answers its page

page("/a", {}, { rows: {} }); // ✗ a targeted swap with no reason
page("/b", {}, { rows: { reason: "sort" } }); // ✗ not a reason
page("/c", {}, { feed: { reason: "poll", every: "2s", live: ["running"], settled: ["done"] } }); // ✗ a poll without its bound
page("/d", {}, { feed: { reason: "poll", every: "2s", max: 150, live: ["running"], settled: [] } }); // ✗ HX-4: a poll with no state it stops in
page("/e", {}, { feed: { reason: "poll", every: "2s", max: 150, live: ["running", "done"], settled: ["done"] } }); // ✗ a state both live and settled
page("/f", { q: "string?" }, { rows: { reason: "search", owns: ["term"] } }); // ✗ owns a key the page does not have
page("/g", { q: "string?" }, { rows: { reason: "search" } }); // ✗ a search that owns nothing
page("/h", {}, { tips: { reason: "defer", method: "post" } }); // ✗ a part is a GET
declare const QInput: { parse(x: unknown): { q: string } };
page("/k", { q: "string?" }, { rows: { reason: "search", owns: ["q"] }, ask: action(QInput) }); // ✗ live search: a body field named like the owned key
page("/l", { q: "string?" }, { ask: action(QInput) }); // ✓ no search owns q on this page
page("/i", { q: "string?" }, { rows: { reason: "search", owns: ["q"] } }); // ✓
page("/j", {}); // ✓ a page with no parts: every answer is the page
