import { performance } from "node:perf_hooks";
import {
  render, Div, H1, H2, P, Span, Nav, Header, Footer, Section, Article,
  Ul, Li, A, Button, Table, Thead, Tbody, Tr, Th, Td,
  Img, Main,
} from "../src/index.js";
import type { View } from "../src/index.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function measure(_name: string, fn: () => void, iterations: number): { opsPerSec: number; avgMs: number } {
  // Warm-up
  for (let i = 0; i < Math.min(iterations, 100); i++) fn();

  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn();
  const elapsed = performance.now() - start;

  const avgMs = elapsed / iterations;
  const opsPerSec = Math.round(1000 / avgMs);
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
  const children: View[] = [];
  for (let i = 0; i < 1000; i++) {
    children.push(Div(`Item ${i}`).setId(`item-${i}`).padding("4").background("white"));
  }
  return Div(...children);
}

function benchDeepTree(depth: number): View {
  if (depth === 0) return Span("leaf");
  return Div(benchDeepTree(depth - 1)).padding("2");
}

function benchHeavyEscaping(): View {
  const nasty = `<script>alert("xss")</script> & "quotes" & 'apostrophes' <b>bold</b>`;
  const children: View[] = [];
  for (let i = 0; i < 200; i++) {
    children.push(P(nasty));
  }
  return Div(...children);
}

function benchHtmxAttributes(): View {
  const children: View[] = [];
  for (let i = 0; i < 100; i++) {
    children.push(
      Button(`Action ${i}`)
        .setHtmx(`/api/action/${i}`, {
          method: "post",
          target: `#result-${i}`,
          swap: "outerHTML",
          trigger: "click",
          indicator: `#spinner-${i}`,
          confirm: "Are you sure?",
        })
        .setId(`btn-${i}`)
    );
  }
  return Div(...children);
}

function benchRealisticPage(): View {
  return Div(
    Header(
      Nav(
        Ul(
          Li(A("Home").setClass("nav-link").padding("x", "4").padding("y", "2")),
          Li(A("About").setClass("nav-link").padding("x", "4").padding("y", "2")),
          Li(A("Products").setClass("nav-link").padding("x", "4").padding("y", "2")),
          Li(A("Contact").setClass("nav-link").padding("x", "4").padding("y", "2")),
        ).flex().gap("4")
      ).padding("4").background("white").shadow("md")
    ),
    Main(
      Section(
        H1("Welcome to Our Store").textSize("3xl").bold().margin("b", "4"),
        P("Browse our collection of fine products.").textColor("gray-600"),
      ).padding("8"),
      Section(
        H2("Featured Products").textSize("2xl").bold().margin("b", "6"),
        Div(
          ...Array.from({ length: 12 }, (_, i) =>
            Article(
              Img().addAttribute("src", `/img/product-${i}.jpg`).addAttribute("alt", `Product ${i}`).w("full").h("48").objectFit("cover"),
              Div(
                H2(`Product ${i}`).textSize("lg").bold(),
                P(`$${(i + 1) * 9.99}`).textColor("green-600").bold(),
                P("Lorem ipsum dolor sit amet, consectetur adipiscing elit.").textColor("gray-500").textSize("sm"),
                Button("Add to Cart")
                  .setHtmx(`/cart/add/${i}`, { method: "post", swap: "none" })
                  .padding("x", "4").padding("y", "2").background("blue-500").textColor("white").rounded(),
              ).padding("4"),
            ).border().rounded("lg").overflow("hidden")
          )
        ).grid().gridCols("3").gap("6"),
      ).padding("8"),
      Section(
        H2("Customer Reviews").textSize("2xl").bold().margin("b", "4"),
        Table(
          Thead(
            Tr(Th("Name"), Th("Rating"), Th("Comment"))
          ),
          Tbody(
            ...Array.from({ length: 10 }, (_, i) =>
              Tr(
                Td(`Customer ${i}`).padding("2").border(),
                Td(`${"★".repeat(3 + (i % 3))}`).padding("2").border(),
                Td("Great product, highly recommended!").padding("2").border(),
              )
            )
          )
        ).w("full").border(),
      ).padding("8"),
    ),
    Footer(
      Div(
        P("© 2026 Our Store. All rights reserved.").textColor("gray-400"),
        Ul(
          Li(A("Privacy").textColor("gray-400")),
          Li(A("Terms").textColor("gray-400")),
          Li(A("Support").textColor("gray-400")),
        ).flex().gap("4"),
      ).flex().justifyContent("between").alignItems("center").padding("8"),
    ).background("gray-800"),
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
