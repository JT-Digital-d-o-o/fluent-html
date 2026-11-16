import { Div, Input, Button, tw, defineTheme, Raw, trustHtml, Style, css, Script, js, JsonScript, type ThemeKeys } from "fluent-html";

const tokens = { colors: { primary: "#2563eb", surface: "#fff", "text-dim": "#475569", danger: "#b91c1c" }, radius: { card: "0.75rem" } } as const;
export const theme = defineTheme(tokens);
declare module "fluent-html" {
  interface FluentCustomColors extends ThemeKeys<typeof tokens, "colors"> {}
  interface FluentCustomRadius extends ThemeKeys<typeof tokens, "radius"> {}
}

const card = tw("p-6 bg-surface rounded-card shadow-md");
const invalid = Math.random() > 0.5;
export const ok = [
  Div().tw("flex items-center justify-between gap-2 px-4 py-2 md:px-8 hover:bg-primary/10 text-text-dim"),
  Div().tw(card, "p-0", invalid && "border border-danger"),
  Input().tw("w-full aria-invalid:border-danger focus-visible:ring-2 focus-visible:outline-hidden disabled:opacity-50"),
  Div().tw("grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-[1fr_2fr] w-[180px] -mt-2 max-w-3xl min-h-screen"),
  Div().tw("data-[state=open]:bg-surface group-hover:underline [&>li]:py-2 supports-[display:grid]:grid text-sm/6"),
  Div().tw("bg-gray-100 text-white backdrop:bg-black/50 space-y-4 divide-y divide-gray-200 sr-only"),
  Button("x").tw("cursor-pointer inline-flex rounded-full truncate tabular-nums [mask-repeat:no-repeat] p-4!"),
  Div(Raw("<hr>"), Raw(trustHtml(String(invalid)))).setStyle("anchor-name: --menu").setStyles({ color: String(invalid) }),
  Style(css`.x { color: ${String(invalid)}; }`), Script(js`window.__X = ${{ a: 1 }};`), JsonScript({ a: 1 }),
];
// @ts-expect-error unknown class
Div().tw("justify-centre");
// @ts-expect-error unknown variant
Div().tw("hovr:bg-primary");
// @ts-expect-error colour
Div().tw("bg-primry");
const s: string = "p-4";
// @ts-expect-error runtime string
Div().tw(s);
// @ts-expect-error template
Div().tw(`p-4 ${card}`);
// @ts-expect-error tombstone
Div().flexWrap();
// @ts-expect-error tombstone
Div().p("4");
// @ts-expect-error Style from a string
Style(".x{}");
// @ts-expect-error Script from a string
Script("alert(1)");
