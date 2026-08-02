import { performance } from "node:perf_hooks";
import {
  render, Div, H1, H2, P, Span, Nav, Header, Footer, Section, Article,
  Ul, Li, A, Button, Table, Thead, Tbody, Tr, Th, Td,
  Img, Main,
  ForEach,
} from "../src/index.js";
import type { View } from "../src/index.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function measure(_name: string, fn: () => void, iterations: number): { opsPerSec: number; avgMs: number } {
  // Warm-up to a ~200ms budget so V8 tiers up on the larger bodies (a fixed 100 iters
  // wasn't enough for TurboFan on the big scenarios).
  const warmupEnd = performance.now() + 200;
  let warmed = 0;
  while (performance.now() < warmupEnd) {
    fn();
    if (++warmed >= iterations) break;
  }

  // Take several short samples and report the MEDIAN. A single contiguous sample per
  // scenario had 25-57% run-to-run spread — the same order as the perf deltas the gate
  // is meant to catch, so a real regression could pass. The median of 7 is stable enough.
  const SAMPLES = 7;
  const perSample = Math.max(1, Math.floor(iterations / SAMPLES));
  const opsSamples: number[] = [];
  for (let s = 0; s < SAMPLES; s++) {
    const start = performance.now();
    for (let i = 0; i < perSample; i++) fn();
    const elapsed = performance.now() - start;
    opsSamples.push((perSample * 1000) / elapsed);
  }
  opsSamples.sort((a, b) => a - b);
  const opsPerSec = Math.round(opsSamples[SAMPLES >> 1]!);
  const avgMs = 1000 / opsPerSec;
  return { opsPerSec, avgMs };
}

function formatOps(ops: number): string {
  if (ops >= 1_000_000) return (ops / 1_000_000).toFixed(2) + "M";
  if (ops >= 1_000) return (ops / 1_000).toFixed(2) + "K";
  return String(ops);
}

function printResult(name: string, result: { opsPerSec: number; avgMs: number }): void {
  const pad = 40 - name.length;
  console.log(
    `  ${name}${" ".repeat(Math.max(1, pad))}${formatOps(result.opsPerSec).padStart(10)} ops/sec   ${result.avgMs.toFixed(4).padStart(10)} ms/op`
  );
}

// ---------------------------------------------------------------------------
// Benchmarks
// ---------------------------------------------------------------------------

function benchFlatPage(): View {
  return Div(
    ForEach(1000, (i) =>
      Div(`Item ${i}`).setId(`item-${i}`).p("4").bg("white")
    )
  );
}

function benchDeepTree(depth: number): View {
  if (depth === 0) return Span("leaf");
  return Div(benchDeepTree(depth - 1)).p("2");
}

function benchHeavyEscaping(): View {
  const nasty = `<script>alert("xss")</script> & "quotes" & 'apostrophes' <b>bold</b>`;
  return Div(ForEach(200, () => P(nasty)));
}

function benchHtmxAttributes(): View {
  return Div(
    ForEach(100, (i) =>
      Button(`Button ${i}`)
        .setHtmx(`/api/button/${i}`, { method: "post", swap: "none" })
        .p("x", "4").p("y", "2").bg("blue-500").text("white").rounded()
    )
  );
}

function benchVariantHeavy(): View {
  return Div(
    ForEach(100, (i) =>
      Button(`Button ${i}`)
        .p("x", "4").p("y", "2").bg("blue-500").text("white").rounded()
        .transition("colors")
        .hover({ bg: "blue-600", scale: "105", text: "white", shadow: "lg" })
        .focus({ ring: "2", outline: "none", shadow: "md" }).focus({ ring: "blue-300" })
        .disabled({ opacity: "50", cursor: "not-allowed", bg: "gray-400" })
        .md({ px: "8", text: "lg", rounded: "lg" })
        .lg({ px: "12", text: "xl" })
    )
  );
}

function benchLargeForEach(): View {
  return Div(
    ForEach(5000, (i) =>
      Div(`Item ${i}`).setId(`item-${i}`)
    )
  );
}

function benchRealisticPage(): View {
  return Div(
    Header(
      Nav(
        Ul(
          Li(A("Home").setClass("nav-link").p("x", "4").p("y", "2")),
          Li(A("About").setClass("nav-link").p("x", "4").p("y", "2")),
          Li(A("Products").setClass("nav-link").p("x", "4").p("y", "2")),
          Li(A("Contact").setClass("nav-link").p("x", "4").p("y", "2")),
        ).flex().gap("4")
      ).p("4").bg("white").shadow("md")
    ),
    Main(
      Section(
        H1("Welcome to Our Store").text("3xl").font("bold").m("b", "4"),
        P("Browse our collection of fine products.").text("gray-600"),
      ).p("8"),
      Section(
        H2("Featured Products").text("2xl").font("bold").m("b", "6"),
        Div(
          ForEach(12, (i) =>
            Article(
              Img().addAttribute("src", `/img/product-${i}.jpg`).addAttribute("alt", `Product ${i}`).w("full").h("48").object("cover"),
              Div(
                H2(`Product ${i}`).text("lg").font("bold"),
                P(`$${(i + 1) * 9.99}`).text("green-600").font("bold"),
                P("Lorem ipsum dolor sit amet, consectetur adipiscing elit.").text("gray-500").text("sm"),
                Button("Add to Cart")
                  .setHtmx(`/cart/add/${i}`, { method: "post", swap: "none" })
                  .p("x", "4").p("y", "2").bg("blue-500").text("white").rounded(),
              ).p("4"),
            ).border().rounded("lg").overflow("hidden")
          )
        ).grid().gridCols("3").gap("6"),
      ).p("8"),
      Section(
        H2("Customer Reviews").text("2xl").font("bold").m("b", "4"),
        Table(
          Thead(
            Tr(Th("Name"), Th("Rating"), Th("Comment"))
          ),
          Tbody(
            ForEach(10, (i) =>
              Tr(
                Td(`Customer ${i}`).p("2").border(),
                Td(`${"★".repeat(3 + (i % 3))}`).p("2").border(),
                Td("Great product, highly recommended!").p("2").border(),
              )
            )
          )
        ).w("full").border(),
      ).p("8"),
    ),
    Footer(
      Div(
        P("© 2026 Our Store. All rights reserved.").text("gray-400"),
        Ul(
          Li(A("Privacy").text("gray-400")),
          Li(A("Terms").text("gray-400")),
          Li(A("Support").text("gray-400")),
        ).flex().gap("4"),
      ).flex().justify("between").items("center").p("8"),
    ).bg("gray-800"),
  );
}

// ---------------------------------------------------------------------------
// Memory measurement
// ---------------------------------------------------------------------------

function measureMemory(name: string, fn: () => void, count: number): void {
  global.gc?.();
  const before = process.memoryUsage();
  for (let i = 0; i < count; i++) fn();
  const after = process.memoryUsage();
  const heapDelta = ((after.heapUsed - before.heapUsed) / 1024).toFixed(1);
  const pad = 40 - name.length;
  console.log(`  ${name}${" ".repeat(Math.max(1, pad))}${heapDelta.padStart(10)} KB heap (${count} iterations)`);
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

const ITERATIONS = 1000;

console.log("\n╔═══════════════════════════════════════════════════════════════════════╗");
console.log("║                     fluent-html Benchmark Suite                     ║");
console.log("╚═══════════════════════════════════════════════════════════════════════╝\n");

console.log("Render benchmarks:");
console.log("─".repeat(72));

const flatPage = benchFlatPage();
printResult("Flat page (1000 divs)", measure("flat", () => render(flatPage), ITERATIONS));

const deepTree = benchDeepTree(100);
printResult("Deep tree (100 levels)", measure("deep", () => render(deepTree), ITERATIONS));

const escapePage = benchHeavyEscaping();
printResult("Heavy escaping (200 paragraphs)", measure("escape", () => render(escapePage), ITERATIONS));

const htmxPage = benchHtmxAttributes();
printResult("HTMX attributes (100 buttons)", measure("htmx", () => render(htmxPage), ITERATIONS));

const realisticPage = benchRealisticPage();
printResult("Realistic page (~200 tags)", measure("realistic", () => render(realisticPage), ITERATIONS));

const variantPage = benchVariantHeavy();
printResult("Variant-heavy (100 buttons, 10+ variants)", measure("variants", () => render(variantPage), ITERATIONS));

const largeForEach = benchLargeForEach();
printResult("Large ForEach (5000 items)", measure("large-foreach", () => render(largeForEach), ITERATIONS));

// Build AND render per op — real SSR rebuilds the tree every request (F-D-113;
// the scenarios above render a pre-built tree, hiding construction cost).
printResult("Build+render realistic (per req)", measure("build-render", () => render(benchRealisticPage()), ITERATIONS));

console.log("");
console.log("Memory usage:");
console.log("─".repeat(72));

if (global.gc) {
  measureMemory("Flat page construction (1000 divs)", () => benchFlatPage(), 100);
  measureMemory("Realistic page construction", () => benchRealisticPage(), 100);
  measureMemory("Flat page render (1000 divs)", () => render(flatPage), 100);
  measureMemory("Realistic page render", () => render(realisticPage), 100);
} else {
  console.log("  (Run with --expose-gc for memory measurements)");
}

console.log("");

// ── CI regression gate (BENCH_GATE=1) ───────────────────────────────────────
// Catastrophic-only. Bench numbers are noisy (±6–40% observed) and vary 2–5× by
// machine, so an absolute floor cannot catch subtle (≈2×) regressions without
// flaking. The floors below sit ~8× under typical local numbers, so they survive
// a slow CI box yet still fail on a crash or an order-of-magnitude regression.
// Fine-grained gating needs a dedicated stable runner with historical baselines.
if (process.env.BENCH_GATE) {
  console.log("Bench gate (catastrophic-regression floors):");
  console.log("─".repeat(72));
  const FLOORS: Array<[name: string, make: () => View, floor: number]> = [
    ["render realistic page", () => realisticPage, 3000],
    ["build+render realistic", () => benchRealisticPage(), 2000],
    ["render flat (1000 divs)", () => flatPage, 1000],
  ];
  let failed = false;
  for (const [name, make, floor] of FLOORS) {
    const view = make();
    const { opsPerSec } = measure(name, () => render(view), 500);
    const ok = opsPerSec >= floor;
    if (!ok) failed = true;
    console.log(`  ${ok ? "✓" : "✗"} ${name.padEnd(28)} ${formatOps(opsPerSec).padStart(10)} ops/sec  (floor ${floor})`);
  }
  if (failed) {
    console.error("\nBENCH GATE FAILED — catastrophic perf regression or crash.");
    process.exit(1);
  }
  console.log("\n✓ bench gate passed");
}
