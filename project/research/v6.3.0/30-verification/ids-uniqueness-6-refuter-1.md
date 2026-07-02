# Refuter verdict: ids-uniqueness-6

**Verdict: NOT REFUTED — defect confirmed (high confidence)**

## What I tried to find

A check, guard, or semantic anywhere in the pipeline that makes the collision / invalid-selector behavior a non-issue:

1. **`src/ids.ts` itself** — `defineIds` (lines 103-115) builds the registry with `registry[camelKey] = createId(name)` (line 111) inside a plain `for` loop. No `if (camelKey in registry) throw`, no name-pattern validation. `createId` (lines 45-51) accepts any string and blindly emits `` `#${name}` ``.
2. **Downstream escaping** — `grep -rn "CSS.escape|escapeSelector" src/` → zero hits. `src/htmx.ts:323` (`return isId(value) ? value.selector : value;`) passes the raw selector into `hx-target` unmodified. `extractSelector` (ids.ts:164-174) only prepends `#`.
3. **Lint layer** — the eslint plugin's only ids rule is `no-raw-ids` (fluent-html-eslint-plugin/src/rules/no-raw-ids.ts), which bans hardcoded ID strings; it does not detect camelKey collisions or invalid id names.
4. **Tests** — `test/ids.ts` contains no duplicate/collision/throw coverage.
5. **Type level** — `IdRegistry` maps `[K in T[number] as KebabToCamel<K>]: Id`; colliding source names map to the *same* key with the *same* value type, which TypeScript merges silently. No compile error is possible from duplicate mapped keys.

## Runtime reproduction (executed)

```ts
const ids = defineIds(["user-list", "userList"] as const);
Object.keys(ids)                  // ["userList"]  — one key, no error
ids.userList.id                    // "userList"    — last write wins; "user-list" unreachable
defineIds(["2fa-status"] as const) // { "2faStatus": { id: "2fa-status", selector: "#2fa-status" } }
```

Exactly as the finding claims: the `user-list` DOM id becomes untargetable and every `target: ids.userList` silently retargets to the other element. `document.querySelector("#2fa-status")` throws `SyntaxError` (CSS idents cannot start with a digit), and htmx resolves `hx-target` selectors via querySelector, so a leading-digit id produces a selector that fails at runtime despite `2fa-status` being a valid HTML `id` attribute value.

## Why "by design" does not hold

The module header (ids.ts:5-6) states its purpose is to "ensure that hx-target selectors always reference valid element IDs." Silent last-write-wins collisions and syntactically invalid emitted selectors directly violate that stated contract, so this cannot be dismissed as intended semantics.

## Conclusion

Primary claim (silent collision, no compile-time or runtime guard): **CONFIRMED** by code reading and execution.
Secondary claim (no name validation → invalid CSS selector for leading-digit ids): **CONFIRMED**; no escaping exists anywhere downstream.

Finding stands. `refuted = false`.
