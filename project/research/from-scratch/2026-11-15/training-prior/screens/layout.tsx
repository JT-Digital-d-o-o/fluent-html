import { mainContent, type Child } from "rtsx";

export function Layout({ title, children }: { title: string; children?: Child }) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
        <link rel="stylesheet" href="/css/app.css" />
        <script src="/js/htmx.min.js" defer />
      </head>
      <body class="bg-surface text-text">
        <main id={mainContent} class="mx-auto max-w-3xl p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
