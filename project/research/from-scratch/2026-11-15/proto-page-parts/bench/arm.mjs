// The bench page (fluent-html 8's benchRealisticPage) in Page Parts' raw-element layer:
// the escape hatch under the parts, which is the slowest path the design has for static markup.
// The cart button uses hx(), the raw htmx hatch; Button defaults to type="button".
import { Div, H1, H2, P, Nav, Header, Footer, Section, Article, Ul, Li, A, Button, Table, Thead, Tbody, Tr, Th, Td, Img, Main, asset, local, hx } from "../kit/index.ts";

export const name = "page-parts";

const range = (n) => Array.from({ length: n }, (_, i) => i);
const navLink = "nav-link px-4 py-2";
const cell = "p-2 border";

export function build() {
  return Div(
    Header(
      Nav({ class: "p-4 bg-white shadow-md" },
        Ul({ class: "flex gap-4" },
          Li(A({ class: navLink }, "Home")),
          Li(A({ class: navLink }, "About")),
          Li(A({ class: navLink }, "Products")),
          Li(A({ class: navLink }, "Contact")),
        ),
      ),
    ),
    Main(
      Section({ class: "p-8" },
        H1({ class: "text-3xl font-bold mb-4" }, "Welcome to Our Store"),
        P({ class: "text-gray-600" }, "Browse our collection of fine products."),
      ),
      Section({ class: "p-8" },
        H2({ class: "text-2xl font-bold mb-6" }, "Featured Products"),
        Div({ class: "grid grid-cols-3 gap-6" },
          range(12).map((i) =>
            Article({ class: "border rounded-lg overflow-hidden" },
              Img({ class: "w-full h-48 object-cover", src: asset(`/img/product-${i}.jpg`), alt: `Product ${i}` }),
              Div({ class: "p-4" },
                H2({ class: "text-lg font-bold" }, `Product ${i}`),
                P({ class: "text-green-600 font-bold" }, `$${(i + 1) * 9.99}`),
                P({ class: "text-gray-500 text-sm" }, "Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
                Button({ class: "px-4 py-2 bg-blue-500 text-white rounded", wire: hx({ post: local(`/cart/add/${i}`), swap: "none" }) }, "Add to Cart"),
              ),
            ),
          ),
        ),
      ),
      Section({ class: "p-8" },
        H2({ class: "text-2xl font-bold mb-4" }, "Customer Reviews"),
        Table({ class: "w-full border" },
          Thead(Tr(Th("Name"), Th("Rating"), Th("Comment"))),
          Tbody(
            range(10).map((i) =>
              Tr(
                Td({ class: cell }, `Customer ${i}`),
                Td({ class: cell }, "★".repeat(3 + (i % 3))),
                Td({ class: cell }, "Great product, highly recommended!"),
              ),
            ),
          ),
        ),
      ),
    ),
    Footer({ class: "bg-gray-800" },
      Div({ class: "flex justify-between items-center p-8" },
        P({ class: "text-gray-400" }, "© 2026 Our Store. All rights reserved."),
        Ul({ class: "flex gap-4" },
          Li(A({ class: "text-gray-400" }, "Privacy")),
          Li(A({ class: "text-gray-400" }, "Terms")),
          Li(A({ class: "text-gray-400" }, "Support")),
        ),
      ),
    ),
  );
}

export const render = (view) => view.html;
