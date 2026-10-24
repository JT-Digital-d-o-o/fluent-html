# Client machines: assumptions tested (23. 10. 26)

The machine half (client code as typed total state machines over browser event protocols) had seven
claims behind it. This folder holds the probes that tested them; the morph half is in
[morph-lens](../morph-lens/README.md).

| File | What it tests |
|---|---|
| `cancel-repro.mjs` | Everyframe's clip-cut.js and clip-speed.js after a touch pan: a real one through CDP in Chromium, dispatched events in Firefox and WebKit |
| `protocol-probe.mjs` | Real pointer sequences per engine: a captured drag, Escape mid-drag, the captured element removed or moved, a right press |
| `machine/*.ts` | The typed encoding: a shared browser model (`protocol.ts`) and the two scrub UIs transcribed against it. `tsc --noEmit --strict` fails them on exactly their bugs |

## Findings

- Of 17 logged client-logic bugs: 6 caught by types (5 by totality, 1 by typed event fields), 2 by
  typestate on effects, all only if the model already had the rule; 2 prevented by the
  representation; 4 not caught (a wrong choice inside an arm that exists); 3 belong to the morph
  half or CSS.
- The rules recur: clip-cut and clip-speed never got Cut's `pointercancel` fix. In a real Chromium
  touch pan, clip-cut's drag never ends (a mouse passing over scrubs the clip) and clip-speed's speed
  changes from a scroll and again on hover. Both are compile errors against the shared model.
- Generated drives catch engine bugs only: drives generated from a wrong machine confirm it.
- The engines disagree exactly where a morph meets a drag (the captured element removed or moved) and
  on a right press (WebKit sends no `pointerup`, ever). The model is the union over engines.
- The code listens to about 40 event types; fluent-html's behavior table has 12.
- Cut's two scripts are 29,080 of their 29,300 B source budget; esbuild-minified they are 16,668 B.
