// A probe, not a design: a form that needs a submit control, as a mark its subtree must hold (wcag/h32 as a tsc error).
// Standalone. Each "✗" line must be a tsc error and each "✓" line must not. Run: sh run.sh submit.ts
declare const marks: unique symbol;
type Mark = "text" | "interactive" | "submit";
type El<M extends Mark = never> = { readonly [marks]: M };
type Kid = string | El<Mark> | readonly (string | El<Mark>)[];
type Marks1<X> = X extends string ? "text" : X extends El<infer M> ? M : never;
type MarksIn<X> = X extends readonly (infer Y)[] ? Marks1<Y> : Marks1<X>;
type Attrs = { type?: "submit" | "button" | "search" | "text"; name?: string };
type KidsOf<A extends readonly unknown[]> = MarksIn<Exclude<A[number], Attrs>>;
type IsSubmit<A extends readonly unknown[]> = true extends (A[number] extends infer X ? (X extends { type: "submit" } ? true : false) : never) ? true : false;

declare function div<const A extends readonly (Kid | Attrs)[]>(...args: A): El<KidsOf<A>>;
declare function label<const A extends readonly (Kid | Attrs)[]>(...args: A): El<KidsOf<A>>;
declare function input<const A extends readonly Attrs[]>(...args: A): El<"interactive" | (IsSubmit<A> extends true ? "submit" : never)>;
declare function button<const A extends readonly (Kid | Attrs)[]>(...args: A): El<"interactive" | "text" | (IsSubmit<A> extends true ? "submit" : never)>;
type NeedsSubmit<A extends readonly unknown[]> = "submit" extends KidsOf<A> ? unknown
  : "✗ a form needs a submit control: add button({ type: \"submit\" }, \"Search\"). A search that reloads as you type still needs one for a keyboard and for no JavaScript";
declare function form<const A extends readonly (Kid | Attrs)[]>(...args: A & NeedsSubmit<A>): El<KidsOf<A>>;
declare const Fields: (props: { kids: Kid[] }) => El<Mark>;

form(label("Search", input({ type: "search", name: "q" })), button({ type: "submit" }, "Search")); // ✓
form(div(label("Name", input({ name: "name" })), div(button({ type: "submit" }, "Save")))); // ✓ a submit nested two levels down
form(input({ type: "submit" })); // ✓
form([label("Name", input({ name: "name" })), button({ type: "submit" }, "Save")]); // ✓ children in an array
form(Fields({ kids: [] })); // ✓ a component that may hold anything is not refused (a miss, never a false rejection)
form(label("Search", input({ type: "search", name: "q" }))); // ✗ the two wcag/h32 errors of the gate's run 1
form(label("Name", input({ name: "name" })), button({ type: "button" }, "Cancel")); // ✗ a button that does not submit
form(); // ✗
