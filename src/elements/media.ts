import { Tag } from "../core/tag.js";
import { El, Empty } from "../core/utils.js";
import type { View } from "../core/types.js";

export class ImgTag extends Tag {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'sync' | 'async' | 'auto';
  srcset?: string;
  sizes?: string;
  crossorigin?: 'anonymous' | 'use-credentials';

  setSrc(src?: string): this {
    this.src = src;
    return this;
  }

  setAlt(alt?: string): this {
    this.alt = alt;
    return this;
  }

  setWidth(width?: string): this {
    this.width = width;
    return this;
  }

  setHeight(height?: string): this {
    this.height = height;
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

  setCrossorigin(crossorigin?: 'anonymous' | 'use-credentials'): this {
    this.crossorigin = crossorigin;
    return this;
  }
}

/** @internal */
(ImgTag.prototype as any)._sk = ['src', 'alt', 'width', 'height', 'loading', 'decoding', 'srcset', 'sizes', 'crossorigin'];

export function Img(child: View = Empty()): ImgTag {
  return new ImgTag("img", child);
}

export function Picture(child: View = Empty()): Tag {
  return El("picture", child);
}

export class SourceTag extends Tag {
  src?: string;
  srcset?: string;
  sizes?: string;
  type?: string;
  media?: string;

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
}

/** @internal */
(SourceTag.prototype as any)._sk = ['src', 'srcset', 'media', 'sizes', 'type'];

export function Source(child: View = Empty()): SourceTag {
  return new SourceTag("source", child);
}

export class VideoTag extends Tag {
  width?: number;
  height?: number;
  controls?: boolean;
  src?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  poster?: string;
  playsinline?: boolean;

  setWidth(width: number): this {
    this.width = width;
    return this;
  }

  setHeight(height: number): this {
    this.height = height;
    return this;
  }

  setControls(enabled: boolean = true): this {
    this.controls = enabled;
    return this;
  }

  setSrc(src: string): this {
    this.src = src;
    return this;
  }

  setAutoplay(autoplay: boolean = true): this {
    this.autoplay = autoplay;
    return this;
  }

  setLoop(loop: boolean = true): this {
    this.loop = loop;
    return this;
  }

  setMuted(muted: boolean = true): this {
    this.muted = muted;
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

  setPlaysinline(playsinline: boolean = true): this {
    this.playsinline = playsinline;
    return this;
  }
}

/** @internal */
(VideoTag.prototype as any)._sk = ['src', 'controls', 'autoplay', 'loop', 'muted', 'poster', 'preload', 'playsinline', 'width', 'height'];

export function Video(child: View = Empty()): VideoTag {
  return new VideoTag("video", child);
}

export class AudioTag extends Tag {
  src?: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: 'none' | 'metadata' | 'auto';

  setSrc(src?: string): this {
    this.src = src;
    return this;
  }

  setControls(controls: boolean = true): this {
    this.controls = controls;
    return this;
  }

  setAutoplay(autoplay: boolean = true): this {
    this.autoplay = autoplay;
    return this;
  }

  setLoop(loop: boolean = true): this {
    this.loop = loop;
    return this;
  }

  setMuted(muted: boolean = true): this {
    this.muted = muted;
    return this;
  }

  setPreload(preload?: 'none' | 'metadata' | 'auto'): this {
    this.preload = preload;
    return this;
  }
}

/** @internal */
(AudioTag.prototype as any)._sk = ['src', 'controls', 'autoplay', 'loop', 'muted', 'preload'];

export function Audio(child: View = Empty()): AudioTag {
  return new AudioTag("audio", child);
}

export class TrackTag extends Tag {
  src?: string;
  kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
  srclang?: string;
  label?: string;
  default?: boolean;

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

  setDefault(isDefault: boolean = true): this {
    this.default = isDefault;
    return this;
  }
}

/** @internal */
(TrackTag.prototype as any)._sk = ['src', 'kind', 'srclang', 'label', 'default'];

export function Track(child: View = Empty()): TrackTag {
  return new TrackTag("track", child);
}

export class CanvasTag extends Tag {
  width?: number;
  height?: number;

  setWidth(width: number): this {
    this.width = width;
    return this;
  }

  setHeight(height: number): this {
    this.height = height;
    return this;
  }
}

/** @internal */
(CanvasTag.prototype as any)._sk = ['width', 'height'];

export function Canvas(child: View = Empty()): CanvasTag {
  return new CanvasTag("canvas", child);
}

export class SvgTag extends Tag {
  width?: string;
  height?: string;
  viewBox?: string;
  xmlns?: string;
  fill?: string;
  stroke?: string;

  setWidth(width: string): this {
    this.width = width;
    return this;
  }

  setHeight(height: string): this {
    this.height = height;
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
}

/** @internal */
(SvgTag.prototype as any)._sk = ['width', 'height', 'viewBox', 'xmlns', 'fill', 'stroke'];

export function Svg(child: View = Empty()): SvgTag {
  return new SvgTag("svg", child);
}
