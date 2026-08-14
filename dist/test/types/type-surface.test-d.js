// Compile-only type tests (F-D-123). No runtime assertions — these are checked by `tsc`
// during `npm run build` (test/** is in the tsconfig). A `@ts-expect-error` whose line
// stops erroring (e.g. a closed union gets widened, or Form<T>/route-param narrowing
// breaks) becomes an "unused directive" error and FAILS the build. This makes
// "a typo is a compile error" an enforced contract, not a comment.
import { hx, Img, Link, Dialog, Div, Button, Form, defineRoutes, defineIds, ForEachKeyed, Li, Iframe, Input, Svg, Path, Circle, Video, Audio, Source, Meta, Script, Area, Th, Td, Select, Output, Textarea, Ins, Del, Q, Blockquote, } from "../../src/index.js";
import { assetUrl } from "../../src/htmx.js";
const ids = defineIds(["card"]);
// `_`-prefixed param is exempt from noUnusedParameters; statements below are expressions, not bindings.
const expectType = (_v) => undefined;
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
Button().setCommand("--author-cmd"); // the spec `--${string}` author arm
// @ts-expect-error — a non-`--` custom command is rejected
Button().setCommand("custom");
// setFormmethod widened to FormMethod (get | post | dialog), not bare string
Button().setFormmethod("dialog");
// @ts-expect-error — "put" is not a FormMethod
Button().setFormmethod("put");
// ── Open unions: canonical AND custom both compile (the (string & {}) tail) ─
Link().setRel("preconnect");
Link().setRel("vendor-custom-rel"); // open — still compiles
Form((f) => [
    f.input("email", "email"),
    f.checkbox("agree"),
    // @ts-expect-error — "emial" is not a key of CreateUserReq
    f.input("emial", "email"),
    // @ts-expect-error — "agreee" is not a key of CreateUserReq
    f.checkbox("agreee"),
]);
// ── Routes: F-D-140 enum params + F-D-141 path-checked keys + scalar kinds ──
const r = defineRoutes("/orders", {
    detail: { method: "get", path: "/:id", params: { id: "number" } },
    byStatus: { method: "get", path: "/:status", params: { status: ["open", "paid", "void"] } },
});
// scalar number param
expectType(r.detail.resolve({ id: 42 }));
// @ts-expect-error — id is number, not string
r.detail.resolve({ id: "42" });
// enum param narrows to its member union
expectType(r.byStatus.resolve({ status: "open" }));
// @ts-expect-error — "shipped" is not in the ["open","paid","void"] enum
r.byStatus.resolve({ status: "shipped" });
// F-D-141: a params key that is not a :param in the path is a compile error
defineRoutes({
    bad: {
        method: "get",
        path: "/u/:id",
        // @ts-expect-error — "ic" is not a :param in "/u/:id" (was a silent no-op before)
        params: { ic: "number" },
    },
});
// ── Styling/control: :has() variant, viewTransitionName, ForEachKeyed ──────
Div().variant("has-[:checked]", { bg: "blue-50" }); // F-B-180 relational hook
Div().viewTransitionName("hero"); // F-B-181 string
Div().viewTransitionName(ids.card); // F-B-181 Id overload
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
Div().setRole("mark"); // F-B-143 — WAI-ARIA 1.2/1.3 role autocompletes
Input().setEnterkeyhint("send");
// @ts-expect-error — EnterKeyHint is closed
Input().setEnterkeyhint("nope");
Div().setContenteditable("plaintext-only");
// @ts-expect-error — ContentEditable is closed
Div().setContenteditable("maybe");
Div().text("px", 13); // F-C-160 unit overload
Div().leading("rem", 1.5);
Div().underlineOffset("px", 2);
Button().setForm(ids.card); // setForm accepts string | Id
Input().setList(ids.card); // Id-typed datalist ref
Iframe().setReferrerPolicy("no-referrer");
// @ts-expect-error — ReferrerPolicy is closed
Iframe().setReferrerPolicy("bogus-policy");
// ── Closed sizing unions (F-D-900) — typos error; arbitrary values still work ──
Div().w("full");
Div().w("[37px]"); // arbitrary via the bracket arm (TailwindSpacing)
Div().w("px", 13); // (unit, amount) overload
Div().minW("[200px]"); // the 3 standalone unions got an explicit [..] arm
Div().maxW("[60ch]");
// @ts-expect-error — TailwindWidth is now closed; "brnad" is a typo, not a dead class
Div().w("brnad");
// @ts-expect-error — TailwindMinWidth is closed
Div().minW("nope");
// @ts-expect-error — TailwindMaxWidth is closed
Div().maxW("hyooge");
// ── Track-C closed unions: canonical compiles, typo errors ──
// Color family
Svg(Path()).fill("current");
Circle().stroke("red-500");
Div().fill("[#1a2b3c]");
Div().stroke("px", 1.5);
Div().decoration("from-font");
// @ts-expect-error — TailwindColor closed
Div().fill("nope");
// @ts-expect-error — v4 ships no stroke-3
Div().stroke(3);
// @ts-expect-error — TailwindDecorationStyle closed
Div().decoration("squiggly");
// Inset shorthands
Div().insetX("0");
Div().insetY("rem", 1.5);
// @ts-expect-error — TailwindInset closed
Div().insetS("nope");
// Typography & text effects
Div().text("balance");
Div().textShadow("lg/30");
// @ts-expect-error — not in TailwindTextWrap
Div().text("baalance");
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
// Transitions
Div().delay("150");
Div().transition("discrete");
Div().transition("all"); // property group and behavior are one merged method
// @ts-expect-error — neither a property group nor a behavior
Div().transition("fast");
// Gradients
Div().from("indigo-500", "10%");
Div().bgLinear(45);
Div().bgLinear(-65);
Div().bgLinear("to-r", "oklch");
Div().bgRadial("top-left");
// @ts-expect-error — angle goes through gradientLinear, not the keyword union
Div().bgLinear("45");
// @ts-expect-error — direction keyword union is closed
Div().bgLinear("to-rr");
// @ts-expect-error — interpolation typo
Div().bgLinear("to-r", "oklhc");
// @ts-expect-error — off-ladder stop must use the [..] form
Div().from("indigo-500", "ten");
// Long-tail variant names on .variant()
Div().variant("aria-checked", { bg: "blue-50" });
Div().variant("group-hover/item", { opacity: 100 });
Div().variant("nth-3", {});
Div().variant("*", { p: "4" });
Div().variant("@sm", { flex: true });
Div().variant("@lg/sidebar", {});
// @ts-expect-error — typo'd aria boolean head
Div().variant("aria-pressd", {});
// @ts-expect-error — bare data- form omitted (use data-[…])
Div().variant("data-open", {});
// @ts-expect-error — @8xl is outside the @3xs..@7xl scale
Div().variant("@8xl", {});
// 3D transforms (depth gate + translate-z stay; per-axis leaves pruned in 8.0.0)
Div().transform("3d");
Div().translate("z", "-px");
// @ts-expect-error — TailwindPerspective closed
Div().perspective("dramtic");
// @ts-expect-error — translate-z has no numeric arm
Div().translate("z", 12);
// Layout
Div().colStart(-1);
Div().rowSpan("full");
Div().columns("xs");
Div().breakInside("avoid");
// @ts-expect-error — TailwindGridLine closed
Div().colStart("aut");
// @ts-expect-error — use "avoid-page", not "page"
Div().breakInside("page");
// ── Escape-hatch gap fills (llm-styling/escape-hatch) ──────────────────────
Div().appearance("none");
Input().appearance("auto");
// @ts-expect-error — TailwindAppearance is closed
Div().appearance("non");
Div().wrap("break-word");
Div().wrap("anywhere");
// @ts-expect-error — TailwindWrap is overflow-wrap; "break-all" is word-break (.breakAll())
Div().wrap("break-all");
// ── Evidence-based backlog promotions (2026-08-03) ─────────────────────────
Div().table();
Div().table("auto");
Div().table("fixed");
// @ts-expect-error — TailwindTable is closed ("auto" | "fixed")
Div().table("collapse");
Div().tableCell();
Div().tableRow();
Div().divide("red-500");
// @ts-expect-error — .divide() takes a color, widths live on .divideX()/.divideY()
Div().divide("2");
Div().invisible();
Div().hidden().sm({ tableCell: true });
Div().divideY().hover({ divide: "slate-200" });
Div().before({ content: true }); // true → content-['']
Div().content("none");
Div().content("[attr(data-label)]");
// @ts-expect-error — TailwindContent is none | [..] (bare for the empty string)
Div().content("empty");
// Arbitrary selector variant on .variant() — verbatim pass-through
Div().variant("[&>li]", { p: "2" });
Div().variant("[&_svg]", { w: "4" });
// @ts-expect-error — an arbitrary selector must anchor on & ("[li]" is not a variant)
Div().variant("[li]", {});
// TailwindFontFamily is CLOSED: built-ins + declared tokens + [..] only
Div().font("mono");
Div().font("[Inter,sans-serif]");
// @ts-expect-error — undeclared family; declare it via defineTheme `fonts`
Div().font("comic-sans");
// Typed escapes: cssProp property union is generated + closed (custom-property arm open)
Div().cssProp("mask-repeat", "no-repeat");
Div().cssProp("--brand-glow", "0 0 4px red");
Div().cssClass("js-map-container");
// @ts-expect-error — "mask-repeet" is not a CSS property name
Div().cssProp("mask-repeet", "no-repeat");
// @ts-expect-error — camelCase is rejected; the union is kebab-case
Div().cssProp("maskRepeat", "no-repeat");
// ── Form-control completeness (RFC-B-05) ───────────────────────────────────
// FormEnctype is the one CLOSED union here — negatives are real compile errors.
Button().setFormenctype("multipart/form-data").setFormtarget("_blank");
Form().setEnctype("text/plain");
// @ts-expect-error — FormEnctype is closed; "text/plian" is a typo
Button().setFormenctype("text/plian");
// @ts-expect-error — FormEnctype is closed (FormTag.setEnctype shares the union)
Form().setEnctype("text/plian");
// The open-tail unions: assert POSITIVES only — a @ts-expect-error here would itself
// fail to compile, because the (string & {}) tail accepts any string (no typo rejection).
Input().setAccept("image/png");
Input().setAccept(["image/png", "image/jpeg"]);
Input().setAutocomplete("cc-number");
Input().setAutocomplete("shipping postal-code");
Input().setAutocomplete("username webauthn");
Select().setAutocomplete("country");
Textarea().setDirname("comment.dir");
Input().setDirname("title.dir");
Output().setFor(ids.card, "raw-id");
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
Iframe().setSandbox(); // no args → sandbox=""
Iframe().setAllow({ geolocation: "'self'", camera: "*" });
Iframe().setAllow({}); // deny all
Iframe().setAllow(); // clear
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
Source().setWidth(1280).setHeight(720); // string | number → String
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
expectType(Ins("x").setCite("/a").setDatetime("2026-06-29T10:00"));
expectType(Del("x").setCite("/a").setDatetime("2026-06-29"));
expectType(Q("x").setCite("https://e.com/s"));
expectType(Blockquote("x").setCite("https://e.com/a"));
// Negative: the quotation elements have no `datetime` attribute — locks the
// cite-only vs cite+datetime split against a future copy-paste widening.
// @ts-expect-error — QTag exposes only setCite, not setDatetime
Q("x").setDatetime("2026-06-29");
// @ts-expect-error — BlockquoteTag exposes only setCite, not setDatetime
Blockquote("x").setDatetime("2026-06-29");
// ── Canonical names (llm-styling): merged-method discrimination ────────────
// Positive: each merged method accepts every family it absorbed.
Div().text("lg").text("red-500").text("center").text("balance");
Div().font("bold").font("mono");
Div().border("2").border("dashed").border("red-500").border("top", "red-500");
Div().ring("2").ring("blue-300/50");
Div().shadow("md").shadow("red-500");
Div().stroke("red-500").stroke("2");
Div().decoration("red-500").decoration("wavy").decoration("2");
Div().flex().flex("1").flex("col").flex("wrap");
Div().list("disc").list("inside");
Div().outline("hidden");
Div().bgLinear("to-r").bgLinear(45, "oklch");
Div().px("4").mx("auto").mt("2").pt("px", 12);
// Negative: the unions stay disjoint and closed — a wrong-family or typo'd
// value is a compile error, not a dead class.
// @ts-expect-error — ring widths are the closed 0|1|2|3|4|8 ladder; "500" is a shade, not a width
Div().ring("500");
// @ts-expect-error — "bold" is a font value, not a text value
Div().text("bold");
// @ts-expect-error — TailwindFontFamily is closed; raw font names need the [..] arm
Div().font("Arial");
// @ts-expect-error — "wavy" is a decoration style, not a border style
Div().border("wavy");
// @ts-expect-error — "center" is not a flex value (it's justify/items)
Div().flex("center");
// @ts-expect-error — "outside-in" is not a list value
Div().list("outside-in");
// @ts-expect-error — margin-only "auto" is rejected on padding shorthands
Div().px("auto");
// @ts-expect-error — directional shorthands take the spacing scale, not width keywords
Div().mt("full");
// @ts-expect-error — angle is a number; a string angle needs the direction keywords or [..]
Div().bgLinear("45deg");
// ── Object variants (llm-styling/object-variants) ──────────────────────────
// Positive: keys are the canonical style names; values are the same closed
// unions the methods take; nested tier-1 names stack; tuples for multi-arg.
Div().hover({ bg: "blue-600", scale: "105", truncate: true });
Div().md({ px: "8", text: "lg", hover: { bg: "blue-700" } });
Div().md({ hover: { first: { bg: "amber-50" } } }); // two-level nesting
Div().hover({ bg: cond() ? "blue-600" : undefined }); // conditional value
Div().hover({ italic: cond() }); // boolean flag form
Div().focus({ ring: true }); // optional-value utility bare form
Div().focus({ ring: 2 });
Div().hover({ border: ["top", "red-500"] }); // side + color tuple
Div().hover({ gradient: ["red-500", "blue-500", "to-br"] }); // multi-arg tuple
Div().hover({ translateY: "-0.5", rotate: -45 }); // flattened axis keys, sign values
Div().hover({ cssProp: ["--glow", "0 0 4px"] }); // escape hatch composes
Div().before({ content: true, w: "2" });
Div().md({ xl2: { p: "4" } }); // xl2 nested key
Div().xl2({ p: "4" });
Div().variant("data-[state=open]", { rounded: "lg" });
Div().variant("aria-[busy]", { opacity: "50" });
// An extracted const pins itself with `satisfies` (excess-property checking
// doesn't reach through a plain variable).
const glowPreset = { shadow: "lg", ring: 2 };
Div().hover({ ...glowPreset, bg: "blue-600" });
// Negative: keys and values are spell-checked at every literal use — no
// silent dead classes, no unprefixed emissions.
// @ts-expect-error — key typo: 'opcaity' (did you mean 'opacity'?)
Div().hover({ opcaity: "50" });
// @ts-expect-error — value typo: "blue-60" is not a Tailwind shade
Div().hover({ bg: "blue-60" });
// @ts-expect-error — key typo two levels deep: nested objects are spell-checked too
Div().md({ hover: { opcaity: "50" } });
// @ts-expect-error — a style key takes a value, not a nested object (TS2322)
Div().hover({ bg: { md: "blue-600" } });
// @ts-expect-error — "hovr" is not a tier-1 variant or style key
Div().md({ hovr: { bg: "blue-600" } });
// @ts-expect-error — border side tuple needs a width or color as its second member
Div().hover({ border: ["top"] });
// @ts-expect-error — gradient needs at least [from, to]
Div().hover({ gradient: ["red-500"] });
// @ts-expect-error — "2xl" is spelled xl2 as a member (exact spelling via .variant("2xl", …))
Div().md({ "2xl": { p: "4" } });
// @ts-expect-error — variant name typo on the generic form
Div().variant("hovr", { bg: "blue-600" });
// ── T3: preload/optimistic are gone — they never existed in the htmx 4 runtime ──
hx(assetUrl("/x"), {});
// @ts-expect-error — hx-preload is not an htmx 4 attribute (T3)
hx(assetUrl("/x"), { preload: true });
// @ts-expect-error — hx-optimistic is not an htmx 4 attribute (T3)
hx(assetUrl("/x"), { optimistic: true });
// ── T2: the default palette stays ON without an opt-out augmentation ──
// (The opt-out arm compiles separately in test/types/color-optout — module
// augmentation is global, so both states can't share one compilation.)
Div().bg("blue-600").text("gray-900").border("slate-200/50");
//# sourceMappingURL=type-surface.test-d.js.map