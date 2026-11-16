// Ceiling calibration, not a design: the bench page as hand-written template literals with
// an escape call on every interpolated value. Output must equal expected.fh8.html byte for byte.
export const name = "template-literal-ceiling";

const RE = /[&<>"']/;
const MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = (s) => (RE.test(s) ? s.replace(/[&<>"']/g, (c) => MAP[c]) : s);

const navLink = (label) => `<li><a class="nav-link px-4 py-2">${esc(label)}</a></li>`;

const product = (i) =>
  `<article class="border rounded-lg overflow-hidden"><img class="w-full h-48 object-cover" src="${esc(`/img/product-${i}.jpg`)}" alt="${esc(`Product ${i}`)}">\n` +
  `<div class="p-4"><h2 class="text-lg font-bold">${esc(`Product ${i}`)}</h2>\n` +
  `<p class="text-green-600 font-bold">${esc(`$${(i + 1) * 9.99}`)}</p>\n` +
  `<p class="text-gray-500 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>\n` +
  `<button class="px-4 py-2 bg-blue-500 text-white rounded" hx-post="${esc(`/cart/add/${i}`)}" hx-swap="none">Add to Cart</button></div></article>`;

const review = (i) =>
  `<tr><td class="p-2 border">${esc(`Customer ${i}`)}</td>\n` +
  `<td class="p-2 border">${esc("★".repeat(3 + (i % 3)))}</td>\n` +
  `<td class="p-2 border">Great product, highly recommended!</td></tr>`;

const range = (n, f) => {
  let s = "";
  for (let i = 0; i < n; i++) s += (i ? "\n" : "") + f(i);
  return s;
};

export function build() {
  return (
    `<div><header><nav class="p-4 bg-white shadow-md"><ul class="flex gap-4">${["Home", "About", "Products", "Contact"].map(navLink).join("\n")}</ul></nav></header>\n` +
    `<main><section class="p-8"><h1 class="text-3xl font-bold mb-4">Welcome to Our Store</h1>\n` +
    `<p class="text-gray-600">Browse our collection of fine products.</p></section>\n` +
    `<section class="p-8"><h2 class="text-2xl font-bold mb-6">Featured Products</h2>\n` +
    `<div class="grid grid-cols-3 gap-6">${range(12, product)}</div></section>\n` +
    `<section class="p-8"><h2 class="text-2xl font-bold mb-4">Customer Reviews</h2>\n` +
    `<table class="w-full border"><thead><tr><th>Name</th>\n<th>Rating</th>\n<th>Comment</th></tr></thead>\n` +
    `<tbody>${range(10, review)}</tbody></table></section></main>\n` +
    `<footer class="bg-gray-800"><div class="flex justify-between items-center p-8"><p class="text-gray-400">© 2026 Our Store. All rights reserved.</p>\n` +
    `<ul class="flex gap-4"><li><a class="text-gray-400">Privacy</a></li>\n<li><a class="text-gray-400">Terms</a></li>\n<li><a class="text-gray-400">Support</a></li></ul></div></footer></div>`
  );
}

export const render = (s) => s;
