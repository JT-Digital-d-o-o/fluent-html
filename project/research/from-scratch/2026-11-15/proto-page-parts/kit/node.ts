// Serves an app() over node:http: the request in, the answer out. Static files (the built CSS, htmx) come from `publicDir`.
import { createServer, type Server } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import type { KitResponse } from "./parts.ts";

type Site = { handle(req: { method: string; url: string; headers?: Record<string, string | undefined>; body?: Record<string, string> }): Promise<KitResponse> };
const TYPES: Record<string, string> = { ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon" };

export function listen(site: Site, options: { port: number; publicDir?: string }): Server {
  const server = createServer(async (req, res) => {
    try {
      const url = req.url ?? "/";
      const ext = extname(url.split("?")[0]!);
      if (options.publicDir !== undefined && ext in TYPES) {
        const file = join(options.publicDir, normalize(url.split("?")[0]!).replace(/^(\.\.[/\\])+/, ""));
        res.writeHead(200, { "content-type": TYPES[ext]! }).end(await readFile(file).catch(() => ""));
        return;
      }
      let raw = "";
      for await (const chunk of req) raw += chunk;
      const body = Object.fromEntries(new URLSearchParams(raw));
      const headers: Record<string, string | undefined> = {};
      for (const [k, v] of Object.entries(req.headers)) headers[k] = Array.isArray(v) ? v[0] : v;
      const out = await site.handle({ method: req.method ?? "GET", url, headers, body });
      res.writeHead(out.status, out.headers).end(out.body);
    } catch (e) {
      console.error(e);
      res.writeHead(500, { "content-type": "text/plain" }).end("Internal error");
    }
  });
  return server.listen(options.port);
}
