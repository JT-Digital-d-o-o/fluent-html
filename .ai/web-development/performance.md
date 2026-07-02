# Web Performance Guidelines

---

## HTTPS & HSTS

- **DO:** Redirect HTTP → HTTPS via 301 at server level (Apache `RewriteRule`), not app-level
- **DO:** Set HSTS header: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- **DON'T:** Serve any content over plain HTTP

---

## TLS

- **DO:** Verify TLS 1.3 is active (saves 1 RTT over 1.2)
- **DO:** Use ECDSA certificates over RSA (smaller handshake, fits better in first 14KB)
- **DO:** Enable OCSP Stapling (saves 1 RTT — no extra CA request)

---

## HTTP/2 & HTTP/3

- **DO:** Serve over HTTP/2 minimum, HTTP/3 (QUIC) preferred
- **DO:** Set `Alt-Svc: h3=":443"` header so browsers upgrade automatically
- **DON'T:** Use HTTP/1.1 anti-patterns: domain sharding, CSS/JS concatenation hacks, sprite sheets — HTTP/2 multiplexes natively

---

## Static Asset Caching

### DO: Fingerprint static assets

Use content-hash in filename and cache forever:
```
styles.compiled.45bf618d.css → Cache-Control: public, max-age=31536000, immutable
```

### DO: Use correct cache headers per resource type

- **HTML:** `Cache-Control: no-cache` (always revalidate)
- **Fingerprinted assets:** `Cache-Control: public, max-age=31536000, immutable`
- **Semi-dynamic (API/feeds):** `Cache-Control: public, max-age=60, stale-while-revalidate=3600`

### DO: Set `Vary: Accept-Encoding` on compressible responses

Without it, a CDN may cache Brotli and serve it to a gzip-only client.

### DON'T: Long `max-age` without fingerprinting — stale assets after deploy

### DON'T: `max-age=0` on static assets — re-downloads on every navigation

---

## Compression

- **DO:** Enable Brotli (preferred) + gzip (fallback) for HTML, CSS, JS, JSON, SVG
- On shared hosting, compression is typically proxy-level — if not, use `AddOutputFilterByType DEFLATE` in `.htaccess`

---

## Font Loading

### DO: Self-host fonts (preferred)

```html
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
```
```css
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter.woff2") format("woff2");
  font-display: swap;
}
```

### DO: Google Fonts — correct preconnect pattern

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
```

### DON'T: Omit `crossorigin` on `fonts.gstatic.com` — font files use CORS, without it the preconnect is wasted

### DON'T: Omit `display=swap` — blocks rendering until font loads

---

## Resource Hints

- **`preconnect`** — critical third-party origins used in first render (fonts, CDN). Add `crossorigin` for CORS origins
- **`preload`** — critical CSS/JS that must load immediately
- **`dns-prefetch`** — non-critical origins loaded later (analytics, widgets)
- **DON'T:** Over-preload — each hint competes for bandwidth

---

## Loading Order

### DO: Follow this `<head>` order

1. Meta tags (`charset`, `viewport`)
2. Preconnect to critical origins
3. Preload critical assets
4. Critical CSS (`<link rel="stylesheet">`)
5. Font stylesheets
6. JS with `defer`
7. DNS prefetch for non-critical origins

### DO: Default to `defer` on scripts — downloads in parallel, executes after parse, preserves order

### DON'T: Use bare `<script>` without `defer` or `async` — blocks HTML parsing

### DON'T: Use `async` for app code — execution order is not guaranteed

---

## Response Streaming (Fastify SSR)

- **DO:** Stream HTML as it's generated — browser starts loading CSS/fonts before full response arrives
- **DO:** Get CSS `<link>` tags and above-fold HTML into the **first 14KB** (TCP slow start limit)

---

## Cold Start (Passenger / Shared Hosting)

- **DO:** Set `PassengerMinInstances 1` to keep the process alive
- If the host blocks that directive, use a cron keepalive: `*/4 * * * * curl -s -o /dev/null https://example.com`

---

## Images

- **DO:** Set `width` and `height` on all `<img>` — prevents layout shift (CLS)
- **DO:** `loading="lazy"` on below-fold images
- **DO:** Use modern formats: AVIF > WebP > JPEG, with `<picture>` fallbacks
- **DO:** Use `srcset` + `sizes` for responsive images
- **DO:** SVG for icons, logos, illustrations
- **DON'T:** Serve 2000px images for 400px display

---

## Core Web Vitals Targets

- **LCP** < 2.5s — fix: fast TTFB, `defer` scripts, optimize hero images, `display=swap`
- **INP** < 200ms — fix: minimize main-thread work
- **CLS** < 0.1 — fix: `width`/`height` on images, `font-display: swap`, don't inject content above existing content

---

## Mobile

- **DO:** Minimize requests — mobile radio wake-up costs 100-2000ms from idle
- **DO:** Respect `Save-Data` header — skip non-essential images/videos
- **DO:** Adapt loading by `navigator.connection.effectiveType`
