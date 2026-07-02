# elements-symmetry-4 — Refuter 2 verdict: NOT REFUTED (confirmed by reproduction)

**Mode:** refute-by-reproduction (tsc probes against `dist/` types + runtime execution of `dist/`).

## Claims checked

1. **`AnchorTag.setRel(rel?: LinkRel)` is single-token** — confirmed at `src/elements/links.ts:37-40`; `LinkRel` at `src/elements/html-types.ts:71-74` is 12 single tokens `| (string & {})`. Same signature on `AreaTag.setRel` (`links.ts:115`). `LinkTag.setRel` (`document.ts:141`) uses `LinkElementRel` (a different union, `html-types.ts:135-140`) but has the identical single-token + open-tail shape — minor imprecision in the finding, same structural issue.

2. **The security pair only type-checks via the open tail.** Probe (`scratchpad/rel-probe/probe.ts`, compiled against `dist/src/index.d.ts` with `--strict`, exit 0):
   ```ts
   A("x").setRel("noopener noreferrer");   // compiles
   A("x").setRel("noopener norefferer");   // typo ALSO compiles — the defect
   ```
   Negative probe (`negative.ts`): against a closed replica of `LinkRel` (tail removed), both lines above are compile errors — `@ts-expect-error` on each passes `tsc --strict` (exit 0). This proves the pair matches **no** closed member; only `(string & {})` admits it, so the pair gets no autocompletion and typos inside it are invisible to the compiler.

3. **Runtime output** (node against `dist/`):
   ```
   <a href="https://e.com" target="_blank" rel="noopener noreferrer">x</a>
   <a rel="noopener norefferer">x</a>
   ```
   The typo renders silently — a weakened security attribute with no compile-time or runtime signal.

4. **API asymmetry across the three token-list attributes** — confirmed in source:
   - `IframeTag.setSandbox(...tokens: SandboxToken[])` — variadic, closed union (`embedded.ts:56-60`)
   - `ThTag.setHeaders(...ids)` / `addHeaders(...ids)` — set/add pair (`tables.ts:58-69`)
   - `setRel(rel?: LinkRel)` — single optional scalar (`links.ts:37`, `links.ts:115`, `document.ts:141`)

## Attempted refutations that failed

- Searched for any existing `addRel` / variadic `setRel` overload anywhere in `src/` — none exists.
- Checked whether `LinkRel` includes the pair as a literal (e.g. `'noopener noreferrer'`) — it does not.
- Checked whether the open tail rejects malformed strings at compile or render time — it does not (typo compiled and rendered).

## Verdict

**Confirmed.** The reproduction succeeds exactly as described: `rel="noopener noreferrer"` compiles only through `(string & {})`, `"noopener norefferer"` compiles and renders, and the library demonstrably ships two better patterns (`setSandbox` variadic, `setHeaders`/`addHeaders`) for the same attribute shape. The proposed variadic `setRel(...rels: LinkRel[])` is backward compatible for all single-token callers; existing space-joined string callers also keep compiling (each string still inhabits `LinkRel` via the tail).

Probe files: `/private/tmp/claude-501/-Users-tony-jt-digital-fluent-html/f2f45330-dea1-49ee-a197-fd7d0ee2bfc5/scratchpad/rel-probe/{probe.ts,negative.ts}`.
