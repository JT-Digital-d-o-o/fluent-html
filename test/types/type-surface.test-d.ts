// Compile-only type tests (F-D-123). No runtime assertions — these are checked by `tsc`
// during `npm run build` (test/** is in the tsconfig). A `@ts-expect-error` whose line
// stops erroring (e.g. a closed union gets widened, or Form<T>/route-param narrowing
// breaks) becomes an "unused directive" error and FAILS the build. This makes
// "a typo is a compile error" an enforced contract, not a comment.

import {
  Img, Link, Dialog, Div, Button, Form, defineRoutes, defineIds,
  ForEachKeyed, Li, Iframe, Input, Svg, Path, Circle,
  Video, Audio, Source, Meta, Script, Area,
  Th, Td,
  Ins, Del, Q, Blockquote,
  type InsTag, type DelTag, type QTag, type BlockquoteTag,
} from "../../src/index.js";

const ids = defineIds(["card"] as const);

// `_`-prefixed param is exempt from noUnusedParameters; statements below are expressions, not bindings.
const expectType = <T>(_v: T): void => undefined;

// ── Closed unions: canonical compiles, typo errors ─────────────────────────
Img().setFetchPriority("high");
// @ts-expect-error — FetchPriority is closed; "highh" is not a member
Img().setFetchPriority("highh");

Dialog().setClosedby("any");
// @ts-expect-error — ClosedBy is closed
Dialog().setClosedby("nope");

Div().setPopover("auto");
Div().setPopover();
// @ts-expect-error — PopoverState is closed
Div().setPopover("autoo");

Button().setCommand("show-modal");
Button().setCommand("--author-cmd");        // the spec `--${string}` author arm
// @ts-expect-error — a non-`--` custom command is rejected
Button().setCommand("custom");

// setFormmethod widened to FormMethod (get | post | dialog), not bare string
Button().setFormmethod("dialog");
// @ts-expect-error — "put" is not a FormMethod
Button().setFormmethod("put");

// ── Open unions: canonical AND custom both compile (the (string & {}) tail) ─
Link().setRel("preconnect");
Link().setRel("vendor-custom-rel");          // open — still compiles

// ── Form<T>: field names narrow to keyof T ─────────────────────────────────
type CreateUserReq = { email: string; name: string; agree: boolean };
Form<CreateUserReq>((f) => [
  f.input("email", "email"),
  f.checkbox("agree"),
  // @ts-expect-error — "emial" is not a key of CreateUserReq
  f.input("emial", "email"),
  // @ts-expect-error — "agreee" is not a key of CreateUserReq
  f.checkbox("agreee"),
]);

// ── Routes: F-D-140 enum params + F-D-141 path-checked keys + scalar kinds ──
const r = defineRoutes("/orders", {
  detail: { method: "get", path: "/:id", params: { id: "number" } as const },
  byStatus: { method: "get", path: "/:status", params: { status: ["open", "paid", "void"] as const } },
} as const);

// scalar number param
expectType<string>(r.detail.resolve({ id: 42 }));
// @ts-expect-error — id is number, not string
r.detail.resolve({ id: "42" });

// enum param narrows to its member union
expectType<string>(r.byStatus.resolve({ status: "open" }));
// @ts-expect-error — "shipped" is not in the ["open","paid","void"] enum
r.byStatus.resolve({ status: "shipped" });

// F-D-141: a params key that is not a :param in the path is a compile error
defineRoutes({
  bad: {
    method: "get",
    path: "/u/:id",
    // @ts-expect-error — "ic" is not a :param in "/u/:id" (was a silent no-op before)
    params: { ic: "number" } as const,
  },
} as const);

// ── Styling/control: :has() variant, viewTransitionName, ForEachKeyed ──────
Div().on("has-[:checked]", (t) => t.background("blue-50"));   // F-B-180 relational hook
Div().viewTransitionName("hero");                              // F-B-181 string
Div().viewTransitionName(ids.card);                           // F-B-181 Id overload

// ForEachKeyed renderItem must return a Tag (so it can be keyed)
ForEachKeyed([{ id: 1 }], (x) => x.id, (x) => Li(String(x.id)));
// @ts-expect-error — renderItem must return a Tag, not a bare string
ForEachKeyed([{ id: 1 }], (x) => x.id, (x) => String(x.id));

// ── Tier-3b: ARIA per-key values, closed global unions, scalar unit overloads ──
Div().setAria({ live: "assertive", current: "page", invalid: true, level: 2 });
// @ts-expect-error — aria-live is enumerated; "polit" is not a member (F-D-103)
Div().setAria({ live: "polit" });
// @ts-expect-error — aria-current is enumerated
Div().setAria({ current: "pages" });

Div().setRole("mark");                 // F-B-143 — WAI-ARIA 1.2/1.3 role autocompletes

Input().setEnterkeyhint("send");
// @ts-expect-error — EnterKeyHint is closed
Input().setEnterkeyhint("nope");
Div().setContenteditable("plaintext-only");
// @ts-expect-error — ContentEditable is closed
Div().setContenteditable("maybe");

Div().textSize("px", 13);              // F-C-160 unit overload
Div().leading("rem", 1.5);
Div().underlineOffset("px", 2);

Button().setForm(ids.card);           // setForm accepts string | Id
Input().setList(ids.card);            // Id-typed datalist ref

Iframe().setReferrerPolicy("no-referrer");
// @ts-expect-error — ReferrerPolicy is closed
Iframe().setReferrerPolicy("bogus-policy");

// ── Closed sizing unions (F-D-900) — typos error; arbitrary values still work ──
Div().w("full");
Div().w("[37px]");            // arbitrary via the bracket arm (TailwindSpacing)
Div().w("px", 13);            // (unit, amount) overload
Div().minW("[200px]");        // the 3 standalone unions got an explicit [..] arm
Div().maxW("[60ch]");
// @ts-expect-error — TailwindWidth is now closed; "brnad" is a typo, not a dead class
Div().w("brnad");
// @ts-expect-error — TailwindMinWidth is closed
Div().minW("nope");
// @ts-expect-error — TailwindMaxWidth is closed
Div().maxW("hyooge");

// ── Track-C closed unions: canonical compiles, typo errors ──

// Color family
Svg(Path()).fillColor("current");
Circle().strokeColor("red-500");
Div().fillColor("[#1a2b3c]");
Div().strokeWidth("px", 1.5);
Div().decorationThickness("from-font");
Div().scheme("light-dark");
// @ts-expect-error — TailwindColor closed
Div().fillColor("nope");
// @ts-expect-error — v4 ships no stroke-3
Div().strokeWidth(3);
// @ts-expect-error — TailwindDecorationStyle closed
Div().decorationStyle("squiggly");
// @ts-expect-error — TailwindColorScheme closed
Div().scheme("blue");

// Inset shorthands
Div().insetX("0");
Div().insetY("rem", 1.5);
// @ts-expect-error — TailwindInset closed
Div().insetS("nope");

// Typography & text effects
Div().textWrap("balance");
Div().textShadow("lg/30");
Div().hyphens("auto");
// @ts-expect-error — not in TailwindTextWrap
Div().textWrap("baalance");
// @ts-expect-error — "xl" not in the v4.1 text-shadow scale
Div().textShadow("xl");

// Shadows, filters & blending
Div().dropShadow("lg");
Div().insetRing();
Div().mixBlend("multiply");
Div().isolate();
// @ts-expect-error — value required, no bare drop-shadow
Div().dropShadow();
// @ts-expect-error — no md slot for inset-shadow
Div().insetShadow("md");
// @ts-expect-error — bg-blend has no plus-* modes
Div().bgBlend("plus-lighter");
// @ts-expect-error — only "auto" is valid
Div().isolation("isolate");

// Transitions
Div().delay("150");
Div().transitionBehavior("discrete");
// @ts-expect-error — "all" is a TailwindTransition value, not a behavior
Div().transitionBehavior("all");

// Gradients
Div().from("indigo-500", "10%");
Div().gradientLinear(45);
Div().gradientLinear(-65);
Div().gradientTo("to-r", "oklch");
Div().gradientRadial("top-left");
// @ts-expect-error — angle goes through gradientLinear, not the keyword union
Div().gradientTo("45");
// @ts-expect-error — direction keyword union is closed
Div().gradientTo("to-rr");
// @ts-expect-error — interpolation typo
Div().gradientTo("to-r", "oklhc");
// @ts-expect-error — off-ladder stop must use the [..] form
Div().from("indigo-500", "ten");

// 3D transforms
Div().rotateX(-45);
Div().perspectiveOrigin("top-left");
Div().transformStyle("3d");
Div().translate("z", "-px");
// @ts-expect-error — TailwindPerspective closed
Div().perspective("dramtic");
// @ts-expect-error — translate-z has no numeric arm
Div().translate("z", 12);
// @ts-expect-error — TailwindBackfaceVisibility closed
Div().backfaceVisibility("collapse");

// Variants on .on()/.at()
Div().on("aria-checked", (t) => t.background("blue-50"));
Div().on("group-hover/item", (t) => t.opacity(100));
Div().on("nth-3", (t) => t);
Div().on("*", (t) => t.padding("4"));
Div().at("@sm", (t) => t.flex());
Div().at("@lg/sidebar", (t) => t);
// @ts-expect-error — typo'd aria boolean head
Div().on("aria-pressd", (t) => t);
// @ts-expect-error — bare data- form omitted (use data-[…])
Div().on("data-open", (t) => t);
// @ts-expect-error — @8xl is outside the @3xs..@7xl scale
Div().at("@8xl", (t) => t);

// Layout
Div().colStart(-1);
Div().rowSpan("full");
Div().columns("xs");
Div().breakInside("avoid");
Div().snap("x", "mandatory");
Div().snapAlign("none");
Div().scrollMargin("t", "24");
Div().fieldSizing("content");
// @ts-expect-error — TailwindGridLine closed
Div().colStart("aut");
// @ts-expect-error — use "avoid-page", not "page"
Div().breakInside("page");
// @ts-expect-error — 2-arg snap excludes "none"
Div().snap("none", "mandatory");

// Masks (v4.1)
Div().maskImage("none");
Div().maskFrom("b", "50%");
Div().maskTo("b", "90%");
Div().maskComposite("intersect");
Div().maskType("luminance");
// @ts-expect-error — TailwindMaskEdge closed; "top" is not an edge
Div().maskFrom("top", "50%");
// @ts-expect-error — TailwindMaskType closed
Div().maskType("alfa");

// ── Accessible tables (RFC-B-04) ───────────────────────────────────────────
Th("x").setScope("col");
Th("x").setHeaders(ids.card).addHeaders("raw-id").setAbbr("Short");
Td("x").setHeaders(ids.card, "raw-id");
// @ts-expect-error — TableCellScope is closed; "colspan" is not a scope value
Th("x").setScope("colspan");
// @ts-expect-error — setAbbr is th-only; TdTag does not expose it
Td("x").setAbbr("nope");
// @ts-expect-error — `nope` is not a key in the defineIds registry
Td("x").setHeaders(ids.nope);

// ── Iframe security (RFC-B-03) ─────────────────────────────────────────────
Iframe().setSandbox("allow-scripts", "allow-same-origin");
Iframe().setSandbox();                                       // no args → sandbox=""
Iframe().setAllow({ geolocation: "'self'", camera: "*" });
Iframe().setAllow({});                                       // deny all
Iframe().setAllow();                                         // clear
// @ts-expect-error — SandboxToken is closed; "allow-form" is a typo
Iframe().setSandbox("allow-form");
// @ts-expect-error — a space-joined multi-token string is not a single SandboxToken
Iframe().setSandbox("allow-scripts allow-same-origin");
// @ts-expect-error — setAllow is record-only; the raw-string arm was removed
Iframe().setAllow("camera 'self'");

// ── Media completeness (RFC-B-01) ──────────────────────────────────────────
// crossorigin reuses the closed CrossOrigin | '' union; referrerpolicy the closed ReferrerPolicy.
Video().setCrossOrigin("anonymous");
Audio().setCrossOrigin("use-credentials");
Source().setWidth(1280).setHeight(720);   // string | number → String
Source().setWidth("1280");
Img().setReferrerPolicy("no-referrer");
Link().setReferrerPolicy("origin").setImagesrcset("a 1x").setImagesizes("100vw");
Script().setReferrerPolicy("origin");
Area().setReferrerPolicy("no-referrer");
Meta().setMedia("(prefers-color-scheme: dark)");
// @ts-expect-error — CrossOrigin is closed; "anonymouss" is not a member
Video().setCrossOrigin("anonymouss");
// @ts-expect-error — ReferrerPolicy is closed; "orig" is a typo
Img().setReferrerPolicy("orig");
// @ts-expect-error — setReferrerPolicy is deliberately NOT on SourceTag (<source> has no referrerpolicy)
Source().setReferrerPolicy("origin");

// ── Edit & quotation cite/datetime (RFC-B-02) ──────────────────────────────
// Factory return types are the narrow subclass, not widened to Tag, and chain via `this`.
expectType<InsTag>(Ins("x").setCite("/a").setDatetime("2026-06-29T10:00"));
expectType<DelTag>(Del("x").setCite("/a").setDatetime("2026-06-29"));
expectType<QTag>(Q("x").setCite("https://e.com/s"));
expectType<BlockquoteTag>(Blockquote("x").setCite("https://e.com/a"));
// Negative: the quotation elements have no `datetime` attribute — locks the
// cite-only vs cite+datetime split against a future copy-paste widening.
// @ts-expect-error — QTag exposes only setCite, not setDatetime
Q("x").setDatetime("2026-06-29");
// @ts-expect-error — BlockquoteTag exposes only setCite, not setDatetime
Blockquote("x").setDatetime("2026-06-29");
