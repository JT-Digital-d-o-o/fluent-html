# Verdict: elements-symmetry-4 — NOT REFUTED (confirmed)

**Finding:** `setRel` is single-token while `rel` is a space-separated token list; the pair `"noopener noreferrer"` only compiles via the untyped `(string & {})` open tail.

**Mode:** refute-by-code-reading. I looked for any check, alternate API, or type mechanism that would make this a non-issue. None exists.

## Factual claims verified against source

1. **`AnchorTag.setRel(rel?: LinkRel)` is single-valued** — `src/elements/links.ts:37-40`. Plain assignment, no variadic, no join. Same for `AreaTag.setRel` at `links.ts:115-118`.
2. **`LinkRel` is a union of single tokens + open tail** — `src/elements/html-types.ts:71-74`:
   ```typescript
   export type LinkRel =
     | 'noopener' | 'noreferrer' | 'nofollow' | 'external' | 'author'
     | 'bookmark' | 'help' | 'license' | 'next' | 'prev' | 'search' | 'tag'
     | (string & {});
   ```
   No template-literal pair types (e.g. `` `${LinkRel} ${LinkRel}` ``) exist anywhere in `html-types.ts`.
3. **`"noopener noreferrer"` only type-checks through `(string & {})`** — it is not a union member, so it gets no autocomplete, and the typo `"noopener norefferer"` compiles equally well. Follows directly from the type; no compiler machinery intervenes.
4. **No alternate pathway** — grepped the whole of `src/`: there is no `addRel`, no rel-joining helper, no shipped `.apply()` mixin, and no "safe external link" factory that emits `noopener noreferrer`. The only `join(' ')` call sites for token lists are `setSandbox` and `setHeaders`/`addHeaders`.
5. **The three-patterns claim is accurate** —
   - `IframeTag.setSandbox(...tokens: SandboxToken[])` joins variadic closed tokens (`src/elements/embedded.ts:56-59`);
   - `ThTag.setHeaders(...)` / `addHeaders(...)` are a variadic set/add pair with dedupe (`src/elements/tables.ts:58-69`);
   - `setRel` is single-token optional.
   Three token-list attributes, three different API shapes — the asymmetry is real.

## Refutation angles attempted, and why they fail

- **"Browsers now imply `noopener` on `target=_blank`"** — true since ~2021, which softens the *security* framing for `noopener` alone. But it does not refute the finding: `noreferrer` (referrer suppression) is not implied, multi-token values like `"nofollow external"` are ordinary anchor rel grammar, and the API-shape inconsistency stands regardless of browser defaults.
- **"Open tail means it works, so no defect"** — the finding is explicitly about the *typed* surface (autocomplete + typo safety), which the codebase treats as a design goal elsewhere (`SandboxToken` is deliberately closed with a comment that "a typo silently weakens the policy" — html-types.ts:100; the exact same argument applies to `rel` typos on security tokens).
- **"Maybe LinkTag is fine"** — minor imprecision in the finding: `LinkTag.setRel` (`src/elements/document.ts:141`) uses `LinkElementRel`, not `LinkRel`. But it has the identical shape (single tokens + open tail, single-valued setter), and `<link rel>` is also a space-separated token list per spec (e.g. `"alternate stylesheet"`, `"icon apple-touch-icon"`... ). The substance carries over.

## Verdict

**refuted = false, confidence = high.** Every evidence anchor is accurate, and no guard, helper, or type mechanism exists that makes multi-token `rel` values first-class. The proposed variadic `setRel(...rels: LinkRel[])` is backward compatible at call sites passing a single token and matches the established `setSandbox` precedent.
