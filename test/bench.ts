// ------------------------------------
// Performance Benchmarks
// ------------------------------------

import { performance } from "perf_hooks";
import {
  render, Div, Span, P, H1, H2, H3, Nav, Header, Footer, Main, Section, Article, Aside,
  Form, Input, Label, Button, Table, Thead, Tbody, Tr, Th, Td, A, Ul, Li, Img,
  ForEach, hx,
} from "../src/index.js";
import { VStack, HStack, Grid, FormField } from "../src/patterns.js";

// ------------------------------------
// Benchmark harness
// ------------------------------------

const WARMUP = 100;
const ITERATIONS = 1000;

function bench(name: string, fn: () => string): void {
  // warmup
  for (let i = 0; i < WARMUP; i++) fn();

  const times: number[] = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now();
    fn();
    times.push(performance.now() - start);
  }

  times.sort((a, b) => a - b);
  const total = times.reduce((s, t) => s + t, 0);
  const avg = total / ITERATIONS;
  const ops = 1000 / avg;
  const min = times[0];
  const max = times[times.length - 1];
  const p50 = times[Math.floor(ITERATIONS * 0.5)];
  const p99 = times[Math.floor(ITERATIONS * 0.99)];

  console.log(
    `${name.padEnd(30)} ${ops.toFixed(0).padStart(10)} ops/s` +
    `  avg=${avg.toFixed(4)}ms` +
    `  min=${min.toFixed(4)}ms` +
    `  p50=${p50.toFixed(4)}ms` +
    `  p99=${p99.toFixed(4)}ms` +
    `  max=${max.toFixed(4)}ms`
  );
}

// ------------------------------------
// Simple views
// ------------------------------------

console.log("\n=== Simple Views ===\n");

// 1. Single element
bench("1. Single element", () =>
  render(Div("hello"))
);

// 2. Element with classes
bench("2. Element with classes", () =>
  render(
    Div("hello")
      .padding("2")
      .background("red-500")
      .textColor("white")
      .bold()
      .rounded("lg")
  )
);

// 3. Flat list (100 items)
bench("3. Flat list (100)", () =>
  render(ForEach(100, (i) => Div(`item ${i}`)))
);

// ------------------------------------
// Medium views
// ------------------------------------

console.log("\n=== Medium Views ===\n");

// 4. Nested structure (3 levels, 5 children each = 155 elements)
bench("4. Nested (3x5 = 155 els)", () =>
  render(
    Div(
      ForEach(5, () =>
        Div(
          ForEach(5, () =>
            Div(
              ForEach(5, () =>
                Span("leaf")
                  .padding("1")
                  .textColor("gray-700")
              )
            ).padding("2").background("gray-100")
          )
        ).padding("4").border()
      )
    ).padding("6")
  )
);

// 5. Form with 10 inputs
bench("5. Form (10 inputs)", () =>
  render(
    Form(
      ForEach(10, (i) =>
        Div([
          Label(`Field ${i}`).setFor(`field-${i}`),
          Input()
            .setType("text")
            .setName(`field-${i}`)
            .setPlaceholder(`Enter field ${i}`)
            .padding("2")
            .border()
            .rounded("md")
            .w("full"),
        ]).margin("b", "4")
      )
    )
      .padding("6")
      .background("white")
      .rounded("lg")
      .shadow("lg")
  )
);

// 6. Table (20 rows x 5 cols)
bench("6. Table (20x5)", () =>
  render(
    Table([
      Thead(
        Tr(
          ForEach(5, (c) =>
            Th(`Header ${c}`)
              .padding("3")
              .background("gray-200")
              .fontWeight("bold")
          )
        )
      ),
      Tbody(
        ForEach(20, (r) =>
          Tr(
            ForEach(5, (c) =>
              Td(`Cell ${r}-${c}`)
                .padding("2")
                .border()
            )
          )
        )
      ),
    ]).w("full").border()
  )
);

// ------------------------------------
// Complex views
// ------------------------------------

console.log("\n=== Complex Views ===\n");

// 7. Full page layout (~200 elements with HTMX)
bench("7. Full page layout", () =>
  render(
    Div([
      // Header
      Header(
        HStack([
          H1("My App").textColor("white").textSize("2xl").bold(),
          Nav(
            ForEach(5, (i) =>
              A(`Link ${i}`)
                .setHref(`/page-${i}`)
                .textColor("white")
                .padding("x", "3")
                .padding("y", "1")
            )
          ).flex().gap("2"),
        ], { justify: "space-between", align: "center" })
      )
        .padding("4")
        .background("blue-600"),

      // Main content
      Main(
        Div([
          // Sidebar
          Aside(
            VStack(
              ForEach(8, (i) =>
                A(`Menu ${i}`)
                  .setHref(`#section-${i}`)
                  .setHtmx(hx(`/section/${i}`, { target: "#content", swap: "innerHTML" }))
                  .padding("2")
                  .textColor("gray-700")
              ),
              { spacing: "0.25rem" }
            )
          )
            .w("64")
            .padding("4")
            .background("gray-50")
            .border(),

          // Content area
          Section([
            H2("Dashboard").textSize("xl").bold().margin("b", "4"),
            Grid(
              ForEach(6, (i) =>
                Article([
                  H3(`Card ${i}`).bold().margin("b", "2"),
                  P("Card description text that spans multiple lines for realism.")
                    .textColor("gray-600")
                    .textSize("sm"),
                  Button("Action")
                    .setHtmx(hx(`/card/${i}/action`, { method: "post", swap: "outerHTML" }))
                    .padding("x", "4")
                    .padding("y", "2")
                    .background("blue-500")
                    .textColor("white")
                    .rounded("md")
                    .margin("t", "3"),
                ])
                  .padding("4")
                  .background("white")
                  .rounded("lg")
                  .shadow("md")
                  .border()
              ),
              { columns: 3, gap: "1rem" }
            ),
          ])
            .setId("content")
            .flex("1")
            .padding("6"),
        ]).flex().gap("0")
      ),

      // Footer
      Footer(
        HStack([
          Span("© 2025 My App").textColor("gray-400").textSize("sm"),
          Div(
            ForEach(3, (i) =>
              A(`Footer Link ${i}`).setHref("#").textColor("gray-400").textSize("sm")
            )
          ).flex().gap("4"),
        ], { justify: "space-between" })
      )
        .padding("4")
        .background("gray-800"),
    ])
  )
);

// 8. Large list (1000 styled items)
bench("8. Large list (1000)", () =>
  render(
    Ul(
      ForEach(1000, (i) =>
        Li([
          Span(`Item ${i}`).bold(),
          Span(`Description for item ${i}`).textColor("gray-500").textSize("sm"),
        ])
          .flex()
          .justifyContent("between")
          .alignItems("center")
          .padding("3")
          .border()
      )
    )
  )
);

// 9. Deep nesting (50 levels)
bench("9. Deep nesting (50)", () => {
  let view: any = Span("core").textColor("red-500");
  for (let i = 0; i < 50; i++) {
    view = Div(view).padding("1").border();
  }
  return render(view);
});

console.log("");
