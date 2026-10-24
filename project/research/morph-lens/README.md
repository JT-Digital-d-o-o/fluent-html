# Morph lens experiment (23. 10. 26)

The lens laws tested against htmx 4.0.0's `outerMorph` (Everyframe's vendored copy, byte-identical to
projects-template's) in Chromium 149, Firefox 151 and WebKit 26.5, with fast-check shrinking each
failure to a minimal case. Scope: [morph-ownership](../../pm/morph-ownership/prd.md).

| File | What it does |
|---|---|
| `lens.mjs` | The property run: PutGet, Identity, GetPut and Complement per kind of client state, the form-control matrix, unkeyed alignment, keyed moves. `RUNS=300 node lens.mjs` rewrites `results.json` |
| `harness.js` | The in-page side: mount a render, apply client edits, morph, report what survived |
| `repro.mjs` | The identity bug, and scroll across a raw `moveBefore` / `insertBefore` |
| `loops-repro.mjs` | Everyframe's landing loops blank after a morph to the same render (real `loops.js`) |
| `dupkeys.mjs` | Two `ForEachKeyed` lists sharing ids: no failure found |
| `results.json` | The 300-run data |

Paths are absolute: htmx and fast-check come from `everyframe-composer`, playwright-core 1.61.1 from
this repo's `node_modules` (it matches the cached browsers). This is a throwaway; the conformance
suite replaces it ([todo](../../pm/morph-ownership/todo.md)). What it measured is summarized in
[design.md](../../pm/morph-ownership/design.md).
