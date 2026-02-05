import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
import { Empty } from "../core/utils.js";

export class AnchorTag extends Tag {
  href?: string;
  target?: '_self' | '_blank' | '_parent' | '_top' | string;
  rel?: string;
  download?: string | boolean;
  type?: string;
  referrerpolicy?: string;

  setHref(href?: string): this {
    this.href = href;
    return this;
  }

  setTarget(target?: '_self' | '_blank' | '_parent' | '_top' | string): this {
    this.target = target;
    return this;
  }

  setRel(rel?: string): this {
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

  setReferrerpolicy(referrerpolicy?: string): this {
    this.referrerpolicy = referrerpolicy;
    return this;
  }
}

/** @internal */
(AnchorTag.prototype as any)._sk = ['href', 'target', 'rel', 'download', 'type', 'referrerpolicy'];

export function A(child: View = Empty()): AnchorTag {
  return new AnchorTag("a", child);
}

export class MapTag extends Tag {
  name?: string;

  setName(name?: string): this {
    this.name = name;
    return this;
  }
}

/** @internal */
(MapTag.prototype as any)._sk = ['name'];

export function MapEl(child: View = Empty()): MapTag {
  return new MapTag("map", child);
}

export class AreaTag extends Tag {
  shape?: 'rect' | 'circle' | 'poly' | 'default';
  coords?: string;
  href?: string;
  alt?: string;
  target?: string;
  rel?: string;
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

  setTarget(target?: string): this {
    this.target = target;
    return this;
  }

  setRel(rel?: string): this {
    this.rel = rel;
    return this;
  }

  setDownload(download?: string): this {
    this.download = download;
    return this;
  }
}

/** @internal */
(AreaTag.prototype as any)._sk = ['shape', 'coords', 'href', 'alt', 'target', 'rel', 'download'];

export function Area(child: View = Empty()): AreaTag {
  return new AreaTag("area", child);
}
