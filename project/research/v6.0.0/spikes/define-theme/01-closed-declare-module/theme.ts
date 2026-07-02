// Runtime defineTheme still emits CSS + manifest (elided — identical to spike 00).
// But it CANNOT change types: a runtime call has no compile-time effect. So the
// types come from the hand-written `declare module` below — tokens defined TWICE.
export function defineTheme<S extends { colors: Record<string, string> }>(spec: S): S {
  return spec;
}

export const theme = defineTheme({ colors: { forest: "#2d5016", brand: "#ff5500" } });

// ⚠ DX COST: the user must ALSO write + maintain this augmentation, kept in sync
//   with the call above BY HAND. Nothing enforces that the two lists match — a
//   token added to defineTheme() but not here silently loses its type, and vice-versa.
declare module "./fluent-mock.ts" {
  interface FluentCustomColors {
    forest: true;
    brand: true;
  }
}
