/**
 * Tailwind styling example — Styled card with variants
 *
 * Run: npx tsx examples/tailwind.ts
 */
import type { Tag} from '../src/index.js';
import { Div, H2, P, Button, render } from '../src/index.js';

// Reusable modifier functions via .apply()
const card = (t: Tag) =>
  t.padding("6").background("white").rounded("xl").shadow("lg");

const primaryBtn = <T extends Tag>(t: T) =>
  t.padding("x", "6")
    .padding("y", "3")
    .background("blue-500")
    .textColor("white")
    .rounded("lg")
    .fontWeight("semibold")
    .transition("colors");

// Build a styled card
const styledCard = Div(
  H2("Dashboard")
    .textSize("xl")
    .fontWeight("bold")
    .textColor("gray-900"),

  P("Welcome back! Here's what's happening today.")
    .textColor("gray-600")
    .margin("top", "2"),

  Button("View Reports")
    .apply(primaryBtn)
    .margin("top", "4")
    .on("hover", t => t.background("blue-600").scale("105"))
    .on("focus", t => t.ring("2").ringColor("blue-300").outline("none")),
)
  .apply(card)
  .maxW("md")
  .margin("x", "auto");

console.log(render(styledCard));
