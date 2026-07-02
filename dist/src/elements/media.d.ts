import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
import type { CrossOrigin, FetchPriority, ReferrerPolicy } from "./html-types.js";
/**
 * Specialized Tag for `<img>` elements with typed attribute setters.
 *
 * @example
 * Img().setSrc("/photo.jpg").setAlt("A photo").setLoading("lazy")
 */
export declare class ImgTag extends Tag {
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
    setSrc(src?: string): this;
    setAlt(alt?: string): this;
    setWidth(width?: string | number): this;
    setHeight(height?: string | number): this;
    setLoading(loading?: 'lazy' | 'eager'): this;
    setDecoding(decoding?: 'sync' | 'async' | 'auto'): this;
    setSrcset(srcset?: string): this;
    setSizes(sizes?: string): this;
    setCrossOrigin(crossorigin?: CrossOrigin | ''): this;
    /** Core Web Vitals priority hint — promote the LCP image (`'high'`) or de-prioritise (`'low'`). */
    setFetchPriority(fetchpriority?: FetchPriority): this;
    setReferrerPolicy(referrerpolicy?: ReferrerPolicy): this;
}
/** Create an `<img>` element with typed attribute methods. */
export declare function Img(): ImgTag;
export declare function Picture(...children: View[]): Tag;
export declare class SourceTag extends Tag {
    src?: string;
    srcset?: string;
    sizes?: string;
    type?: string;
    media?: string;
    width?: string;
    height?: string;
    setSrc(src?: string): this;
    setSrcset(srcset?: string): this;
    setSizes(sizes?: string): this;
    setType(type?: string): this;
    setMedia(media?: string): this;
    setWidth(width?: string | number): this;
    setHeight(height?: string | number): this;
}
export declare function Source(): SourceTag;
export declare class VideoTag extends Tag {
    width?: string;
    height?: string;
    src?: string;
    preload?: 'none' | 'metadata' | 'auto';
    poster?: string;
    crossorigin?: CrossOrigin | '';
    setWidth(width?: string | number): this;
    setHeight(height?: string | number): this;
    setSrc(src: string): this;
    setPreload(preload?: 'none' | 'metadata' | 'auto'): this;
    setPoster(poster?: string): this;
    setCrossOrigin(crossorigin?: CrossOrigin | ''): this;
}
export declare function Video(...children: View[]): VideoTag;
export declare class AudioTag extends Tag {
    src?: string;
    preload?: 'none' | 'metadata' | 'auto';
    crossorigin?: CrossOrigin | '';
    setSrc(src?: string): this;
    setPreload(preload?: 'none' | 'metadata' | 'auto'): this;
    setCrossOrigin(crossorigin?: CrossOrigin | ''): this;
}
export declare function Audio(...children: View[]): AudioTag;
export declare class TrackTag extends Tag {
    src?: string;
    kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
    srclang?: string;
    label?: string;
    setSrc(src?: string): this;
    setKind(kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'): this;
    setSrclang(srclang?: string): this;
    setLabel(label?: string): this;
}
export declare function Track(): TrackTag;
export declare class CanvasTag extends Tag {
    width?: string;
    height?: string;
    setWidth(width?: string | number): this;
    setHeight(height?: string | number): this;
}
export declare function Canvas(...children: View[]): CanvasTag;
export declare class SvgTag extends Tag {
    width?: string;
    height?: string;
    viewBox?: string;
    xmlns?: string;
    fill?: string;
    stroke?: string;
    'stroke-width'?: string;
    setWidth(width?: string | number): this;
    setHeight(height?: string | number): this;
    setViewBox(viewBox: string): this;
    setXmlns(xmlns?: string): this;
    setFill(fill: string): this;
    setStroke(stroke: string): this;
    setStrokeWidth(width: string | number): this;
}
export declare function Svg(...children: View[]): SvgTag;
//# sourceMappingURL=media.d.ts.map