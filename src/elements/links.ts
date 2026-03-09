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

  setHref(href?: string): this {
    this.href = href;
    return this;
  }

  setTarget(target?: BrowsingContext): this {
    this.target = target;
    return this;
  }

  setRel(rel?: LinkRel): this {
    this.rel = rel;
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

  setReferrerpolicy(referrerpolicy?: ReferrerPolicy): this {
    this.referrerpolicy = referrerpolicy;
    return this;
  }
}

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
(AnchorTag.prototype as any)._sk = ['href', 'target', 'rel', 'download', 'type', 'referrerpolicy'];

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

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
(MapTag.prototype as any)._sk = ['name'];

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
  download?: string;

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

  setRel(rel?: LinkRel): this {
    this.rel = rel;
    return this;
  }

  setDownload(download?: string): this {
    this.download = download;
    return this;
  }
}

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
(AreaTag.prototype as any)._sk = ['shape', 'coords', 'href', 'alt', 'target', 'rel', 'download'];

export function Area(): AreaTag {
  return new AreaTag("area");
}
