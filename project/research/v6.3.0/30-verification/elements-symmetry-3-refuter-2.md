# Verdict: elements-symmetry-3 — NOT REFUTED (CONFIRMED)

**Finding:** `.toggle()` is add-only — `toggle(name, false)` cannot remove a previously set boolean attribute, breaking last-call-wins.

**Mode:** refute-by-reproduction against `dist/` (v6.2.0, `dist/src/index.js`).

## Reproduction

```js
const { Input, render } = require('/Users/tony/jt-digital/fluent-html/dist/src/index.js');

render(Input().toggle('required').toggle('required', false));
// → <input required>          ← later toggle(false) did NOT remove it

render(Input().toggle('required', false));
// → <input>                   ← baseline: false alone adds nothing

render(Input().toggle('disabled').toggle('disabled', true));
// → <input disabled>          ← serializer dedupes duplicates

const preset = t => t.toggle('disabled');
render(Input().apply(preset).toggle('disabled', false));
// → <input disabled>          ← preset scenario: cannot re-enable downstream
```

## Contrast (set* convention holds elsewhere)

```js
render(Input().setType('text').setType('email'));        // → <input type="email">
render(Input().setPlaceholder('a').setPlaceholder('b')); // → <input placeholder="b">
```

## Source verification

- `src/core/tag.ts:220-229` — `toggle(name, condition = true)` only pushes onto `this.toggles` when `condition` is true; there is no removal path anywhere on the class.
- JSDoc at `tag.ts:139-144` documents the convention: "`set*` methods override and `add*` methods accumulate" — `toggle` is named like a switch but behaves as accumulate-only, and it is the sole primitive where a later call cannot override an earlier one.

## Conclusion

The defect positively reproduces exactly as stated in the finding. **refuted = false.**

The proposed fix (on `condition === false`, filter `name` out of `this.toggles`) would restore last-call-wins with no serializer change; note it should also handle the `this.toggles === undefined` case (no-op, as today).
