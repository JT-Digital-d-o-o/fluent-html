import { defineSchemaKeys } from "../core/proto.js";
import { devChecks, assertMutable } from "../core/dev-checks.js";
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
  protected _src?: string;
  protected _alt?: string;
  protected _width?: string;
  protected _height?: string;
  protected _loading?: 'lazy' | 'eager';
  protected _decoding?: 'sync' | 'async' | 'auto';
  protected _srcset?: string;
  protected _sizes?: string;
  protected _crossorigin?: CrossOrigin | '';
  protected _fetchpriority?: FetchPriority;
  protected _referrerpolicy?: ReferrerPolicy;

  setSrc(src?: string): this {
    if (devChecks) assertMutable(this, "setSrc");
    this._src = src;
    return this;
  }

  setAlt(alt?: string): this {
    if (devChecks) assertMutable(this, "setAlt");
    this._alt = alt;
    return this;
  }

  setWidth(width?: string | number): this {
    if (devChecks) assertMutable(this, "setWidth");
    this._width = width === undefined ? undefined : String(width);
    return this;
  }

  setHeight(height?: string | number): this {
    if (devChecks) assertMutable(this, "setHeight");
    this._height = height === undefined ? undefined : String(height);
    return this;
  }

  setLoading(loading?: 'lazy' | 'eager'): this {
    if (devChecks) assertMutable(this, "setLoading");
    this._loading = loading;
    return this;
  }

  setDecoding(decoding?: 'sync' | 'async' | 'auto'): this {
    if (devChecks) assertMutable(this, "setDecoding");
    this._decoding = decoding;
    return this;
  }

  setSrcset(srcset?: string): this {
    if (devChecks) assertMutable(this, "setSrcset");
    this._srcset = srcset;
    return this;
  }

  setSizes(sizes?: string): this {
    if (devChecks) assertMutable(this, "setSizes");
    this._sizes = sizes;
    return this;
  }

  setCrossOrigin(crossorigin?: CrossOrigin | ''): this {
    if (devChecks) assertMutable(this, "setCrossOrigin");
    this._crossorigin = crossorigin;
    return this;
  }

  /** Core Web Vitals priority hint — promote the LCP image (`'high'`) or de-prioritise (`'low'`). */
  setFetchPriority(fetchpriority?: FetchPriority): this {
    if (devChecks) assertMutable(this, "setFetchPriority");
    this._fetchpriority = fetchpriority;
    return this;
  }

  setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this {
    if (devChecks) assertMutable(this, "setReferrerPolicy");
    this._referrerpolicy = referrerpolicy;
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
  protected _src?: string;
  protected _srcset?: string;
  protected _sizes?: string;
  protected _type?: string;
  protected _media?: string;
  protected _width?: string;
  protected _height?: string;

  setSrc(src?: string): this {
    if (devChecks) assertMutable(this, "setSrc");
    this._src = src;
    return this;
  }

  setSrcset(srcset?: string): this {
    if (devChecks) assertMutable(this, "setSrcset");
    this._srcset = srcset;
    return this;
  }

  setSizes(sizes?: string): this {
    if (devChecks) assertMutable(this, "setSizes");
    this._sizes = sizes;
    return this;
  }

  setType(type?: string): this {
    if (devChecks) assertMutable(this, "setType");
    this._type = type;
    return this;
  }

  setMedia(media?: string): this {
    if (devChecks) assertMutable(this, "setMedia");
    this._media = media;
    return this;
  }

  setWidth(width?: string | number): this {
    if (devChecks) assertMutable(this, "setWidth");
    this._width = width === undefined ? undefined : String(width);
    return this;
  }

  setHeight(height?: string | number): this {
    if (devChecks) assertMutable(this, "setHeight");
    this._height = height === undefined ? undefined : String(height);
    return this;
  }
}

defineSchemaKeys(SourceTag, ['src', 'srcset', 'media', 'sizes', 'type', 'width', 'height']);

export function Source(): SourceTag {
  return new SourceTag("source");
}

export class VideoTag extends Tag {
  protected _width?: string;
  protected _height?: string;
  protected _src?: string;
  protected _preload?: 'none' | 'metadata' | 'auto';
  protected _poster?: string;
  protected _crossorigin?: CrossOrigin | '';

  setWidth(width?: string | number): this {
    if (devChecks) assertMutable(this, "setWidth");
    this._width = width === undefined ? undefined : String(width);
    return this;
  }

  setHeight(height?: string | number): this {
    if (devChecks) assertMutable(this, "setHeight");
    this._height = height === undefined ? undefined : String(height);
    return this;
  }

  setSrc(src: string): this {
    if (devChecks) assertMutable(this, "setSrc");
    this._src = src;
    return this;
  }

  setPreload(preload?: 'none' | 'metadata' | 'auto'): this {
    if (devChecks) assertMutable(this, "setPreload");
    this._preload = preload;
    return this;
  }

  setPoster(poster?: string): this {
    if (devChecks) assertMutable(this, "setPoster");
    this._poster = poster;
    return this;
  }

  setCrossOrigin(crossorigin?: CrossOrigin | ''): this {
    if (devChecks) assertMutable(this, "setCrossOrigin");
    this._crossorigin = crossorigin;
    return this;
  }
}

defineSchemaKeys(VideoTag, ['src', 'poster', 'preload', 'width', 'height', 'crossorigin']);

export function Video(...children: View[]): VideoTag {
  return new VideoTag("video", ...children);
}

export class AudioTag extends Tag {
  protected _src?: string;
  protected _preload?: 'none' | 'metadata' | 'auto';
  protected _crossorigin?: CrossOrigin | '';

  setSrc(src?: string): this {
    if (devChecks) assertMutable(this, "setSrc");
    this._src = src;
    return this;
  }

  setPreload(preload?: 'none' | 'metadata' | 'auto'): this {
    if (devChecks) assertMutable(this, "setPreload");
    this._preload = preload;
    return this;
  }

  setCrossOrigin(crossorigin?: CrossOrigin | ''): this {
    if (devChecks) assertMutable(this, "setCrossOrigin");
    this._crossorigin = crossorigin;
    return this;
  }
}

defineSchemaKeys(AudioTag, ['src', 'preload', 'crossorigin']);

export function Audio(...children: View[]): AudioTag {
  return new AudioTag("audio", ...children);
}

export class TrackTag extends Tag {
  protected _src?: string;
  protected _kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
  protected _srclang?: string;
  protected _label?: string;

  setSrc(src?: string): this {
    if (devChecks) assertMutable(this, "setSrc");
    this._src = src;
    return this;
  }

  setKind(kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'): this {
    if (devChecks) assertMutable(this, "setKind");
    this._kind = kind;
    return this;
  }

  setSrclang(srclang?: string): this {
    if (devChecks) assertMutable(this, "setSrclang");
    this._srclang = srclang;
    return this;
  }

  setLabel(label?: string): this {
    if (devChecks) assertMutable(this, "setLabel");
    this._label = label;
    return this;
  }
}

defineSchemaKeys(TrackTag, ['src', 'kind', 'srclang', 'label']);

export function Track(): TrackTag {
  return new TrackTag("track");
}

export class CanvasTag extends Tag {
  protected _width?: string;
  protected _height?: string;

  setWidth(width?: string | number): this {
    if (devChecks) assertMutable(this, "setWidth");
    this._width = width === undefined ? undefined : String(width);
    return this;
  }

  setHeight(height?: string | number): this {
    if (devChecks) assertMutable(this, "setHeight");
    this._height = height === undefined ? undefined : String(height);
    return this;
  }
}

defineSchemaKeys(CanvasTag, ['width', 'height']);

export function Canvas(...children: View[]): CanvasTag {
  return new CanvasTag("canvas", ...children);
}

export class SvgTag extends Tag {
  protected _width?: string;
  protected _height?: string;
  protected _viewBox?: string;
  protected _xmlns?: string;
  // Storage is `fillValue`/`strokeValue` (aliased to the `fill`/`stroke` attributes in
  // the schema) so the fields don't shadow the Tag `.fill()`/`.stroke()` styling methods.
  protected _fillValue?: string;
  protected _strokeValue?: string;
  protected '_stroke-width'?: string;

  setWidth(width?: string | number): this {
    if (devChecks) assertMutable(this, "setWidth");
    this._width = width === undefined ? undefined : String(width);
    return this;
  }

  setHeight(height?: string | number): this {
    if (devChecks) assertMutable(this, "setHeight");
    this._height = height === undefined ? undefined : String(height);
    return this;
  }

  setViewBox(viewBox: string): this {
    if (devChecks) assertMutable(this, "setViewBox");
    this._viewBox = viewBox;
    return this;
  }

  setXmlns(xmlns: string = "http://www.w3.org/2000/svg"): this {
    if (devChecks) assertMutable(this, "setXmlns");
    this._xmlns = xmlns;
    return this;
  }

  setFill(fill: string): this {
    if (devChecks) assertMutable(this, "setFill");
    this._fillValue = fill;
    return this;
  }

  setStroke(stroke: string): this {
    if (devChecks) assertMutable(this, "setStroke");
    this._strokeValue = stroke;
    return this;
  }

  setStrokeWidth(width: string | number): this {
    if (devChecks) assertMutable(this, "setStrokeWidth");
    this['_stroke-width'] = String(width);
    return this;
  }
}

defineSchemaKeys(SvgTag, ['width', 'height', 'viewBox', 'xmlns', ['fillValue', 'fill'], ['strokeValue', 'stroke'], 'stroke-width']);

export function Svg(...children: View[]): SvgTag {
  return new SvgTag("svg", ...children);
}
