// A probe, not a design: the house rule typed onto a route table where parts and actions hang off a page.
// Standalone, no library. Each "✗" line must be a tsc error and each "✓" line must not. Run: sh run.sh
export declare const root: unique symbol;
export type El<Root extends string = never> = { readonly [root]: Root };
export type Page = { readonly page: true };
export type Redirect = { readonly redirect: true };
export type Invalid = { readonly invalid: true };
export type PageRef = { readonly ref: "page" };
export type ActionRef = { readonly ref: "action" };
export type PartRef<N extends string> = { readonly ref: "part"; readonly name: N };
export type Wire<On extends string> = { readonly wire: On };
export type Awaitable<X> = X | Promise<X>;

export type Spec = "string?" | "number?";
export type Q = Record<string, Spec>;
export type In<T extends Q> = { [K in keyof T]?: T[K] extends "number?" ? number : string };

// The closed union. A targeted swap names one of these, and each carries what makes it safe.
export type Search<K extends string> = { readonly reason: "search"; readonly owns: readonly [K, ...K[]] };
export type Poll<L extends string, S extends string> = {
  readonly reason: "poll"; readonly every: `${number}s`; readonly max: number;
  readonly live: readonly [L, ...L[]]; readonly settled: readonly [S, ...S[]];
};
export type Defer = { readonly reason: "defer" };
export type Action<Bd = undefined> = { readonly action: true; readonly body: Bd };
export declare function action(): Action;
export declare function action<Bd>(schema: { parse(x: unknown): Bd }): Action<Bd>;

export type Check<T extends Q, M> = {
  [N in keyof M]: M[N] extends Action<any> ? unknown
    : M[N] extends { readonly reason: "search" }
      ? M[N] extends Search<infer K> ? ([K] extends [keyof T] ? unknown : "✗ a search part owns keys of its page's query") : "✗ a search part names the query keys it owns: owns: [\"q\"]"
    : M[N] extends { readonly reason: "poll" }
      ? M[N] extends Poll<infer L, infer S>
        ? ([Extract<L, S>] extends [never] ? unknown : "✗ a state is live or settled, not both")
        : "✗ a poll names every, max, the states it runs in (live) and at least one state it stops in (settled)"
    : M[N] extends { readonly reason: "defer" } ? (keyof M[N] extends "reason" ? unknown : "✗ a deferred part takes no trigger and no method: it loads once, by GET")
    : "✗ a targeted swap names its reason: \"search\", \"poll\" or \"defer\". Without one it is a page: link to it and the full layout answers";
};
export type PageDef<T extends Q, M> = { readonly path: string; readonly query: T; readonly members: M };
export declare function page<const T extends Q, const M extends Record<string, unknown> = {}>(path: `/${string}`, query: T, members?: M & Check<T, M>): PageDef<T, M>;

export type Owned<M> = { [N in keyof M]: M[N] extends Search<infer K> ? K : never }[keyof M];
export type PartKeys<M> = { [N in keyof M]: M[N] extends { readonly reason: string } ? N : never }[keyof M] & string;
export type SearchKeys<M> = { [N in keyof M]: M[N] extends Search<string> ? N : never }[keyof M] & string;
export type ActionKeys<M> = { [N in keyof M]: M[N] extends Action<any> ? N : never }[keyof M] & string;
export type BodyOf<A> = A extends Action<infer Bd> ? Bd : never;
export type FormKeys<M> = { [N in keyof M]: M[N] extends Action<infer Bd> ? (undefined extends Bd ? never : N) : never }[keyof M] & string;

// A link to a page. With no input it is the fresh page. With input, every key a search part owns is said out loud.
export type Carry<A, O> = [O] extends [never] ? unknown : [O] extends [keyof A] ? unknown
  : "✗ this page's search owns a query key: build the link with self({ … }), which keeps it, or name the key (q: undefined drops it)";
export type Link<T extends Q, M> = { (): PageRef; <const A extends In<T>>(input: A & Carry<A, Owned<M>>): PageRef };
export type Refs<T extends Q, M> = Link<T, M> & { readonly [N in ActionKeys<M>]: () => ActionRef } & { readonly [N in PartKeys<M>]: PartRef<N> };
export declare function ref<T extends Q, M>(def: PageDef<T, M>): Refs<T, M>;

// What a page handler gets instead of the owned keys: itself, with the current query kept.
export type Self<T extends Q, M> = { (over?: Omit<In<T>, Owned<M> & string>): PageRef } & { readonly [N in SearchKeys<M>]: { search(): { form: Wire<"form">; input: Wire<"input"> } } };
export type State<Bd> = { readonly values: Partial<Bd>; readonly errors: { [K in keyof Bd]?: string } };

export type PollAnswer<N extends string, P> = P extends Poll<infer L, infer S> ? { readonly state: L | S; readonly view: El<N> } : never;
export type PartEntry<T extends Q, N extends string, P> = P extends Poll<string, string>
  ? { load: (ctx: { input: In<T> }) => Awaitable<PollAnswer<N, P>>; stalled: (ctx: { input: In<T> }) => Awaitable<El<N>> }
  : (ctx: { input: In<T> }) => Awaitable<El<N>>;
export type ActionEntry<T extends Q, A> = (ctx: { input: In<T>; body: BodyOf<A>; redirect(to: PageRef): Redirect; invalid(errors: { [K in keyof BodyOf<A>]?: string }): Invalid })
  => Awaitable<Redirect | (undefined extends BodyOf<A> ? never : Invalid) | { readonly "✗ a mutation answers its page: return redirect(page), and the full layout re-renders every region": never }>;
export type Handlers<T extends Q, M> = {
  page: (ctx: { input: Omit<In<T>, Owned<M> & string>; self: Self<T, M>; parts: { [N in PartKeys<M>]: () => Promise<El<N>> }; forms: { [N in FormKeys<M>]: State<BodyOf<M[N]>> } }) => Awaitable<Page>;
  parts: { [N in PartKeys<M>]: PartEntry<T, N, M[N]> };
  actions: { [N in ActionKeys<M>]: ActionEntry<T, M[N]> };
};
export declare function handlers<T extends Q, M>(def: PageDef<T, M>, h: Handlers<T, M>): void;

export declare function el<N extends string>(id: N, ...kids: unknown[]): El<N>;
export declare function layout(...kids: unknown[]): Page;
export declare function a(to: PageRef, ...kids: unknown[]): El;
export declare function button(to: ActionRef, ...kids: unknown[]): El;
export declare function form(wire: Wire<"form">, ...kids: unknown[]): El;
export declare function field(wire: Wire<"input">): El;
