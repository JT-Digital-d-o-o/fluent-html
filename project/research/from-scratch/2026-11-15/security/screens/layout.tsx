import type { Child } from "sealed";

export function Layout({ title, children }: { title: string; children?: Child }) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <link rel="stylesheet" href="/css/app.css" />
        <script src="/js/htmx.js" defer />
      </head>
      <body class="bg-bg text-text">
        <main id="main-content" class="mx-auto max-w-3xl p-6">{children}</main>
      </body>
    </html>
  );
}
