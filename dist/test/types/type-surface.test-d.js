// Compile-only type tests (F-D-123). No runtime assertions — these are checked by `tsc`
// during `npm run build` (test/** is in the tsconfig). A `@ts-expect-error` whose line
// stops erroring (e.g. a closed union gets widened, or Form<T>/route-param narrowing
// breaks) becomes an "unused directive" error and FAILS the build. This makes
// "a typo is a compile error" an enforced contract, not a comment.
import { Img, Link, Dialog, Div, Button, Form, defineRoutes, defineIds, ForEachKeyed, Li, Iframe, Input, } from "../../src/index.js";
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
Div().on("has-[:checked]", (t) => t.background("blue-50")); // F-B-180 relational hook
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
Div().textSize("px", 13); // F-C-160 unit overload
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
//# sourceMappingURL=type-surface.test-d.js.map