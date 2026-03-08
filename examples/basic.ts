/**
 * Basic example — Hello World render
 *
 * Run: npx tsx examples/basic.ts
 */
import { Div, H1, P, Span, Strong, render } from '../src/index.js';

// Simple text content
const greeting = H1("Hello, fluent-html!");

// Nested elements with variadic children
const page = Div(
  greeting,
  P("Build HTML with ", Strong("chainable methods"), " and ", Span("full type safety"), "."),
  P("Zero dependencies, SSR-ready, ~15KB minified."),
);

console.log(render(page));
