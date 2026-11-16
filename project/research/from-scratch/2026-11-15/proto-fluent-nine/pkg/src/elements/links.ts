import { defineSchemaKeys } from "../core/proto.js";
import { devChecks, assertMutable } from "../core/dev-checks.js";
import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
import type { ResolvedRoute, ExternalHref } from "../htmx.js";
import type { BrowsingContext, LinkRel, ReferrerPolicy } from "./html-types.js";


/**
 * Specialized Tag for `<a>` (anchor) elements with typed attribute setters.
 *
 * @example
 * A("Dashboard").nav(dashboardRoutes.index())   // or .setHref(route.resolve(...)) for a plain link
 */
export class AnchorTag extends Tag {
  protected _href?: string;
  protected _target?: BrowsingContext;
  protected _rel?: LinkRel;
  protected _download?: string | boolean;
  protected _type?: string;
  protected _referrerpolicy?: ReferrerPolicy;
  protected _hreflang?: string;

  /**
   * Branded (8.0.0): accepts a `ResolvedRoute` (route callable `.resolve()`,
   * `assetUrl()`) or an `ExternalHref` — literal `https://…`/`mailto:…`/
   * `tel:…`/`#…` pass directly; runtime externals go through `externalUrl()`.
   * In-app navigation should prefer the swap verbs (`.nav()`) over `setHref`.
   */
  setHref(href?: ResolvedRoute | ExternalHref): this {
    if (devChecks) assertMutable(this, "setHref");
    this._href = href;
    return this;
  }

  setHreflang(hreflang?: string): this {
    if (devChecks) assertMutable(this, "setHreflang");
    this._hreflang = hreflang;
    return this;
  }

  setTarget(target?: BrowsingContext): this {
    if (devChecks) assertMutable(this, "setTarget");
    this._target = target;
    return this;
  }

  setRel(...rels: LinkRel[]): this {
    if (devChecks) assertMutable(this, "setRel");
    this._rel = rels.length ? rels.join(" ") : undefined;
    return this;
  }

  setDownload(download?: string | boolean): this {
    if (devChecks) assertMutable(this, "setDownload");
    this._download = download;
    return this;
  }

  setType(type?: string): this {
    if (devChecks) assertMutable(this, "setType");
    this._type = type;
    return this;
  }

  setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this {
    if (devChecks) assertMutable(this, "setReferrerPolicy");
    this._referrerpolicy = referrerpolicy;
    return this;
  }
}

defineSchemaKeys(AnchorTag, ['href', 'target', 'rel', 'download', 'type', 'referrerpolicy', 'hreflang']);

/** Create an `<a>` (anchor) element with typed attribute methods. */
export function A(...children: View[]): AnchorTag {
  return new AnchorTag("a", ...children);
}

export class MapTag extends Tag {
  protected _name?: string;

  setName(name?: string): this {
    if (devChecks) assertMutable(this, "setName");
    this._name = name;
    return this;
  }
}

defineSchemaKeys(MapTag, ['name']);

export function MapEl(...children: View[]): MapTag {
  return new MapTag("map", ...children);
}

export class AreaTag extends Tag {
  protected _shape?: 'rect' | 'circle' | 'poly' | 'default';
  protected _coords?: string;
  protected _href?: string;
  protected _alt?: string;
  protected _target?: BrowsingContext;
  protected _rel?: LinkRel;
  protected _download?: string | boolean;
  protected _referrerpolicy?: ReferrerPolicy;

  setShape(shape?: 'rect' | 'circle' | 'poly' | 'default'): this {
    if (devChecks) assertMutable(this, "setShape");
    this._shape = shape;
    return this;
  }

  setCoords(coords?: string): this {
    if (devChecks) assertMutable(this, "setCoords");
    this._coords = coords;
    return this;
  }

  setHref(href?: string): this {
    if (devChecks) assertMutable(this, "setHref");
    this._href = href;
    return this;
  }

  setAlt(alt?: string): this {
    if (devChecks) assertMutable(this, "setAlt");
    this._alt = alt;
    return this;
  }

  setTarget(target?: BrowsingContext): this {
    if (devChecks) assertMutable(this, "setTarget");
    this._target = target;
    return this;
  }

  setRel(...rels: LinkRel[]): this {
    if (devChecks) assertMutable(this, "setRel");
    this._rel = rels.length ? rels.join(" ") : undefined;
    return this;
  }

  setDownload(download?: string | boolean): this {
    if (devChecks) assertMutable(this, "setDownload");
    this._download = download;
    return this;
  }

  setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this {
    if (devChecks) assertMutable(this, "setReferrerPolicy");
    this._referrerpolicy = referrerpolicy;
    return this;
  }
}

defineSchemaKeys(AreaTag, ['shape', 'coords', 'href', 'alt', 'target', 'rel', 'download', 'referrerpolicy']);

export function Area(): AreaTag {
  return new AreaTag("area");
}
