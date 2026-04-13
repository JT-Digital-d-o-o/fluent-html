var __addDisposableResource = (this && this.__addDisposableResource) || function (env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
        env.stack.push({ value: value, dispose: dispose, async: async });
    }
    else if (async) {
        env.stack.push({ async: true });
    }
    return value;
};
var __disposeResources = (this && this.__disposeResources) || (function (SuppressedError) {
    return function (env) {
        function fail(e) {
            env.error = env.hasError ? new SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        var r, s = 0;
        function next() {
            while (r = env.stack.pop()) {
                try {
                    if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                    if (r.dispose) {
                        var result = r.dispose.call(r.value);
                        if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
                    }
                    else s |= 1;
                }
                catch (e) {
                    fail(e);
                }
            }
            if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
            if (env.hasError) throw env.error;
        }
        return next();
    };
})(typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
import { performance } from "node:perf_hooks";
import { render, Div, H1, H2, P, Span, Nav, Header, Footer, Section, Article, Ul, Li, A, Button, Table, Thead, Tbody, Tr, Th, Td, Img, Main, ForEach, createContext, } from "../src/index.js";
import { foldView } from "../src/fold/index.js";
import { countAlgebra } from "../src/fold/algebras/index.js";
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function measure(_name, fn, iterations) {
    // Warm-up
    for (let i = 0; i < Math.min(iterations, 100); i++)
        fn();
    const start = performance.now();
    for (let i = 0; i < iterations; i++)
        fn();
    const elapsed = performance.now() - start;
    const avgMs = elapsed / iterations;
    const opsPerSec = Math.round(1000 / avgMs);
    return { opsPerSec, avgMs };
}
function formatOps(ops) {
    if (ops >= 1000000)
        return (ops / 1000000).toFixed(2) + "M";
    if (ops >= 1000)
        return (ops / 1000).toFixed(2) + "K";
    return String(ops);
}
function printResult(name, result) {
    const pad = 40 - name.length;
    console.log(`  ${name}${" ".repeat(Math.max(1, pad))}${formatOps(result.opsPerSec).padStart(10)} ops/sec   ${result.avgMs.toFixed(4).padStart(10)} ms/op`);
}
// ---------------------------------------------------------------------------
// Benchmarks
// ---------------------------------------------------------------------------
function benchFlatPage() {
    return Div(ForEach(1000, (i) => Div(`Item ${i}`).setId(`item-${i}`).padding("4").background("white")));
}
function benchDeepTree(depth) {
    if (depth === 0)
        return Span("leaf");
    return Div(benchDeepTree(depth - 1)).padding("2");
}
function benchHeavyEscaping() {
    const nasty = `<script>alert("xss")</script> & "quotes" & 'apostrophes' <b>bold</b>`;
    return Div(ForEach(200, () => P(nasty)));
}
function benchHtmxAttributes() {
    return Div(ForEach(100, (i) => Button(`Button ${i}`)
        .setHtmx(`/api/button/${i}`, { method: "post", swap: "none" })
        .padding("x", "4").padding("y", "2").background("blue-500").textColor("white").rounded()));
}
function benchVariantHeavy() {
    return Div(ForEach(100, (i) => Button(`Button ${i}`)
        .padding("x", "4").padding("y", "2").background("blue-500").textColor("white").rounded()
        .transition("colors")
        .on("hover", t => t.background("blue-600").scale("105").textColor("white").shadow("lg"))
        .on("focus", t => t.ring("2").ringColor("blue-300").outline("none").shadow("md"))
        .on("disabled", t => t.opacity("50").cursor("not-allowed").background("gray-400"))
        .at("md", t => t.padding("x", "8").textSize("lg").rounded("lg"))
        .at("lg", t => t.padding("x", "12").textSize("xl"))));
}
function benchLargeForEach() {
    return Div(ForEach(5000, (i) => Div(`Item ${i}`).setId(`item-${i}`)));
}
function benchRealisticPage() {
    return Div(Header(Nav(Ul(Li(A("Home").setClass("nav-link").padding("x", "4").padding("y", "2")), Li(A("About").setClass("nav-link").padding("x", "4").padding("y", "2")), Li(A("Products").setClass("nav-link").padding("x", "4").padding("y", "2")), Li(A("Contact").setClass("nav-link").padding("x", "4").padding("y", "2"))).flex().gap("4")).padding("4").background("white").shadow("md")), Main(Section(H1("Welcome to Our Store").textSize("3xl").bold().margin("b", "4"), P("Browse our collection of fine products.").textColor("gray-600")).padding("8"), Section(H2("Featured Products").textSize("2xl").bold().margin("b", "6"), Div(ForEach(12, (i) => Article(Img().addAttribute("src", `/img/product-${i}.jpg`).addAttribute("alt", `Product ${i}`).w("full").h("48").objectFit("cover"), Div(H2(`Product ${i}`).textSize("lg").bold(), P(`$${(i + 1) * 9.99}`).textColor("green-600").bold(), P("Lorem ipsum dolor sit amet, consectetur adipiscing elit.").textColor("gray-500").textSize("sm"), Button("Add to Cart")
        .setHtmx(`/cart/add/${i}`, { method: "post", swap: "none" })
        .padding("x", "4").padding("y", "2").background("blue-500").textColor("white").rounded()).padding("4")).border().rounded("lg").overflow("hidden"))).grid().gridCols("3").gap("6")).padding("8"), Section(H2("Customer Reviews").textSize("2xl").bold().margin("b", "4"), Table(Thead(Tr(Th("Name"), Th("Rating"), Th("Comment"))), Tbody(ForEach(10, (i) => Tr(Td(`Customer ${i}`).padding("2").border(), Td(`${"★".repeat(3 + (i % 3))}`).padding("2").border(), Td("Great product, highly recommended!").padding("2").border())))).w("full").border()).padding("8")), Footer(Div(P("© 2026 Our Store. All rights reserved.").textColor("gray-400"), Ul(Li(A("Privacy").textColor("gray-400")), Li(A("Terms").textColor("gray-400")), Li(A("Support").textColor("gray-400"))).flex().gap("4")).flex().justifyContent("between").alignItems("center").padding("8")).background("gray-800"));
}
// ---------------------------------------------------------------------------
// Memory measurement
// ---------------------------------------------------------------------------
function measureMemory(name, fn, count) {
    global.gc?.();
    const before = process.memoryUsage();
    for (let i = 0; i < count; i++)
        fn();
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
console.log("");
console.log("Fold & Context benchmarks:");
console.log("─".repeat(72));
printResult("foldView count (realistic page)", measure("fold-count", () => foldView(countAlgebra, realisticPage), ITERATIONS));
const ThemeCtx = createContext("light");
printResult("Context scope/read (1000 scopes)", measure("context", () => {
    for (let i = 0; i < 1000; i++) {
        const env_1 = { stack: [], error: void 0, hasError: false };
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _s = __addDisposableResource(env_1, ThemeCtx.scope("dark"), false);
            void ThemeCtx.current;
        }
        catch (e_1) {
            env_1.error = e_1;
            env_1.hasError = true;
        }
        finally {
            __disposeResources(env_1);
        }
    }
}, ITERATIONS));
console.log("");
console.log("Memory usage:");
console.log("─".repeat(72));
if (global.gc) {
    measureMemory("Flat page construction (1000 divs)", () => benchFlatPage(), 100);
    measureMemory("Realistic page construction", () => benchRealisticPage(), 100);
    measureMemory("Flat page render (1000 divs)", () => render(flatPage), 100);
    measureMemory("Realistic page render", () => render(realisticPage), 100);
}
else {
    console.log("  (Run with --expose-gc for memory measurements)");
}
console.log("");
//# sourceMappingURL=render.js.map