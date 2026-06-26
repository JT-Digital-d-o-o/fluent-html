// In the open-union world, defineTheme can ONLY emit CSS + a safelist manifest.
// It is physically unable to affect compile-time types: the union already accepts
// every string, so there is nothing for it to "add". Type-safety is impossible here.
export function defineTheme(spec: { colors: Record<string, string> }) {
  const css =
    "@theme {\n" +
    Object.entries(spec.colors).map(([k, v]) => `  --color-${k}: ${v};`).join("\n") +
    "\n}";
  const manifest = Object.keys(spec.colors).flatMap((k) => [`bg-${k}`, `text-${k}`]);
  return { css, manifest };
}

export const theme = defineTheme({ colors: { forest: "#2d5016", brand: "#ff5500" } });
