---
title: "fluent-html"
tagline: "Type-safe, chainable HTML builder for TypeScript with zero dependencies"
type: library
status: live
year: 2024
stack: [TypeScript]
featured: true
order: 1
url: "https://www.npmjs.com/package/fluent-html"
tags: [library, open-source, html, typescript, ssr, htmx, tailwind, developer-tools]
blog: true
blogDate: "2024-11-01"
---

## Overview

fluent-html is a chainable, type-safe HTML builder for TypeScript. It replaces template strings and JSX with pure function calls that return chainable tag objects — every element, attribute, HTMX option, and Tailwind value is autocompleted and validated at compile time. Zero dependencies, ~15KB minified, built for server-side rendering. It powers every SSR application at JT Digital.

## Challenge

Building server-rendered HTML in TypeScript forces a bad trade-off. Template literals give zero type safety and no XSS protection. Template engines like EJS or Pug introduce a separate syntax with no IDE support. JSX requires a build step and a virtual DOM runtime that adds complexity to what should be a simple string-rendering task. None of these options give developers the autocomplete, refactoring, and compile-time validation they expect from TypeScript.

HTMX makes this worse — `hx-target="#userList"` silently fails when the element has `id="user-list"`. Route paths are duplicated between views and controllers. Tailwind classes are unvalidated strings. The entire UI layer becomes a minefield of runtime bugs that the type system could have caught.

## Solution

fluent-html models HTML as plain TypeScript function calls. `Div(H1("Title"), P("Body"))` returns a chainable object with typed methods for every attribute, style, and HTMX option. The compiler catches typos, missing parameters, and invalid values before the code ever runs.

Type-safe HTMX integration means routes defined with `defineRoutes()` are shared between views and controllers — path parameters are extracted at the type level, and targets created with `defineIds()` are compile-time validated across files. The fluent Tailwind API replaces class strings with chainable methods like `.background("blue-500").padding("4").rounded("lg")`, each with full autocomplete.

All text content and attributes are automatically XSS-escaped. The library ships with zero dependencies and renders to strings on the server with no virtual DOM overhead.

## Features

- **Fluent chainable API** — every HTML element is a function that returns a chainable tag object with typed methods for attributes, styles, and HTMX
- **Full IDE autocomplete** — every method, attribute value, Tailwind class, HTMX trigger, swap strategy, and sync mode is suggested as you type
- **Type-safe HTMX 4** — `defineRoutes()` for compile-time validated endpoints, `defineIds()` for validated targets, morph swaps, partial multi-swap, status-code routing
- **Fluent Tailwind CSS** — `.background()`, `.padding()`, `.flex()`, `.rounded()` and 50+ chainable methods replace class strings, with `.on()` for pseudo-classes and `.at()` for breakpoints
- **Automatic XSS protection** — all text and attributes escaped by default, `Raw()` opt-in for trusted content
- **Control flow primitives** — `IfThen` with nullable narrowing, `Match` with discriminated union support, `ForEach` with three overloads
- **Behavior system** — type-safe `hx-on:*` attributes for toggle, clipboard, remove, disable, and more — no client-side runtime
- **Fold / catamorphism** — generic view traversals via `foldView` with pre-built and custom algebras
- **ESLint plugin** — 16 rules catching style overwrites, class conflicts, HTMX pitfalls, and API misuse (8 with auto-fix)
- **Tailwind CSS extractor** — teaches Tailwind to generate CSS from fluent method calls
- **Zero dependencies** — pure TypeScript, ~15KB minified, SSR-ready

## Results

- **Adopted across all JT Digital projects** — JT Vault, Tela, TTL, GZS Inovacije, and the Rideshare platform all use fluent-html as their rendering layer
- **Published on npm** — open-source with ESLint plugin and Tailwind extractor as companion packages
- **Eliminated an entire class of bugs** — HTMX target mismatches, route path drift, and XSS vulnerabilities are now compile errors instead of runtime failures
- **Developer velocity** — IDE autocomplete means less documentation lookup; type safety means fewer debugging sessions
