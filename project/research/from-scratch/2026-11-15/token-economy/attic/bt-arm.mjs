// The bench page (fluent-html 8's "Realistic page (~200 tags)") in Backtick Tags' idiomatic API.
// Differences from expected.fh8.html, both from the API's defaults: every <button> carries
// type="button", and siblings are not separated by newlines.
import {
  routes, post, div, header, nav, ul, li, a, main, section, h1, h2, p, article, img, button,
  table, thead, tbody, tr, th, td, footer, cls,
} from "../bt.ts";

export const name = "backtick-tags";

const cart = routes("/cart", { add: post("/add/:id") });
const navLink = cls`nav-link px-4 py-2`;
const range = (n, f) => Array.from({ length: n }, (_, i) => f(i));

export function build() {
  return div(
    header(
      nav`p-4 bg-white shadow-md`(
        ul`flex gap-4`(
          li(a`${navLink}`("Home")),
          li(a`${navLink}`("About")),
          li(a`${navLink}`("Products")),
          li(a`${navLink}`("Contact")),
        ),
      ),
    ),
    main(
      section`p-8`(
        h1`text-3xl font-bold mb-4`("Welcome to Our Store"),
        p`text-gray-600`("Browse our collection of fine products."),
      ),
      section`p-8`(
        h2`text-2xl font-bold mb-6`("Featured Products"),
        div`grid grid-cols-3 gap-6`(
          range(12, (i) =>
            article`border rounded-lg overflow-hidden`(
              img`w-full h-48 object-cover`({ src: `/img/product-${i}.jpg`, alt: `Product ${i}` }),
              div`p-4`(
                h2`text-lg font-bold`(`Product ${i}`),
                p`text-green-600 font-bold`(`$${(i + 1) * 9.99}`),
                p`text-gray-500 text-sm`("Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
                button`px-4 py-2 bg-blue-500 text-white rounded`(cart.add({ id: i }).fire(), "Add to Cart"),
              ),
            ),
          ),
        ),
      ),
      section`p-8`(
        h2`text-2xl font-bold mb-4`("Customer Reviews"),
        table`w-full border`(
          thead(tr(th("Name"), th("Rating"), th("Comment"))),
          tbody(
            range(10, (i) =>
              tr(
                td`p-2 border`(`Customer ${i}`),
                td`p-2 border`("★".repeat(3 + (i % 3))),
                td`p-2 border`("Great product, highly recommended!"),
              ),
            ),
          ),
        ),
      ),
    ),
    footer`bg-gray-800`(
      div`flex justify-between items-center p-8`(
        p`text-gray-400`("© 2026 Our Store. All rights reserved."),
        ul`flex gap-4`(
          li(a`text-gray-400`("Privacy")),
          li(a`text-gray-400`("Terms")),
          li(a`text-gray-400`("Support")),
        ),
      ),
    ),
  );
}

export const render = (view) => view.h;
