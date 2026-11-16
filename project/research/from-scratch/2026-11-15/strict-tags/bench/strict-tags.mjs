// The bench page (fluent-html 8's "Realistic page (~200 tags)") in Strict Tags' idiomatic API.
// Differences from expected.fh8.html, all from the design's rules: every <button> carries
// type="button", the seven links carry href="#" (a link needs a destination), and siblings are
// not separated by newlines.
import {
  routes, action, div, header, nav, ul, li, a, main, section, h1, h2, p, article, img, button,
  table, thead, tbody, tr, th, td, footer, cls, url, asset,
} from "../lib/index.ts";

export const name = "strict-tags";

const cart = routes("/cart", { add: action("/add/:id") });
const navLink = cls(cls.token("nav-link"), "px-4 py-2");
const nowhere = { href: url("#") };
const range = (n, f) => Array.from({ length: n }, (_, i) => f(i));
const price = (i) => "$" + (i + 1) * 9.99;

export function build() {
  return div(
    header(
      nav(cls("p-4 bg-white shadow-md"),
        ul(cls("flex gap-4"),
          li(a(navLink, nowhere, "Home")),
          li(a(navLink, nowhere, "About")),
          li(a(navLink, nowhere, "Products")),
          li(a(navLink, nowhere, "Contact")),
        ),
      ),
    ),
    main(
      section(cls("p-8"),
        h1(cls("text-3xl font-bold mb-4"), "Welcome to Our Store"),
        p(cls("text-gray-600"), "Browse our collection of fine products."),
      ),
      section(cls("p-8"),
        h2(cls("text-2xl font-bold mb-6"), "Featured Products"),
        div(cls("grid grid-cols-3 gap-6"),
          range(12, (i) =>
            article(cls("border rounded-lg overflow-hidden"),
              img(cls("w-full h-48 object-cover"), { src: asset(`/img/product-${i}.jpg`), alt: `Product ${i}` }),
              div(cls("p-4"),
                h2(cls("text-lg font-bold"), `Product ${i}`),
                p(cls("text-green-600 font-bold"), price(i)),
                p(cls("text-gray-500 text-sm"), "Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
                button(cls("px-4 py-2 bg-blue-500 text-white rounded"), cart.add({ id: i }).fire(), "Add to Cart"),
              ),
            ),
          ),
        ),
      ),
      section(cls("p-8"),
        h2(cls("text-2xl font-bold mb-4"), "Customer Reviews"),
        table(cls("w-full border"),
          thead(tr(th("Name"), th("Rating"), th("Comment"))),
          tbody(
            range(10, (i) =>
              tr(
                td(cls("p-2 border"), `Customer ${i}`),
                td(cls("p-2 border"), "★".repeat(3 + (i % 3))),
                td(cls("p-2 border"), "Great product, highly recommended!"),
              ),
            ),
          ),
        ),
      ),
    ),
    footer(cls("bg-gray-800"),
      div(cls("flex justify-between items-center p-8"),
        p(cls("text-gray-400"), "© 2026 Our Store. All rights reserved."),
        ul(cls("flex gap-4"),
          li(a(cls("text-gray-400"), nowhere, "Privacy")),
          li(a(cls("text-gray-400"), nowhere, "Terms")),
          li(a(cls("text-gray-400"), nowhere, "Support")),
        ),
      ),
    ),
  );
}

export const render = (view) => view.h;
