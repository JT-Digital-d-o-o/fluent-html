// The bench page: fluent-html 8's "Realistic page (~200 tags)" from bench/render.ts
// (benchRealisticPage), copied verbatim so every prototype renders the same page.
// Import path overridable with FH8_ENTRY (defaults to the repo's tracked dist at HEAD).
import { pathToFileURL } from "node:url";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const entry = process.env.FH8_ENTRY ?? resolve(here, "../../../../../../../dist/src/index.js");
const htmxEntry = resolve(dirname(entry), "htmx.js");
const fh = await import(pathToFileURL(entry).href);
const { assetUrl } = await import(pathToFileURL(htmxEntry).href);
const {
  render, Div, H1, H2, P, Nav, Header, Footer, Section, Article,
  Ul, Li, A, Button, Table, Thead, Tbody, Tr, Th, Td, Img, Main, ForEach,
} = fh;

export const name = "fluent-html-8";

export function build() {
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
                  .setHtmx(assetUrl(`/cart/add/${i}`), { method: "post", swap: "none" })
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

export { render };
