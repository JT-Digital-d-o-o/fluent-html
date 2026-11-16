// The bench page (fluent-html 8's "Realistic page (~200 tags)") in Lean Tags' idiomatic API.
// Differences from expected.fh8.html, both from the API's defaults: every <button> carries
// type="button", and siblings are not separated by newlines.
import {
  routes, post, div, header, nav, ul, li, a, main, section, h1, h2, p, article, img, button,
  table, thead, tbody, tr, th, td, footer, tw,
} from "../lt.ts";

export const name = "lean-tags";

const cart = routes("/cart", { add: post("/add/:id") });
const navLink = tw`nav-link px-4 py-2`;
const range = (n, f) => Array.from({ length: n }, (_, i) => f(i));

export function build() {
  return div(
    header(
      nav(tw`p-4 bg-white shadow-md`,
        ul(tw`flex gap-4`,
          li(a(navLink, "Home")),
          li(a(navLink, "About")),
          li(a(navLink, "Products")),
          li(a(navLink, "Contact")),
        ),
      ),
    ),
    main(
      section(tw`p-8`,
        h1(tw`text-3xl font-bold mb-4`, "Welcome to Our Store"),
        p(tw`text-gray-600`, "Browse our collection of fine products."),
      ),
      section(tw`p-8`,
        h2(tw`text-2xl font-bold mb-6`, "Featured Products"),
        div(tw`grid grid-cols-3 gap-6`,
          range(12, (i) =>
            article(tw`border rounded-lg overflow-hidden`,
              img(tw`w-full h-48 object-cover`, { src: `/img/product-${i}.jpg`, alt: `Product ${i}` }),
              div(tw`p-4`,
                h2(tw`text-lg font-bold`, `Product ${i}`),
                p(tw`text-green-600 font-bold`, `$${(i + 1) * 9.99}`),
                p(tw`text-gray-500 text-sm`, "Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
                button(tw`px-4 py-2 bg-blue-500 text-white rounded`, cart.add({ id: i }).fire(), "Add to Cart"),
              ),
            ),
          ),
        ),
      ),
      section(tw`p-8`,
        h2(tw`text-2xl font-bold mb-4`, "Customer Reviews"),
        table(tw`w-full border`,
          thead(tr(th("Name"), th("Rating"), th("Comment"))),
          tbody(
            range(10, (i) =>
              tr(
                td(tw`p-2 border`, `Customer ${i}`),
                td(tw`p-2 border`, "★".repeat(3 + (i % 3))),
                td(tw`p-2 border`, "Great product, highly recommended!"),
              ),
            ),
          ),
        ),
      ),
    ),
    footer(tw`bg-gray-800`,
      div(tw`flex justify-between items-center p-8`,
        p(tw`text-gray-400`, "© 2026 Our Store. All rights reserved."),
        ul(tw`flex gap-4`,
          li(a(tw`text-gray-400`, "Privacy")),
          li(a(tw`text-gray-400`, "Terms")),
          li(a(tw`text-gray-400`, "Support")),
        ),
      ),
    ),
  );
}

export const render = (view) => view.h;
