import type { Readable } from "node:stream";
import type { HTMX, HxStatusConfig } from "../htmx.js";
import { EMPTY_ATTRS } from "../core/tag.js";
import type { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
import { isTag, isRawString } from "../core/guards.js";
import { devChecks, nextRenderEpoch } from "../core/dev-checks.js";
import { escapeHtml, escapeAttr, sanitizeUrl } from "./escape.js";

// URL-valued attributes emitted by the typed setters. Their values are run
// through sanitizeUrl (scheme filtering) before attribute-escaping, so a
// `javascript:`/`vbscript:`/dangerous-`data:` URL from a typed setter can never
// reach the output. The untyped addAttribute bag is deliberately excluded — it
// is the explicit escape hatch (see sanitizeUrl's doc comment).
const URL_ATTRS = new Set(["href", "src", "action", "formaction", "data", "poster", "cite"]);

// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for HTML serialization.
//
// `render()` and `renderToStream()` are thin wrappers over `emit()` — one
// serializer, so they cannot drift (the old design had three: render, stream,
// and the fold renderAlgebra, which has been removed). The traversal is an
// explicit work-stack rather than recursion, so deeply nested trees no longer
// overflow the call stack. Output is byte-identical to the v5 recursive renderer.
// ─────────────────────────────────────────────────────────────────────────────

// HTML void elements — no closing tag, no children
export const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'source', 'track', 'wbr'
]);

/**
 * Render context — replaces the old tri-typed `boolean | string` flag.
 * `escape` HTML-escapes text (the default); `raw` passes text through
 * untouched; `script`/`style` sanitize closing tags that would break out.
 * @internal
 */
export type RenderCtx = 'escape' | 'raw' | 'script' | 'style';

/**
 * Output sink. `append` returns a backpressure signal (`false` ⇒ the consumer
 * is full). `StringSink` always returns `true`; a stream sink forwards the real
 * signal. The boolean is structurally present for the future incremental-
 * streaming path; `emit()` does not honor it yet (eager, like the v5 renderer).
 * @internal
 */
export interface Sink {
  append(s: string): boolean;
}

/** Accumulates into a string via `+=` (the measured-fastest accumulator). @internal */
export class StringSink implements Sink {
  html = '';
  append(s: string): boolean {
    this.html += s;
    return true;
  }
}

/**
 * Pushes each chunk to a `node:stream` Readable; `append` forwards the stream's
 * real backpressure signal (`push()` returns `false` when the buffer is full).
 * The signal is not honored yet — `emit()` is still eager, matching the v5
 * stream — but it is plumbed for the future incremental-streaming path (D-02).
 * @internal
 */
export class StreamSink implements Sink {
  constructor(private readonly stream: Readable) {}
  append(s: string): boolean {
    return this.stream.push(s);
  }
}

/** Per-render options bag. Re-exported publicly from the render barrel. */
export type RenderOptions = {
  /**
   * CSP nonce stamped on every `<script>` and `<style>` that has no author-set
   * nonce. Applied at RENDER time — the view tree is never mutated, so a shared
   * layout is safe to reuse across requests. An author `.setNonce(...)` wins.
   */
  readonly nonce?: string;
};

/** Options for the streaming render paths (`renderToStream` / `renderToIterable`). */
export type RenderStreamOptions = RenderOptions & {
  /** Minimum size (chars) of each streamed chunk; smaller writes are batched. Default 16384. */
  readonly chunkSize?: number;
  /** Readable `highWaterMark` (bytes) — the buffer level that triggers backpressure. */
  readonly highWaterMark?: number;
};

/** Default streamed-chunk size (~16 KB) — batches tiny tag writes into useful TCP payloads. */
export const DEFAULT_CHUNK_SIZE = 16384;

/**
 * Split variadic render args into the view + render options. The trailing arg is
 * treated as `RenderOptions` iff it is a plain object — i.e. NOT a View (Tag,
 * RawString, array, or string). Views are never plain objects, so this is
 * unambiguous. @internal
 */
export function splitArgs(args: readonly unknown[]): { view: View; opts: RenderStreamOptions | undefined } {
  const n = args.length;
  const last = n > 0 ? args[n - 1] : undefined;
  if (last !== null && typeof last === 'object' && !isTag(last) && !isRawString(last) && !Array.isArray(last)) {
    const views = args.slice(0, n - 1) as View[];
    return { view: views.length === 1 ? views[0]! : views, opts: last as RenderStreamOptions };
  }
  const views = args as View[];
  return { view: views.length === 1 ? views[0]! : views, opts: undefined };
}

// ── HTMX attribute serialization (single copy; was duplicated in render + stream)
//
// buildHtmx emits these as an unrolled, monomorphic `if` sequence rather than looping a
// config table: `htmx[key]` with a per-iteration key is a megamorphic dynamic read that
// V8 can't inline-cache, ~3x slower per htmx tag. Serialization helpers, inlined per attr:
//   escaped string  → ` hx-NAME="<escapeAttr(v)>"`
//   bool|string     → ` hx-NAME="<string?escapeAttr:v>"` (literal `false` is meaningful for push/replace-url)
//   bool flag        → ` hx-NAME="<v>"`
//   json|string     → ` hx-NAME="<escapeAttr(string?v:JSON.stringify(v))>"`
// The emitted names, order, and escaping below are byte-identical to the former table.

// A valid hx-status key: a 100–599 code or an Nxx wildcard (matches the HxStatusKey type).
const STATUS_KEY_RE = /^(?:[1-5][0-9]{2}|[1-5]xx)$/;

// A valid bare boolean-attribute name (set via `.toggle()`). The closed `BooleanAttribute`
// union blocks malformed names at compile time; this guards untyped (JS / `as any`) callers
// from injecting markup through a toggle name — anything with spaces, quotes, or `=` would
// break out of the tag. A bare name is letters, digits, and hyphens only.
const BOOLEAN_ATTR_RE = /^[a-zA-Z][a-zA-Z0-9-]*$/;

// id/class/style belong to their dedicated setters. Precedence on collision: dedicated field
// (when set) > generic bag > bare toggle. The bag loop gates on field-presence; this set guards
// the toggle loop against a reserved bare toggle (unreachable via the typed BooleanAttribute).
const RESERVED_BAG_KEYS = new Set<string>(['id', 'class', 'style']);

/** Serialize an HTMX config to its attribute string. @internal */
export function buildHtmx(htmx: HTMX): string {
  let result = 'hx-' + htmx.method + '="' + escapeAttr(htmx.endpoint) + '"';

  if (htmx.target !== undefined) result += ' hx-target="' + escapeAttr(htmx.target) + '"';
  if (htmx.swap !== undefined) result += ' hx-swap="' + escapeAttr(htmx.swap) + '"';
  // hx-swap-oob: any non-"true" value is read as a swap style, so `false` must omit the attr.
  if (htmx.swapOob !== undefined && htmx.swapOob !== false) result += ' hx-swap-oob="' + (typeof htmx.swapOob === 'string' ? escapeAttr(htmx.swapOob) : htmx.swapOob) + '"';
  if (htmx.select !== undefined) result += ' hx-select="' + escapeAttr(htmx.select) + '"';
  if (htmx.trigger !== undefined) result += ' hx-trigger="' + escapeAttr(htmx.trigger) + '"';
  // push-url / replace-url: the literal `false` is meaningful htmx grammar, so it is kept.
  if (htmx.pushUrl !== undefined) result += ' hx-push-url="' + (typeof htmx.pushUrl === 'string' ? escapeAttr(htmx.pushUrl) : htmx.pushUrl) + '"';
  if (htmx.replaceUrl !== undefined) result += ' hx-replace-url="' + (typeof htmx.replaceUrl === 'string' ? escapeAttr(htmx.replaceUrl) : htmx.replaceUrl) + '"';
  if (htmx.vals !== undefined) result += ' hx-vals="' + escapeAttr(typeof htmx.vals === 'string' ? htmx.vals : JSON.stringify(htmx.vals)) + '"';
  if (htmx.headers !== undefined) result += ' hx-headers="' + escapeAttr(JSON.stringify(htmx.headers)) + '"';
  if (htmx.include !== undefined) result += ' hx-include="' + escapeAttr(htmx.include) + '"';
  if (htmx.encoding !== undefined) result += ' hx-encoding="' + escapeAttr(htmx.encoding) + '"';
  if (htmx.validate !== undefined) result += ' hx-validate="' + htmx.validate + '"';
  if (htmx.confirm !== undefined) result += ' hx-confirm="' + escapeAttr(htmx.confirm) + '"';
  if (htmx.indicator !== undefined) result += ' hx-indicator="' + escapeAttr(htmx.indicator) + '"';
  if (htmx.disable !== undefined) result += ' hx-disable="' + escapeAttr(htmx.disable) + '"';
  if (htmx.sync !== undefined) result += ' hx-sync="' + escapeAttr(htmx.sync) + '"';
  if (htmx.preserve !== undefined) result += ' hx-preserve="' + htmx.preserve + '"';
  if (htmx.boost !== undefined) result += ' hx-boost="' + htmx.boost + '"';
  if (htmx.config !== undefined) result += ' hx-config="' + escapeAttr(typeof htmx.config === 'string' ? htmx.config : JSON.stringify(htmx.config)) + '"';

  // Special case: boolean-only attr. Gate on truthiness, not `!== undefined` —
  // `ignore: false` (e.g. from a feature flag) must NOT emit the enabling attribute.
  // `ignore` emits htmx 4's bare-boolean disable-processing attribute `hx-ignore`. (htmx 4
  // renamed htmx 2's `hx-disable` boolean to `hx-ignore`; in htmx 4 `hx-disable` is the
  // disabled-ELEMENTS selector — the `disable` field — so the two must not collide.)
  if (htmx.ignore) result += ' hx-ignore';

  // Status-code-specific swap behavior — the key becomes part of the attribute
  // NAME (`hx-status:<code>`), so a malformed key would be attribute-name injection.
  // The HxStatusKey type blocks it at compile time; this guards untyped callers.
  if (htmx.status) {
    const statusMap = htmx.status as Record<string, string | HxStatusConfig>;
    for (const code of Object.keys(statusMap)) {
      if (!STATUS_KEY_RE.test(code)) {
        throw new Error(`Invalid hx-status key: "${code}" — expected a 100-599 code or an Nxx wildcard (e.g. 404 or "5xx").`);
      }
      const cfg = statusMap[code]!;
      const value = typeof cfg === 'string' ? cfg : buildStatusConfig(cfg);
      result += ' hx-status:' + code + '="' + escapeAttr(value) + '"';
    }
  }

  return result;
}

function buildStatusConfig(cfg: HxStatusConfig): string {
  const parts: string[] = [];
  if (cfg.swap) parts.push('swap:' + cfg.swap);
  if (cfg.target) parts.push('target:' + cfg.target);
  if (cfg.select) parts.push('select:' + cfg.select);
  if (cfg.push !== undefined) parts.push('push:' + cfg.push);
  if (cfg.replace !== undefined) parts.push('replace:' + cfg.replace);
  if (cfg.transition !== undefined) parts.push('transition:' + cfg.transition);
  return parts.join(' ');
}

// Closing tags inside script/style (case-insensitive). Only the closer is neutralized:
// `<\/script` is byte-safe (the `\` lands before `/`, harmless in a JS string/regex, and
// `</script>` is never valid JS). Neutralizing the `<!--`/`<script` OPENERS (to defeat the
// HTML script-data-double-escaped state) was tried and reverted — a `\` before `!`/`script`
// corrupts benign JS (`/<script/` → whitespace regex; `<!--`/`a<scripts` → syntax errors).
// That hardening needs a byte-safe transform; parked (it only matters inside the raw-JS escape hatch).
const SCRIPT_CLOSE_RE = /<\/script/gi;
const STYLE_CLOSE_RE = /<\/style/gi;

/** Sanitize raw context content by escaping the closing tag that would break out. @internal */
export function sanitizeRawContent(content: string, element: 'script' | 'style'): string {
  if (element === 'script') {
    return content.replace(SCRIPT_CLOSE_RE, '<\\/script');
  }
  return content.replace(STYLE_CLOSE_RE, '<\\/style');
}

/** Build the attribute string for a tag's open element. @internal */
export function buildAttrs(tag: Tag): string {
  let attrs = '';

  const tid = tag.id;
  if (tid !== undefined) attrs += ' id="' + escapeAttr(tid) + '"';
  const tcls = tag.class;
  if (tcls !== undefined) attrs += ' class="' + escapeAttr(tcls) + '"';
  const tsty = tag.style;
  if (tsty !== undefined) attrs += ' style="' + escapeAttr(tsty) + '"';

  const sk = tag._sk;
  if (sk !== undefined) {
    const bag = tag as unknown as Record<string, unknown>;
    for (let i = 0; i < sk.length; i++) {
      const entry = sk[i]!;
      // A `[prop, attr]` tuple decouples the JS field from the emitted attribute name
      // (e.g. `httpEquiv` → `http-equiv`); a plain string uses the same name for both.
      let prop: string, attr: string;
      if (typeof entry === 'string') { prop = entry; attr = entry; }
      else { prop = entry[0]; attr = entry[1]; }
      const value = bag[prop];
      if (value !== undefined && value !== null) {
        const str = typeof value === 'string' ? value : String(value);
        attrs += ' ' + attr + '="' + escapeAttr(URL_ATTRS.has(attr) ? sanitizeUrl(str) : str) + '"';
      }
    }
  }

  const extraAttrs = tag.attributes;
  if (extraAttrs !== EMPTY_ATTRS) {
    const extraKeys = Object.keys(extraAttrs);
    for (let i = 0; i < extraKeys.length; i++) {
      const key = extraKeys[i]!;
      // A reserved key is skipped ONLY when its dedicated setter was also used — the dedicated
      // field wins. With no setter, the bag value IS the attribute (never silently dropped).
      if ((key === 'id' && tid !== undefined) || (key === 'class' && tcls !== undefined) || (key === 'style' && tsty !== undefined)) continue;
      const value = extraAttrs[key];
      if (value !== undefined && value !== null) {
        attrs += ' ' + key + '="' + escapeAttr(String(value)) + '"';
      }
    }
  }

  if (tag.htmx) attrs += ' ' + buildHtmx(tag.htmx);

  // Boolean attributes (the single `.toggle()` path) render bare. Each name is validated
  // here (the one choke point against attribute-name injection from untyped callers) and
  // emitted at most once — skipping a name already set via a dedicated field or the bag.
  const toggles = tag.toggles;
  if (toggles !== undefined && toggles.length > 0) {
    const seen = new Set<string>();
    const hasBag = extraAttrs !== EMPTY_ATTRS;
    for (let i = 0; i < toggles.length; i++) {
      const name = toggles[i]!;
      if (!BOOLEAN_ATTR_RE.test(name)) {
        throw new Error(`Invalid boolean attribute name: "${name}" — expected a bare HTML attribute name (letters, digits, hyphens).`);
      }
      if (seen.has(name) || RESERVED_BAG_KEYS.has(name)) continue;
      if (hasBag && extraAttrs[name] !== undefined) continue;
      seen.add(name);
      attrs += ' ' + name;
    }
  }

  return attrs;
}

/** True when the tag carries an author-set `nonce` (via `.setNonce(...)`). */
function authorHasNonce(tag: Tag): boolean {
  return tag.attributes !== EMPTY_ATTRS && tag.attributes['nonce'] !== undefined;
}

// A work-stack item: a literal string to append verbatim, or a (view, ctx)
// frame to expand. Text-node views are wrapped in a frame so they cannot be
// confused with literals (open/close tags, separators).
type Frame = string | { v: View; c: RenderCtx };

/**
 * The single serializer, as a generator. Yields HTML in chunks of at least
 * `chunkSize` characters; the explicit work-stack means the tree is walked exactly
 * once (no recursion, no double-render), and the stack state is preserved between
 * yields — so a stream driver can stop pulling when the consumer is full (true
 * backpressure) and resume on the next `.next()`. Joined output is byte-identical
 * to the v5 recursive renderer. @internal
 */
export function* emitChunks(
  view: View,
  ctx: RenderCtx,
  nonce: string | undefined,
  chunkSize: number,
): Generator<string, void, undefined> {
  const stack: Frame[] = [{ v: view, c: ctx }];
  let buf = '';
  // Dev-only: stamp each tag with this render's epoch so a later mutation is
  // identifiable as a mutate-after-render (see core/dev-checks.ts).
  const epoch = devChecks ? nextRenderEpoch() : 0;

  while (stack.length > 0) {
    const item = stack.pop()!;

    // Literal: append verbatim (open tag, close tag, or array separator).
    if (typeof item === 'string') {
      buf += item;
    } else {
      const v = item.v;
      const c = item.c;

      if (typeof v === 'string') {
        buf += c === 'escape' ? escapeHtml(v) : c === 'raw' ? v : sanitizeRawContent(v, c);
      } else if (isRawString(v)) {
        buf += c === 'script' || c === 'style' ? sanitizeRawContent(v.html, c) : v.html;
      } else if (isTag(v)) {
        const el = v.el;
        if (epoch !== 0) v._e = epoch;
        let open = '<' + el + buildAttrs(v);
        // Render-time CSP nonce: stamp <script>/<style> that have no author nonce.
        if (nonce && (el === 'script' || el === 'style') && !authorHasNonce(v)) {
          open += ' nonce="' + escapeAttr(nonce) + '"';
        }
        open += '>';
        // Document() prefixes <!DOCTYPE html> (branded on `_doc`; plain HTML() is unaffected).
        if (el === 'html' && v._doc === true) buf += '<!DOCTYPE html>\n';
        buf += open;

        if (!VOID_ELEMENTS.has(el)) {
          const childCtx: RenderCtx = el === 'script' ? 'script' : el === 'style' ? 'style' : c;
          // Push close first, child second — child pops (and fully expands) before close.
          stack.push('</' + el + '>');
          stack.push({ v: v.child, c: childCtx });
        }
      } else if (Array.isArray(v)) {
        const len = v.length;
        if (len === 1) {
          stack.push({ v: v[0]!, c });
        } else if (len > 1) {
          // Emit v[0] '\n' v[1] '\n' … v[len-1]. Push reversed so v[0] pops first.
          for (let i = len - 1; i >= 0; i--) {
            stack.push({ v: v[i]!, c });
            if (i > 0) stack.push('\n');
          }
        }
        // len === 0 → emit nothing
      }
      // Unknown view kind → emit nothing (matches the v5 `return ''`).
    }

    if (buf.length >= chunkSize) {
      yield buf;
      buf = '';
    }
  }

  if (buf.length > 0) yield buf;
}

/**
 * Serialize a view tree into `sink` eagerly (whole tree, one pass) — the in-memory
 * string path used by `render()`.
 *
 * This deliberately duplicates the `emitChunks` work-stack rather than draining the
 * generator: a generator forces its locals onto the heap (to survive suspension),
 * which measured ~2–3× slower on this hot path. The two loops share all the volatile
 * serialization logic (`buildAttrs`, escaping, nonce, `sanitizeRawContent`); only the
 * low-churn traversal skeleton is repeated, and the `render` ≡ `renderToIterable`
 * fuzz test guards against drift. @internal
 */
export function emit(sink: Sink, view: View, ctx: RenderCtx, nonce?: string): void {
  const stack: Frame[] = [{ v: view, c: ctx }];
  // Dev-only: see emitChunks.
  const epoch = devChecks ? nextRenderEpoch() : 0;

  while (stack.length > 0) {
    const item = stack.pop()!;

    if (typeof item === 'string') {
      sink.append(item);
      continue;
    }

    const v = item.v;
    const c = item.c;

    if (typeof v === 'string') {
      if (c === 'escape') sink.append(escapeHtml(v));
      else if (c === 'raw') sink.append(v);
      else sink.append(sanitizeRawContent(v, c));
      continue;
    }

    if (isRawString(v)) {
      sink.append(c === 'script' || c === 'style' ? sanitizeRawContent(v.html, c) : v.html);
      continue;
    }

    if (isTag(v)) {
      const el = v.el;
      if (epoch !== 0) v._e = epoch;
      let open = '<' + el + buildAttrs(v);
      if (nonce && (el === 'script' || el === 'style') && !authorHasNonce(v)) {
        open += ' nonce="' + escapeAttr(nonce) + '"';
      }
      open += '>';
      // Document() prefixes <!DOCTYPE html> (branded on `_doc`; plain HTML() is unaffected).
      if (el === 'html' && v._doc === true) sink.append('<!DOCTYPE html>\n');

      if (VOID_ELEMENTS.has(el)) {
        sink.append(open);
        continue;
      }

      sink.append(open);
      const childCtx: RenderCtx = el === 'script' ? 'script' : el === 'style' ? 'style' : c;
      stack.push('</' + el + '>');
      stack.push({ v: v.child, c: childCtx });
      continue;
    }

    if (Array.isArray(v)) {
      const len = v.length;
      if (len === 0) continue;
      if (len === 1) {
        stack.push({ v: v[0]!, c });
        continue;
      }
      for (let i = len - 1; i >= 0; i--) {
        stack.push({ v: v[i]!, c });
        if (i > 0) stack.push('\n');
      }
      continue;
    }
  }
}
