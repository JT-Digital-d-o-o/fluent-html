/**
 * Tailwind styling example — Styled card with variants
 *
 * Run: npx tsx examples/tailwind.ts
 */
import type { Tag} from '../src/index.js';
import { Div, H2, P, Button, render } from '../src/index.js';

// Reusable modifier functions via .apply()
const card = (t: Tag) =>
  t.p("6").bg("white").rounded("xl").shadow("lg");

const primaryBtn = <T extends Tag>(t: T) =>
  t.p("x", "6")
    .p("y", "3")
    .bg("blue-500")
    .text("white")
    .rounded("lg")
    .font("semibold")
    .transition("colors");

// Build a styled card
const styledCard = Div(
  H2("Dashboard")
    .text("xl")
    .font("bold")
    .text("gray-900"),

  P("Welcome back! Here's what's happening today.")
    .text("gray-600")
    .m("top", "2"),

  Button("View Reports")
    .apply(primaryBtn)
    .m("top", "4")
    .on("hover", t => t.bg("blue-600").scale("105"))
    .on("focus", t => t.ring("2").ring("blue-300").outline("none")),
)
  .apply(card)
  .maxW("md")
  .m("x", "auto");

console.log(render(styledCard));
