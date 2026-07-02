import { defineSchemaKeys } from "../core/proto.js";
import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
import type { View } from "../core/types.js";
import type { CrossOrigin, FetchPriority, ReferrerPolicy } from "./html-types.js";

/**
 * Specialized Tag for `<img>` elements with typed attribute setters.
 *
 * @example
 * Img().setSrc("/photo.jpg").setAlt("A photo").setLoading("lazy")
 */
export class ImgTag extends Tag {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'sync' | 'async' | 'auto';
  srcset?: string;
  sizes?: string;
  crossorigin?: CrossOrigin | '';
  fetchpriority?: FetchPriority;
  referrerpolicy?: ReferrerPolicy;

  setSrc(src?: string): this {
    this.src = src;
    return this;
  }

  setAlt(alt?: string): this {
    this.alt = alt;
    return this;
  }

  setWidth(width?: string | number): this {
    this.width = width === undefined ? undefined : String(width);
    return this;
  }

  setHeight(height?: string | number): this {
    this.height = height === undefined ? undefined : String(height);
    return this;
  }

  setLoading(loading?: 'lazy' | 'eager'): this {
    this.loading = loading;
    return this;
  }

  setDecoding(decoding?: 'sync' | 'async' | 'auto'): this {
    this.decoding = decoding;
    return this;
  }

  setSrcset(srcset?: string): this {
    this.srcset = srcset;
    return this;
  }

  setSizes(sizes?: string): this {
    this.sizes = sizes;
    return this;
  }

  setCrossOrigin(crossorigin?: CrossOrigin | ''): this {
    this.crossorigin = crossorigin;
    return this;
  }

  /** Core Web Vitals priority hint — promote the LCP image (`'high'`) or de-prioritise (`'low'`). */
  setFetchPriority(fetchpriority?: FetchPriority): this {
    this.fetchpriority = fetchpriority;
    return this;
  }

  setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this {
    this.referrerpolicy = referrerpolicy;
    return this;
  }
}

defineSchemaKeys(ImgTag, ['src', 'alt', 'width', 'height', 'loading', 'decoding', 'srcset', 'sizes', 'crossorigin', 'fetchpriority', 'referrerpolicy']);

/** Create an `<img>` element with typed attribute methods. */
export function Img(): ImgTag {
  return new ImgTag("img");
}

export function Picture(...children: View[]): Tag {
  return El("picture", ...children);
}

export class SourceTag extends Tag {
  src?: string;
  srcset?: string;
  sizes?: string;
  type?: string;
  media?: string;
  width?: string;
  height?: string;

  setSrc(src?: string): this {
    this.src = src;
    return this;
  }

  setSrcset(srcset?: string): this {
    this.srcset = srcset;
    return this;
  }

  setSizes(sizes?: string): this {
    this.sizes = sizes;
    return this;
  }

  setType(type?: string): this {
    this.type = type;
    return this;
  }

  setMedia(media?: string): this {
    this.media = media;
    return this;
  }

  setWidth(width?: string | number): this {
    this.width = width === undefined ? undefined : String(width);
    return this;
  }

  setHeight(height?: string | number): this {
    this.height = height === undefined ? undefined : String(height);
    return this;
  }
}

defineSchemaKeys(SourceTag, ['src', 'srcset', 'media', 'sizes', 'type', 'width', 'height']);

export function Source(): SourceTag {
  return new SourceTag("source");
}

export class VideoTag extends Tag {
  width?: string;
  height?: string;
  src?: string;
  preload?: 'none' | 'metadata' | 'auto';
  poster?: string;
  crossorigin?: CrossOrigin | '';

  setWidth(width?: string | number): this {
    this.width = width === undefined ? undefined : String(width);
    return this;
  }

  setHeight(height?: string | number): this {
    this.height = height === undefined ? undefined : String(height);
    return this;
  }

  setSrc(src: string): this {
    this.src = src;
    return this;
  }

  setPreload(preload?: 'none' | 'metadata' | 'auto'): this {
    this.preload = preload;
    return this;
  }

  setPoster(poster?: string): this {
    this.poster = poster;
    return this;
  }

  setCrossOrigin(crossorigin?: CrossOrigin | ''): this {
    this.crossorigin = crossorigin;
    return this;
  }
}

defineSchemaKeys(VideoTag, ['src', 'poster', 'preload', 'width', 'height', 'crossorigin']);

export function Video(...children: View[]): VideoTag {
  return new VideoTag("video", ...children);
}

export class AudioTag extends Tag {
  src?: string;
  preload?: 'none' | 'metadata' | 'auto';
  crossorigin?: CrossOrigin | '';

  setSrc(src?: string): this {
    this.src = src;
    return this;
  }

  setPreload(preload?: 'none' | 'metadata' | 'auto'): this {
    this.preload = preload;
    return this;
  }

  setCrossOrigin(crossorigin?: CrossOrigin | ''): this {
    this.crossorigin = crossorigin;
    return this;
  }
}

defineSchemaKeys(AudioTag, ['src', 'preload', 'crossorigin']);

export function Audio(...children: View[]): AudioTag {
  return new AudioTag("audio", ...children);
}

export class TrackTag extends Tag {
  src?: string;
  kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
  srclang?: string;
  label?: string;

  setSrc(src?: string): this {
    this.src = src;
    return this;
  }

  setKind(kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'): this {
    this.kind = kind;
    return this;
  }

  setSrclang(srclang?: string): this {
    this.srclang = srclang;
    return this;
  }

  setLabel(label?: string): this {
    this.label = label;
    return this;
  }
}

defineSchemaKeys(TrackTag, ['src', 'kind', 'srclang', 'label']);

export function Track(): TrackTag {
  return new TrackTag("track");
}

export class CanvasTag extends Tag {
  width?: string;
  height?: string;

  setWidth(width?: string | number): this {
    this.width = width === undefined ? undefined : String(width);
    return this;
  }

  setHeight(height?: string | number): this {
    this.height = height === undefined ? undefined : String(height);
    return this;
  }
}

defineSchemaKeys(CanvasTag, ['width', 'height']);

export function Canvas(...children: View[]): CanvasTag {
  return new CanvasTag("canvas", ...children);
}

export class SvgTag extends Tag {
  width?: string;
  height?: string;
  viewBox?: string;
  xmlns?: string;
  fill?: string;
  stroke?: string;
  'stroke-width'?: string;

  setWidth(width?: string | number): this {
    this.width = width === undefined ? undefined : String(width);
    return this;
  }

  setHeight(height?: string | number): this {
    this.height = height === undefined ? undefined : String(height);
    return this;
  }

  setViewBox(viewBox: string): this {
    this.viewBox = viewBox;
    return this;
  }

  setXmlns(xmlns: string = "http://www.w3.org/2000/svg"): this {
    this.xmlns = xmlns;
    return this;
  }

  setFill(fill: string): this {
    this.fill = fill;
    return this;
  }

  setStroke(stroke: string): this {
    this.stroke = stroke;
    return this;
  }

  setStrokeWidth(width: string | number): this {
    this['stroke-width'] = String(width);
    return this;
  }
}

defineSchemaKeys(SvgTag, ['width', 'height', 'viewBox', 'xmlns', 'fill', 'stroke', 'stroke-width']);

export function Svg(...children: View[]): SvgTag {
  return new SvgTag("svg", ...children);
}
