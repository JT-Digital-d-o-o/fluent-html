// A probe, not the library: the brand shape Gate 1a builds, small enough to read. Three differences from the prototype:
// a brand has a private member (`#b`), it leaves the module as a type only, and the attribute table is a type alias.
// A sink asks for the private member at run time, so what reaches it without its owner is escaped or refused.
type Mark = "text" | "interactive";
class ElC<out S extends string = string, out M extends Mark = Mark> {
  #b = true; declare readonly $s: S; declare readonly $m: M; readonly h: string;
  constructor(h: string) { this.h = h }
  static is(x: unknown): x is ElC { return typeof x === "object" && x !== null && #b in x }
}
class ClsC { #b = true; readonly c: string; constructor(c: string) { this.c = c } static is(x: unknown): x is ClsC { return typeof x === "object" && x !== null && #b in x } }
export type El<S extends string = string, M extends Mark = Mark> = ElC<S, M>;
export type Cls = ClsC;
export type Global = { id?: string; title?: string };
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => "&#" + c.charCodeAt(0) + ";");
const out = (k: unknown): string => (ElC.is(k) ? k.h : Array.isArray(k) ? k.map(out).join("") : k == null || k === false ? "" : esc(String(k)));
type Kid<No extends Mark = never> = string | El<string, Exclude<Mark, No>> | readonly Kid<No>[];
const tag = (name: string, args: readonly unknown[]): string => {
  const c = args.filter(ClsC.is).map((x) => x.c).join(" ");
  return `<${name}${c ? ` class="${esc(c)}"` : ""}>${args.filter((x) => !ClsC.is(x)).map(out).join("")}</${name}>`;
};
export const cls = (s: "flex" | "gap-4"): Cls => new ClsC(s);
export const text = (s: string): El<"phrasing", "text"> => new ElC(esc(s));
export const div = (...kids: (Cls | Kid)[]): El<"flow", Mark> => new ElC(tag("div", kids));
export const button = (...kids: (Cls | Kid<"interactive">)[]): El<"phrasing", "interactive"> => new ElC(tag("button", kids));
export const render = (e: El): string => out(e);
