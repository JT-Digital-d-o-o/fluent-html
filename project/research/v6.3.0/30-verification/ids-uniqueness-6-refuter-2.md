# Verdict: ids-uniqueness-6 — CONFIRMED (not refuted)

**Finding:** defineIds gives no uniqueness guarantee — colliding camelCase keys silently last-write-win; no selector-validity check.
**Anchor:** `src/ids.ts:111` (`registry[camelKey] = createId(name)`), secondary `src/ids.ts:45-51` (`createId`).
**Mode:** refute-by-reproduction against `dist/src/ids.js` (v6.2.0 build) + tsc probe.

## Reproduction results — every claim reproduced

### 1. Runtime collision, silent last-write-wins (dist)

```js
import { defineIds, createId } from 'fluent-html/dist/src/ids.js';
const ids = defineIds(["user-list", "userList"]);
```

Output:

```
keys: [ 'userList' ]
ids.userList.id: userList        // "user-list" DOM id is unreachable
collision silent (no throw): true
```

Order-dependence confirmed: `defineIds(["userList", "user-list"])` yields `ids.userList.id === "user-list"` — whichever name comes last wins. Exact duplicates (`defineIds(["foo","foo"])`) are equally silent (one key, no throw). `src/ids.ts:106-114` has no duplicate check of any kind.

### 2. Type level collapses — no compile error (tsc probe)

Probe compiled clean under `--strict`:

```ts
const ids = defineIds(["user-list", "userList"] as const);
ids.userList;            // only key — OK
// @ts-expect-error
ids["user-list"];        // original key does not exist in the type
```

`IdRegistry<T>` maps `K in T[number] as KebabToCamel<K>` (src/ids.ts:63-65), so `"user-list"` and `"userList"` map to the same property key and merge without error — the finding's claim that the type system cannot catch this is correct.

### 3. Leading-digit id produces an invalid CSS selector

`createId("2fa-status").selector === "#2fa-status"` (no validation in `createId`, src/ids.ts:45-51).

jsdom (spec-conformant nwsapi selector engine, same behavior as browsers):

```
document.querySelector('#2fa-status')
→ DOMException: Invalid selector #2fa-status
```

Note: linkedom's lenient parser accepts it, but real browsers and jsdom throw per CSS ident grammar (an ID selector name cannot start with a digit). Any `hx-target`/`querySelector` use of such a selector fails at runtime. `CSS.escape("2fa-status")` → `#\32 fa-status` would be the valid form.

## Refutation attempts that failed

- Searched `src/ids.ts` in full for any dedupe/validation path — none exists (`Object.freeze` does not prevent the pre-freeze overwrite at line 111).
- Checked whether the type system rejects the colliding input — it does not (probe above).
- Checked whether a lenient DOM implementation makes the selector claim moot — linkedom accepts `#2fa-status`, but jsdom/browsers throw, so the defect is real where it matters (htmx `hx-target` resolution in browsers).

## Verdict

**refuted = false, confidence = high.** All claims — silent last-write-wins collision, silent exact duplicates, type-level collapse with no compile error, and invalid leading-digit selectors — reproduce exactly as stated. The proposal (throw on computed camelKey collision at `defineIds` time; validate names against `/^[A-Za-z][\w-]*$/` or emit CSS.escape'd selectors) addresses the reproduced behavior.

*Artifacts: repro script and tsc probe in session scratchpad (`repro-ids.mjs`, `probe-types.ts`).*
