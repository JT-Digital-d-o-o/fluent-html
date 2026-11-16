// The bench page in Hoisted HTML's own idiom: literal HTML and classes, a route for the cart
// action, type="button" on the buttons (the template compiler refuses a <button> without one).
import { html, render } from "../src/hh-join.ts";
import { defineRoutes } from "../src/hx-join.ts";

export const name = "hoisted-html-join";

const cart = defineRoutes("/cart", { add: { method: "post", path: "/add/:id", params: { id: "number" }, machine: true } });
const range = (n) => Array.from({ length: n }, (_, i) => i);
const PRODUCTS = range(12);
const REVIEWS = range(10);
const NAV = ["Home", "About", "Products", "Contact"];

const NavLink = (label) => html`<li><a class="nav-link px-4 py-2">${label}</a></li>`;

const Product = (i) => html`
  <article class="border rounded-lg overflow-hidden">
    <img class="w-full h-48 object-cover" src="/img/product-${i}.jpg" alt="Product ${i}">
    <div class="p-4">
      <h2 class="text-lg font-bold">Product ${i}</h2>
      <p class="text-green-600 font-bold">${"$" + (i + 1) * 9.99}</p>
      <p class="text-gray-500 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      <button type="button" class="px-4 py-2 bg-blue-500 text-white rounded" hx-post="${cart.add({ id: i })}">Add to Cart</button>
    </div>
  </article>`;

const Review = (i) => html`
  <tr>
    <td class="p-2 border">Customer ${i}</td>
    <td class="p-2 border">${"★".repeat(3 + (i % 3))}</td>
    <td class="p-2 border">Great product, highly recommended!</td>
  </tr>`;

export function build() {
  return html`
    <div>
      <header>
        <nav class="p-4 bg-white shadow-md">
          <ul class="flex gap-4">${NAV.map(NavLink)}</ul>
        </nav>
      </header>
      <main>
        <section class="p-8">
          <h1 class="text-3xl font-bold mb-4">Welcome to Our Store</h1>
          <p class="text-gray-600">Browse our collection of fine products.</p>
        </section>
        <section class="p-8">
          <h2 class="text-2xl font-bold mb-6">Featured Products</h2>
          <div class="grid grid-cols-3 gap-6">${PRODUCTS.map(Product)}</div>
        </section>
        <section class="p-8">
          <h2 class="text-2xl font-bold mb-4">Customer Reviews</h2>
          <table class="w-full border">
            <thead>
              <tr><th>Name</th><th>Rating</th><th>Comment</th></tr>
            </thead>
            <tbody>${REVIEWS.map(Review)}</tbody>
          </table>
        </section>
      </main>
      <footer class="bg-gray-800">
        <div class="flex justify-between items-center p-8">
          <p class="text-gray-400">© 2026 Our Store. All rights reserved.</p>
          <ul class="flex gap-4">
            <li><a class="text-gray-400">Privacy</a></li>
            <li><a class="text-gray-400">Terms</a></li>
            <li><a class="text-gray-400">Support</a></li>
          </ul>
        </div>
      </footer>
    </div>`;
}

export { render };
