// The bench page (fluent-html 8's "Realistic page (~200 tags)", fixtures/bench/arms/fluent-html-8.mjs)
// written in fluent-html 9 as Claude Code would write it: class text through .tw(), Button() as
// type="button", the image through its typed setters. Type-checked by `npm run check`, run by
// node's type stripping.
import {
  render, Div, H1, H2, P, Nav, Header, Footer, Section, Article,
  Ul, Li, A, Button, Table, Thead, Tbody, Tr, Th, Td, Img, Main, ForEach,
} from "fluent-html";
import { assetUrl } from "fluent-html/htmx";

export const name = "fluent-html-9 (prototype)";

export function build() {
  return Div(
    Header(
      Nav(
        Ul(
          Li(A("Home").cssClass("nav-link").tw("px-4 py-2")),
          Li(A("About").cssClass("nav-link").tw("px-4 py-2")),
          Li(A("Products").cssClass("nav-link").tw("px-4 py-2")),
          Li(A("Contact").cssClass("nav-link").tw("px-4 py-2")),
        ).tw("flex gap-4"),
      ).tw("p-4 bg-white shadow-md"),
    ),
    Main(
      Section(
        H1("Welcome to Our Store").tw("text-3xl font-bold mb-4"),
        P("Browse our collection of fine products.").tw("text-gray-600"),
      ).tw("p-8"),
      Section(
        H2("Featured Products").tw("text-2xl font-bold mb-6"),
        Div(
          ForEach(12, (i) =>
            Article(
              Img().setSrc(`/img/product-${i}.jpg`).setAlt(`Product ${i}`).tw("w-full h-48 object-cover"),
              Div(
                H2(`Product ${i}`).tw("text-lg font-bold"),
                P(`$${(i + 1) * 9.99}`).tw("text-green-600 font-bold"),
                P("Lorem ipsum dolor sit amet, consectetur adipiscing elit.").tw("text-gray-500 text-sm"),
                Button("Add to Cart")
                  .setHtmx(assetUrl(`/cart/add/${i}`), { method: "post", swap: "none" })
                  .tw("px-4 py-2 bg-blue-500 text-white rounded"),
              ).tw("p-4"),
            ).tw("border rounded-lg overflow-hidden"),
          ),
        ).tw("grid grid-cols-3 gap-6"),
      ).tw("p-8"),
      Section(
        H2("Customer Reviews").tw("text-2xl font-bold mb-4"),
        Table(
          Thead(Tr(Th("Name"), Th("Rating"), Th("Comment"))),
          Tbody(
            ForEach(10, (i) =>
              Tr(
                Td(`Customer ${i}`).tw("p-2 border"),
                Td(`${"★".repeat(3 + (i % 3))}`).tw("p-2 border"),
                Td("Great product, highly recommended!").tw("p-2 border"),
              ),
            ),
          ),
        ).tw("w-full border"),
      ).tw("p-8"),
    ),
    Footer(
      Div(
        P("© 2026 Our Store. All rights reserved.").tw("text-gray-400"),
        Ul(
          Li(A("Privacy").tw("text-gray-400")),
          Li(A("Terms").tw("text-gray-400")),
          Li(A("Support").tw("text-gray-400")),
        ).tw("flex gap-4"),
      ).tw("flex justify-between items-center p-8"),
    ).tw("bg-gray-800"),
  );
}

export { render };
