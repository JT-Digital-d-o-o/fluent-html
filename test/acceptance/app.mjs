// The acceptance app (acceptance-matrix row 1 preconditions): a minimal Fastify
// server rendering every fixture page with fluent-html itself, under REAL strict
// CSP — per-request nonce + strict-dynamic, no unsafe-eval, no unsafe-inline —
// serving the PRODUCTION-BUILT minified runtime asset (built via
// buildBehaviorRuntime, which also compiles the jt:listboxNav framework pack)
// and a pinned htmx.
import Fastify from "fastify";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  render, Document, Head, Body, Title, Script, Style, Main,
  Div, Span, Button, Form, Input, A, Ul, Li, Empty, Dialog, P,
} from "../../dist/src/index.js";
import {
  behaviorStamp, buildBehaviorRuntime, fixtureIds,
} from "../../dist/src/behaviors/index.js";
import { createId } from "../../dist/src/ids.js";
import { registerAcceptanceExtensions, allBehaviors, listboxId } from "./registry.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 4783);

registerAcceptanceExtensions();
const built = await buildBehaviorRuntime({
  clientEntries: [join(here, "ext", "listbox.mjs")],
  outDir: join(here, ".assets"),
  publicPath: "/assets",
});
const assetSource = readFileSync(join(here, ".assets", built.fileName), "utf8");
const htmxSource = readFileSync(join(here, "..", "..", "node_modules", "htmx.org", "dist", "htmx.min.js"), "utf8");
const stamp = behaviorStamp();
const behaviors = new Map(allBehaviors().map((b) => [b.name, b]));

const arenaId = createId("arena");
const app = Fastify();
// htmx posts application/x-www-form-urlencoded; the harness ignores bodies.
app.addContentTypeParser("application/x-www-form-urlencoded", { parseAs: "string" }, (_req, body, done) =>
  done(null, body),
);

app.get("/assets/htmx.js", (_req, reply) => reply.type("text/javascript").send(htmxSource));
app.get(`/assets/${built.fileName}`, (_req, reply) =>
  reply.type("text/javascript").header("cache-control", "public, max-age=31536000, immutable").send(assetSource),
);

function page(reply, main, { htmx = true, pageStamp = stamp } = {}) {
  const nonce = randomBytes(16).toString("base64");
  const html = render(
    Document(
      Head(
        Title("fluent-behaviors acceptance"),
        htmx ? Script().setSrc("/assets/htmx.js").setNonce(nonce) : Empty(),
        Script().setSrc(`/assets/${built.fileName}`).setNonce(nonce).toggle("defer"),
        Style(".hidden{display:none}.fade-out{opacity:0;transition:opacity 60ms}"),
      ),
      Body(main),
    ).addAttribute("data-fluent-behaviors", pageStamp),
  );
  return reply
    .type("text/html")
    .header(
      "content-security-policy",
      `script-src 'nonce-${nonce}' 'strict-dynamic'; object-src 'none'; base-uri 'none'`,
    )
    .send(html);
}

// ── fixture arena ────────────────────────────────────────────────

function carrierFor(verb, fixture) {
  if (verb === "onEscape") {
    return Form(Input().setId("inner-input").setName("v")).setId("carrier").behavior(verb, fixture);
  }
  if (verb === "onClickOutside") {
    return Div(Span("panel-ish"), Input().setId("inside-input")).setId("carrier").behavior(verb, fixture);
  }
  if (verb === "resetOnSuccess") {
    return Form(Input().setId("form-input").setName("v"), Button("go").setType("submit").setId("submit-btn"))
      .setId("carrier")
      .behavior(verb)
      .addAttribute("hx-post", "/submit/ok")
      .addAttribute("hx-target", "#elsewhere")
      .addAttribute("hx-swap", "outerHTML");
  }
  if (verb === "jt:listboxNav") {
    return Input().setId("carrier").behavior(verb, fixture);
  }
  return Button("Trigger").setId("carrier").behavior(verb, fixture);
}

function arena(verb, i) {
  const fixture = behaviors.get(verb)?.fixtures[i];
  if (!fixture) return null;
  const closestRemove = verb === "remove" && i === 1;
  return Div(
    Div("panel content").setId(fixtureIds.panel),
    Div("second").setId(fixtureIds.second),
    Div("banner").setId(fixtureIds.banner),
    Div(Span("alert!"), closestRemove ? carrierFor(verb, fixture) : Empty())
      .setRole("alert")
      .setId("alert-wrap"),
    Div(
      A("drawer nav")
        .setId("drawer-nav")
        .addAttribute("href", "#")
        .addAttribute("hx-get", `/fx/${encodeURIComponent(verb)}/${i}/arena`)
        .addAttribute("hx-target", "#arena")
        .addAttribute("hx-swap", "outerHTML")
        .addAttribute("hx-push-url", "true"),
      Button("drawer btn").setId("drawer-btn"),
    ).setId(fixtureIds.drawerPanel),
    Div().setId(fixtureIds.drawerBackdrop),
    Button("cancel").setId(fixtureIds.cancel).behavior("toggle", { target: fixtureIds.panel }),
    Input().setId(fixtureIds.search),
    Ul(
      Li("one").setRole("option").setTabindex(-1),
      Li("two").setRole("option").setTabindex(-1),
      Li("three").setRole("option").setTabindex(-1),
    ).setId(listboxId),
    closestRemove ? Empty() : carrierFor(verb, fixture),
    Button("reload")
      .setId("reload-plain")
      .addAttribute("hx-get", `/fx/${encodeURIComponent(verb)}/${i}/arena`)
      .addAttribute("hx-target", "#arena")
      .addAttribute("hx-swap", "outerHTML"),
    Button("morph")
      .setId("reload-morph")
      .addAttribute("hx-get", `/fx/${encodeURIComponent(verb)}/${i}/arena`)
      .addAttribute("hx-target", "#arena")
      .addAttribute("hx-swap", "outerMorph"),
  ).setId(arenaId);
}

function fixturePage(verb, i) {
  const inner = arena(verb, i);
  if (!inner) return null;
  return Main(
    inner,
    Div("elsewhere-initial").setId("elsewhere"),
    Div("poll-initial").setId("poll"),
    Button("poll")
      .setId("poll-btn")
      .addAttribute("hx-get", "/poll")
      .addAttribute("hx-target", "#poll")
      .addAttribute("hx-swap", "outerHTML"),
    Button("remove arena").setId("remove-arena").behavior("remove", { target: arenaId }),
  );
}

app.get("/fx/:verb/:i", (req, reply) => {
  const view = fixturePage(req.params.verb, Number(req.params.i));
  return view ? page(reply, view) : reply.code(404).send("no such fixture");
});
app.get("/fx/:verb/:i/arena", (req, reply) => {
  const view = arena(req.params.verb, Number(req.params.i));
  return view ? reply.type("text/html").send(render(view)) : reply.code(404).send("no such fixture");
});
app.get("/poll", (_req, reply) => reply.type("text/html").send(render(Div("poll-fresh").setId("poll"))));
app.post("/submit/ok", (_req, reply) => reply.type("text/html").send(render(Div("submitted").setId("elsewhere"))));
app.post("/submit/invalid", (_req, reply) => reply.code(422).type("text/html").send(render(Div("invalid").setId("elsewhere"))));

// ── targeted-row pages ───────────────────────────────────────────

// Row 2: version skew — attributes from "vN+1" carrying an unknown verb.
app.get("/skew", (_req, reply) =>
  page(
    reply,
    Main(
      Div("panel content").setId(fixtureIds.panel),
      Button("future").setId("future").addAttribute("data-behavior", "futureVerb"),
      Button("Trigger").setId("carrier").behavior("toggle", { target: fixtureIds.panel }),
    ),
  ),
);

// Row 3: registry-hash handshake — page stamp deliberately wrong.
app.get("/stamp-mismatch", (_req, reply) =>
  page(
    reply,
    Main(
      Div("panel content").setId(fixtureIds.panel),
      Button("Trigger").setId("carrier").behavior("toggle", { target: fixtureIds.panel }),
    ),
    { pageStamp: "0.0.0:00000000" },
  ),
);

// Row 4: no-htmx profile (templates/web) — full non-lifecycle vocabulary, no htmx runtime.
app.get("/no-htmx", (_req, reply) =>
  page(
    reply,
    Main(
      Div("panel content").setId(fixtureIds.panel),
      Div(Button("in-drawer").setId("drawer-btn")).setId(fixtureIds.drawerPanel),
      Button("menu").setId("menu-btn").behavior("drawer", { target: fixtureIds.drawerPanel }),
      Button("Trigger").setId("carrier").behavior("toggle", { target: fixtureIds.panel }),
    ),
    { htmx: false },
  ),
);

// Row 6: capture-phase guarantee — descendant stopPropagation cannot suppress the carrier.
app.get("/capture", (_req, reply) =>
  page(
    reply,
    Main(
      Div("panel content").setId(fixtureIds.panel),
      Div(Button("inner").setId("inner-stop")).setId("carrier").behavior("toggle", { target: fixtureIds.panel }),
    ),
  ),
);

// Row 7: nested carriers — clipboard button inside a toggle row.
app.get("/nested", (_req, reply) =>
  page(
    reply,
    Main(
      Div("panel content").setId(fixtureIds.panel),
      Div(
        Span("row"),
        Button("copy").setId("copy-btn").behavior("clipboard", { value: "nested-copy" }),
      ).setId("carrier").behavior("toggle", { target: fixtureIds.panel }),
    ),
  ),
);

// Rows 8/14: conditional keyboard consumption — listbox inside an onEscape form,
// optionally all inside a drawer.
function listboxEscapeView({ inDrawer }) {
  const listbox = [
    Input().setId("lb-input").setName("q").behavior("jt:listboxNav", { list: listboxId, itemSelector: "[role=option]" }),
    Ul(
      Li("one").setRole("option").setTabindex(-1),
      Li("two").setRole("option").setTabindex(-1),
    ).setId(listboxId),
  ];
  const cancel = Button("cancel").setId(fixtureIds.cancel).behavior("toggle", { target: fixtureIds.panel });
  const core = [Div("panel content").setId(fixtureIds.panel), cancel];
  if (!inDrawer) {
    // Row 8: the listbox input sits inside an onEscape(action:click→cancel) form.
    const form = Form(...listbox)
      .setId("lb-form")
      .behavior("onEscape", { action: "click", target: fixtureIds.cancel, scope: "self" });
    return Main(...core, form);
  }
  // Row 14: suggestions inside an open drawer — Escape closes the innermost
  // active thing first (suggestions), the drawer on the next press.
  return Main(
    ...core,
    Div(...listbox).setId(fixtureIds.drawerPanel),
    Button("menu").setId("menu-btn").behavior("drawer", { target: fixtureIds.drawerPanel, closeOn: ["escape"] }),
  );
}
app.get("/listbox-escape", (_req, reply) => page(reply, listboxEscapeView({ inDrawer: false })));
app.get("/drawer-escape", (_req, reply) => page(reply, listboxEscapeView({ inDrawer: true })));

// Row 5: focus verb / focus-event remap — event:"focus" resolved to focusin at
// emit; the non-bubbling original still dispatches via focusin delegation.
app.get("/focus-remap", (_req, reply) =>
  page(
    reply,
    Main(
      Div("panel content").setId(fixtureIds.panel),
      Input().setId("carrier").behavior("toggle", { target: fixtureIds.panel, event: "focus" }),
    ),
  ),
);

// Row 13: sibling drawers.
app.get("/drawers2", (_req, reply) =>
  page(
    reply,
    Main(
      Div(Button("a-btn").setId("a-btn")).setId("drawer-a"),
      Div(Button("b-btn").setId("b-btn")).setId("drawer-b"),
      Div().setId("backdrop-a"),
      Div().setId("backdrop-b"),
      Button("open A").setId("open-a").behavior("drawer", { target: createId("drawer-a"), backdrop: createId("backdrop-a"), bodyClass: "lock-a" }),
      Button("open B").setId("open-b").behavior("drawer", { target: createId("drawer-b"), backdrop: createId("backdrop-b"), bodyClass: "lock-b" }),
    ),
  ),
);

// Row 19b/19c: resetOnSuccess — 422 and full-arena morph variants.
app.get("/reset-invalid", (_req, reply) =>
  page(
    reply,
    Main(
      Form(Input().setId("form-input").setName("v"), Button("go").setType("submit").setId("submit-btn"))
        .setId("carrier")
        .behavior("resetOnSuccess")
        .addAttribute("hx-post", "/submit/invalid")
        .addAttribute("hx-target", "#elsewhere")
        .addAttribute("hx-swap", "outerHTML"),
      Div("elsewhere-initial").setId("elsewhere"),
    ),
  ),
);
app.get("/reset-morph", (_req, reply) =>
  page(
    reply,
    Main(
      Div(
        Form(Input().setId("form-input").setName("v"), Button("go").setType("submit").setId("submit-btn"))
          .setId("carrier")
          .behavior("resetOnSuccess")
          .addAttribute("hx-post", "/reset-morph/arena")
          .addAttribute("hx-target", "#arena")
          .addAttribute("hx-swap", "outerMorph"),
      ).setId("arena"),
    ),
  ),
);
app.post("/reset-morph/arena", (_req, reply) =>
  reply.type("text/html").send(
    render(
      Div(
        Form(Input().setId("form-input").setName("v"), Button("go").setType("submit").setId("submit-btn"))
          .setId("carrier")
          .behavior("resetOnSuccess")
          .addAttribute("hx-post", "/reset-morph/arena")
          .addAttribute("hx-target", "#arena")
          .addAttribute("hx-swap", "outerMorph"),
      ).setId("arena"),
    ),
  ),
);

// Row 20: remove + animateOut with and without a matching transition.
app.get("/remove-animate", (_req, reply) =>
  page(
    reply,
    Main(
      Div("with transition").setId("anim-yes"),
      Div("no transition").setId("anim-no"),
      Button("x1").setId("rm-yes").behavior("remove", { target: createId("anim-yes"), animateOut: "fade-out" }),
      Button("x2").setId("rm-no").behavior("remove", { target: createId("anim-no"), animateOut: "not-a-transition", animateOutTimeoutMs: 120 }),
    ),
  ),
);

// Row 21 (+ the ADR-05 precedence row): onEscape scope:document fires with
// focus outside the carrier; an open drawer's close path preempts it.
app.get("/esc-doc", (_req, reply) =>
  page(
    reply,
    Main(
      Div("panel content").setId(fixtureIds.panel),
      Button("cancel").setId(fixtureIds.cancel).behavior("toggle", { target: fixtureIds.panel }),
      Form(Input().setId("inner-input")).setId("carrier").behavior("onEscape", { action: "click", target: fixtureIds.cancel, scope: "document" }),
      Input().setId("outside-input"),
      Div(Button("in-drawer").setId("drawer-btn")).setId(fixtureIds.drawerPanel),
      Button("menu").setId("menu-btn").behavior("drawer", { target: fixtureIds.drawerPanel, closeOn: ["escape"] }),
    ),
  ),
);

// Row 23: anchor semantics — a non-preventDefault verb navigates; back pops history.
app.get("/anchor", (_req, reply) =>
  page(
    reply,
    Main(
      Div("panel content").setId(fixtureIds.panel),
      A("go").setId("nav-toggle").addAttribute("href", "/page2").behavior("toggle", { target: fixtureIds.panel }),
      A("back").setId("go-back").addAttribute("href", "/never").behavior("back"),
    ),
  ),
);
app.get("/page2", (_req, reply) => page(reply, Main(Div("page two").setId("page2"))));

// Row 24: multi-verb element, declaration order.
app.get("/multi", (_req, reply) =>
  page(
    reply,
    Main(
      Div("panel content").setId(fixtureIds.panel),
      Button("both")
        .setId("carrier")
        .behavior("toggleClass", { target: fixtureIds.panel, class: "tooltip-visible" })
        .behavior("clipboard", { value: "multi-copy" }),
    ),
  ),
);

// Row 28: native tier — Invoker Commands + <dialog closedby>.
app.get("/native-dialog", (_req, reply) => {
  const dialogId = createId("confirm-dialog");
  return page(
    reply,
    Main(
      Button("Delete…").setId("open-dialog").setType("button").setCommand("show-modal").setCommandfor(dialogId),
      Dialog(P("sure?"), Button("close").setId("close-dialog").setCommand("close").setCommandfor(dialogId))
        .setId(dialogId)
        .setClosedby("any"),
    ),
  );
});

app.listen({ port: PORT, host: "127.0.0.1" }).then(() => {
  console.log(`acceptance app on :${PORT} (asset ${built.fileName}, stamp ${stamp})`);
});
