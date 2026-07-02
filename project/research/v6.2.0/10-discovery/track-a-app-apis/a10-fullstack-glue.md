# Track A — App APIs · Full-stack glue (a10)

Lens scope: controller↔view contracts, `renderView`, error/flash/toast, redirect-after-post, htmx-aware redirects, partial responses, shell-vs-fragment — framework-layer ergonomics mined from `pm-gui` (v6) and `planet-positive-sport` (v5).

Method note: every consumer wires fluent-html into Fastify with a hand-rolled `renderView` decorator and a `handle()` shim. Those are framework-integration code and deliberately out of fluent-html core per memory (`fluent-html-no-context-no-framework-glue` — Fastify glue lives in a future `@fluent-html/fastify`). So the bar here is: a primitive that belongs in the *renderer/htmx* layer (framework-agnostic), not a Fastify decorator. The findings below are scoped to that.

---

## 1. htmx-aware redirect is hand-rolled in every app

**Problem / evidence.** A 3xx `Location` redirect is silently swallowed by htmx (fetch follows it, swaps the followed body into the target, URL never updates), so every app converts redirects to `HX-Redirect` by hand.

- `pm-gui/src/core/server.ts:46-57` — a global `onSend` hook reads `hx-request`, checks `300<=status<400` + a string `location`, then rewrites to `reply.code(200).header("HX-Redirect", location).removeHeader("location")` and returns `""`.
- `planet-positive-sport/src/admin/questionnaires/questionnaires.utils.ts:179-186` (`redirectToEditor`) and `src/files/files.controller.ts` do the inverse by hand: build `hxResponse(Empty()).redirect(url).build()`, then `reply.headers(headers); reply.renderView(html)`.
- `planet-positive-sport/src/settings/settings.controller.ts:333-340` — yet another variant: `if (request.headers["hx-request"]) { reply.header("HX-Refresh","true"); reply.code(204) }` else `reply.redirect(referer)`.

Three apps, three different hand-rolled encodings of the same htmx redirect/refresh contract. The decision (status, header name, the `""` body, the 200 rewrite) is pure htmx protocol, not app logic.

**Proposed API.** A framework-agnostic descriptor + serializer in the htmx layer (the Fastify decorator that consumes it lives in `@fluent-html/fastify`, but the *encoding* is the library's):

```ts
// emits the header map htmx expects; no Fastify dependency
hxRedirect(url: string): { status: 200; headers: { "HX-Redirect": string }; body: "" }
hxRefresh():            { status: 200; headers: { "HX-Refresh": "true" }; body: "" }
// the "should I even convert?" predicate, so the onSend hook isn't hand-written
isHtmxRequest(headers: Record<string, string | string[] | undefined>): boolean
```

Plus extend `HxResponse` (already in lib) with the *terminal* shape so a consumer never re-derives the 200/empty-body rule — see finding 2.

**Before / after.**

```ts
// before — pm-gui/src/core/server.ts
server.addHook("onSend", async (request, reply, payload) => {
  const status = reply.statusCode;
  const location = reply.getHeader("location");
  if (request.headers["hx-request"] === "true" && status >= 300 && status < 400 && typeof location === "string") {
    reply.code(200).header("HX-Redirect", location).removeHeader("location");
    return "";
  }
  return payload;
});

// after
server.addHook("onSend", async (request, reply, payload) => {
  const loc = reply.getHeader("location");
  if (isHtmxRequest(request.headers) && reply.statusCode >= 300 && reply.statusCode < 400 && typeof loc === "string") {
    const { status, headers } = hxRedirect(loc);
    reply.code(status).headers(headers).removeHeader("location");
    return "";
  }
  return payload;
});
```

**Already in lib?** No. `HxResponse.redirect()`/`.refresh()` set the *headers* but there is no `isHtmxRequest` predicate and no terminal status/empty-body convention — the apps re-derive both. Not in CHANGELOG 6.0.0→6.1.1.

**Value:** high (every htmx SSR app hits this on the very first redirect-after-POST; getting it wrong is a silent "URL doesn't change" bug). **Effort:** small.

---

## 2. `hxResponse(...).build()` → reply ceremony is re-spread in every call site

**Problem / evidence.** `hxResponse` already exists (`patterns.ts:140`) and is genuinely used in PPS, but every call site repeats the same three-line spread to get it onto the reply:

```ts
// planet-positive-sport/src/files/files.controller.ts:25-31 (inlineError)
const { html, headers } = hxResponse(Empty()).reswap("none").trigger("showToast", { message, type: "error" }).build();
reply.status(status).headers(headers);
return reply.renderView(html);

// planet-positive-sport/src/admin/questionnaires/questionnaires.utils.ts:180-185 (redirectToEditor)
const { html, headers } = hxResponse(Empty()).redirect(...).build();
reply.headers(headers);
reply.renderView(html);
```

The JSDoc on `hxResponse` itself (`patterns.ts:128-138`) ships the same boilerplate as the canonical example: `Object.entries(response.headers).forEach(([k,v]) => res.setHeader(k,v)); res.send(response.html)`. So the library *documents* the ceremony rather than removing it. `build()` returns a `{ html, headers }` bag that the caller must always destructure and re-apply.

**Proposed API.** Make `HxResponse` directly consumable by the renderer so `reply.renderView` (or a future `reply.renderHx`) can take the builder itself — no destructure. Two small library moves:

```ts
// (a) render() already accepts View; let it accept an HxResponse too,
//     pulling html from .build() — so renderView(hxResponse(...).trigger(...)) just works
render(...views: (View | HxResponse)[]): string

// (b) HxResponse gains a terminal accessor the Fastify decorator reads in one shot:
HxResponse.status: number   // 200 default; 3xx-free (htmx headers carry intent)
// reply decorator: reply.renderView(r: View | HxResponse) sets headers+status when given a builder
```

This keeps core framework-free (the renderer learns one new input type) while letting the thin Fastify decorator collapse the three lines to one.

**Before / after.**

```ts
// before
const { html, headers } = hxResponse(Empty()).reswap("none").trigger("showToast", { message, type: "error" }).build();
reply.status(status).headers(headers);
return reply.renderView(html);

// after — reply.renderView learns to drain an HxResponse's headers itself
return reply.status(status).renderView(
  hxResponse(Empty()).reswap("none").trigger("showToast", { message, type: "error" }),
);
```

**Already in lib?** Partially — `hxResponse` and all the header chainers (`trigger`/`redirect`/`refresh`/`retarget`/`reswap`/`reselect`/`location`/`pushUrl`) shipped pre-6.0. What's missing is the renderer accepting the builder so the `{html, headers}` destructure-and-reapply disappears. Not in 6.0.0→6.1.1.

**Value:** medium (removes a 3-line tax from every header-bearing htmx response; the builder is already the recommended path). **Effort:** small.

---

## 3. Shell-vs-fragment Layout selection on `HX-Request` is hand-rolled (and the two apps diverge)

**Problem / evidence.** The single most load-bearing full-stack-glue decision in an htmx SSR app is "full document on a hard nav, headless fragment on an htmx swap." Both apps solve it, differently and by hand:

- `pm-gui/src/core/layout/layout.view.ts:135-140` — `Layout` reads a request-scoped context: `if (htmxRequest.current) return [Title(...), mainContent]; return Shell(...)`. The context is populated by a bespoke Fastify plugin (`src/core/htmx/htmx-request.plugin.ts`) that pushes/pops a `createContext(false)` scope on `onRequest`/`onResponse` and threads a `Disposable` through `request._htmxDispose`.
- `planet-positive-sport/src/shared/components/layouts/app-layout.view.ts:84-90` — `AppLayout` **always** returns the full `[Raw("<!DOCTYPE html>"), HTML(head, body)]`. No fragment branch at all, so an htmx swap re-ships `<head>`, fonts, and `<script>` tags on every navigation (the swap target is `#main-content` inside, so it mostly works, but the wasted bytes + duplicate `<title>`/`HtmxConfig` are a known smell). The v5 app simply never built the optimization the v6 app hand-rolled.

So the pattern is (a) universal, (b) error-prone enough that a mature app skipped it, and (c) requires a chunk of framework plumbing (context + dispose plugin) to do right. This is the strongest candidate for a first-class primitive.

**Proposed API.** A control-flow combinator that branches the *view tree* on htmx-ness, fed an explicit boolean (keeps core framework-free — the caller passes `isHtmxRequest(req.headers)`; no ambient context required, unlike pm-gui's plugin):

```ts
// returns the fragment children on an htmx swap, the full shell otherwise.
// `head` extras (title) ride along on the fragment so the tab title still updates.
Shell(opts: {
  isHtmx: boolean,
  document: (inner: View) => View,   // wraps fragment in <html><head>…</head><body>…
  fragment: View,                    // the #main-content subtree
  fragmentHead?: View,               // e.g. Title(...) re-emitted on swap
}): View
```

Equivalently a thinner `htmxSwitch(isHtmx, fullView, fragmentView)` combinator. Either removes the bespoke `htmxRequest` context + the disposable plugin entirely — the boolean is passed at the one call site that already knows it.

**Before / after.**

```ts
// before — pm-gui Layout + a whole htmx-request.plugin.ts (createContext + Disposable plumbing)
if (htmxRequest.current) return [Title(formatTitle(props.title)), mainContent];
return Shell({ title: props.title, mainContent });

// after — boolean passed in; no ambient context, no dispose plugin
return Shell({
  isHtmx: props.isHtmx,
  fragment: mainContent,
  fragmentHead: Title(formatTitle(props.title)),
  document: (inner) => Document(DocumentHead({ title: props.title }), Body(LoadingBar(), inner)).setLang("en"),
});
```

**Already in lib?** No. fluent-html ships `Partial` (htmx 4 OOB) and `Match`/`IfThenElse`, but nothing that expresses the document-vs-fragment fork, and the memory note (`fluent-html-no-context-no-framework-glue`) explicitly wants this *off* an ambient context — a pure combinator fits that constraint where pm-gui's context-plugin does not. Not in 6.0.0→6.1.1.

**Value:** high (universal htmx-SSR concern; one app got it wrong by omission, the other paid a context+plugin tax). **Effort:** medium (it's a combinator, but the head-merge semantics — what rides on the fragment — need care).

---

## Considered and rejected (not findings)

- **App page-context bundle** (`getGitStatus(env.PM_TARGET), loadNavCounts(env.PM_TARGET)` repeated in 7 pm-gui renders, `task.controller.ts:28`, `scope.controller.ts:23`, etc.). Real duplication but it's *app-domain* data threading, not a fluent-html primitive — belongs in the app's own controller helper. Out of lens for the library.
- **Body coercion boilerplate** (`(request.body ?? {}) as Record<string,string>` ×10, `.replace(/\/+$/,"")` ×14 in pm-gui). This is Fastify request parsing, squarely framework-layer, not renderer/htmx.
- **error-as-toast via `HX-Trigger showToast`** (`files.controller.ts` `inlineError`). Only 2 call sites in one app — not enough signal, and it's already expressible with `hxResponse().reswap("none").trigger(...)` (finding 2 covers the ergonomic tax).
- **`renderView` reply decorator / `handle()` shim** — both apps hand-roll these, but they are exactly the Fastify glue the memory note parks for `@fluent-html/fastify`. Not a v6.2.0 core proposal.

## Top picks

- **htmx-aware redirect primitive** (`isHtmxRequest` + `hxRedirect`/`hxRefresh` terminal descriptors) — high value, small effort, hit by every app on the first redirect-after-POST.
- **`Shell` / `htmxSwitch` document-vs-fragment combinator** — high value; replaces a bespoke context+dispose plugin and fixes the v5 app's skipped optimization, while respecting the "no ambient context" constraint.
- **`render()` / `renderView` accept an `HxResponse`** — medium value, small effort; deletes the `{html, headers}` destructure-and-reapply tax the library currently documents as the happy path.
