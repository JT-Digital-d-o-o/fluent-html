
/**
 * A tag. Leading arguments are its classes (tw`…`), attributes ({…}) and wires, in any order; the rest are children.
 * One signature, so a mistake is one diagnostic.
 */
export type El<A = Global, R = never> = <I extends string = never>(...args: (Tw | A | R | Wire<I> | Child)[]) => Html<[I] extends [never] ? undefined : I>;
export type VoidEl<A = Global, R = never> = <I extends string = never>(...args: (Tw | A | R | Wire<I>)[]) => Html<[I] extends [never] ? undefined : I>;

const e = <A = Global, R = never>(tag: string): El<A, R> => make(tag);
const v = <A = Global, R = never>(tag: string): VoidEl<A, R> => make(tag, true);

export const div = e("div"), span = e("span"), p = e("p"), main = e("main"), section = e("section"), article = e("article");
export const header = e("header"), footer = e("footer"), nav = e("nav"), aside = e("aside");
export const h1 = e("h1"), h2 = e("h2"), h3 = e("h3"), h4 = e("h4");
export const ul = e("ul"), ol = e("ol"), li = e("li"), dl = e("dl"), dt = e("dt"), dd = e("dd");
export const table = e("table"), thead = e("thead"), tbody = e("tbody"), tr = e("tr");
export const td = e<Attrs["td"]>("td"), th = e<Attrs["th"]>("th");
export const strong = e("strong"), em = e("em"), small = e("small"), code = e("code"), pre = e("pre");
export const time = e<Attrs["time"]>("time");
export const a = e<Attrs["a"], PageRef>("a");
export const button = e<Attrs["button"], ActionRef<any>>("button");
export const form = e<Attrs["form"], PageRef>("form");
export const label = e<Attrs["label"]>("label");
export const select = e<Attrs["select"]>("select"), option = e<Attrs["option"]>("option");
export const textarea = e<Attrs["textarea"]>("textarea");
export const dialog = e<Attrs["dialog"]>("dialog");
export const details = e<Attrs["details"]>("details"), summary = e("summary");
export const iframe = e<Attrs["iframe"]>("iframe");
export const title = e("title");
export const input = v<Attrs["input"]>("input"), img = v<Attrs["img"]>("img"), hr = v("hr"), br = v("br");
export const meta = v<Attrs["meta"]>("meta"), link = v<Attrs["link"]>("link");
/** External script only. Data for scripts goes through json() or jsVar(). */
export const script: (a: Attrs["script"]) => Html<undefined> = (a) => new Html("<script" + attrs(a) + "></script>");

