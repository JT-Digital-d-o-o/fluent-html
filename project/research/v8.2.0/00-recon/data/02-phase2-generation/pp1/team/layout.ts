import { Body, Head, Html, Meta, Script, Title, render } from "fluent-html";

// Standalone shell for the page. If the app already has a shared layout (and a Tailwind build), use that instead.
const HTMX_SRC = "https://unpkg.com/htmx.org@2.0.4";
const TAILWIND_SRC = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";

export function renderDocument(title: string, content: Parameters<typeof Body>[number]): string {
  const page = Html(
    Head(
      Meta().addAttribute("charset", "utf-8"),
      Meta().addAttribute("name", "viewport").addAttribute("content", "width=device-width, initial-scale=1"),
      Title(title),
      Script().addAttribute("src", HTMX_SRC),
      Script().addAttribute("src", TAILWIND_SRC),
    ),
    Body(content).addClass("min-h-screen bg-slate-50 text-slate-900 antialiased"),
  ).addAttribute("lang", "en");

  return `<!DOCTYPE html>${render(page)}`;
}
