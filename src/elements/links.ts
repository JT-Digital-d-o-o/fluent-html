import { defineSchemaKeys } from "../core/proto.js";
import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
import type { BrowsingContext, LinkRel, ReferrerPolicy } from "./html-types.js";


/**
 * Specialized Tag for `<a>` (anchor) elements with typed attribute setters.
 *
 * @example
 * A("Dashboard").setHref("/dashboard").setTarget("_blank")
 */
export class AnchorTag extends Tag {
  href?: string;
  target?: BrowsingContext;
  rel?: LinkRel;
  download?: string | boolean;
  type?: string;
  referrerpolicy?: ReferrerPolicy;
  hreflang?: string;

  setHref(href?: string): this {
    this.href = href;
    return this;
  }

  setHreflang(hreflang?: string): this {
    this.hreflang = hreflang;
    return this;
  }

  setTarget(target?: BrowsingContext): this {
    this.target = target;
    return this;
  }

  setRel(...rels: LinkRel[]): this {
    this.rel = rels.length ? rels.join(" ") : undefined;
    return this;
  }

  setDownload(download?: string | boolean): this {
    this.download = download;
    return this;
  }

  setType(type?: string): this {
    this.type = type;
    return this;
  }

  setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this {
    this.referrerpolicy = referrerpolicy;
    return this;
  }
}

defineSchemaKeys(AnchorTag, ['href', 'target', 'rel', 'download', 'type', 'referrerpolicy', 'hreflang']);

/** Create an `<a>` (anchor) element with typed attribute methods. */
export function A(...children: View[]): AnchorTag {
  return new AnchorTag("a", ...children);
}

export class MapTag extends Tag {
  name?: string;

  setName(name?: string): this {
    this.name = name;
    return this;
  }
}

defineSchemaKeys(MapTag, ['name']);

export function MapEl(...children: View[]): MapTag {
  return new MapTag("map", ...children);
}

export class AreaTag extends Tag {
  shape?: 'rect' | 'circle' | 'poly' | 'default';
  coords?: string;
  href?: string;
  alt?: string;
  target?: BrowsingContext;
  rel?: LinkRel;
  download?: string | boolean;
  referrerpolicy?: ReferrerPolicy;

  setShape(shape?: 'rect' | 'circle' | 'poly' | 'default'): this {
    this.shape = shape;
    return this;
  }

  setCoords(coords?: string): this {
    this.coords = coords;
    return this;
  }

  setHref(href?: string): this {
    this.href = href;
    return this;
  }

  setAlt(alt?: string): this {
    this.alt = alt;
    return this;
  }

  setTarget(target?: BrowsingContext): this {
    this.target = target;
    return this;
  }

  setRel(...rels: LinkRel[]): this {
    this.rel = rels.length ? rels.join(" ") : undefined;
    return this;
  }

  setDownload(download?: string | boolean): this {
    this.download = download;
    return this;
  }

  setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this {
    this.referrerpolicy = referrerpolicy;
    return this;
  }
}

defineSchemaKeys(AreaTag, ['shape', 'coords', 'href', 'alt', 'target', 'rel', 'download', 'referrerpolicy']);

export function Area(): AreaTag {
  return new AreaTag("area");
}
