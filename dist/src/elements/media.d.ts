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
    protected _src?: string;
    protected _srcset?: string;
    protected _sizes?: string;
    protected _type?: string;
    protected _media?: string;
    protected _width?: string;
    protected _height?: string;
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
    protected _width?: string;
    protected _height?: string;
    protected _src?: string;
    protected _preload?: 'none' | 'metadata' | 'auto';
    protected _poster?: string;
    protected _crossorigin?: CrossOrigin | '';
    setWidth(width?: string | number): this;
    setHeight(height?: string | number): this;
    setSrc(src: string): this;
    setPreload(preload?: 'none' | 'metadata' | 'auto'): this;
    setPoster(poster?: string): this;
    setCrossOrigin(crossorigin?: CrossOrigin | ''): this;
}
export declare function Video(...children: View[]): VideoTag;
export declare class AudioTag extends Tag {
    protected _src?: string;
    protected _preload?: 'none' | 'metadata' | 'auto';
    protected _crossorigin?: CrossOrigin | '';
    setSrc(src?: string): this;
    setPreload(preload?: 'none' | 'metadata' | 'auto'): this;
    setCrossOrigin(crossorigin?: CrossOrigin | ''): this;
}
export declare function Audio(...children: View[]): AudioTag;
export declare class TrackTag extends Tag {
    protected _src?: string;
    protected _kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
    protected _srclang?: string;
    protected _label?: string;
    setSrc(src?: string): this;
    setKind(kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'): this;
    setSrclang(srclang?: string): this;
    setLabel(label?: string): this;
}
export declare function Track(): TrackTag;
export declare class CanvasTag extends Tag {
    protected _width?: string;
    protected _height?: string;
    setWidth(width?: string | number): this;
    setHeight(height?: string | number): this;
}
export declare function Canvas(...children: View[]): CanvasTag;
export declare class SvgTag extends Tag {
    protected _width?: string;
    protected _height?: string;
    protected _viewBox?: string;
    protected _xmlns?: string;
    protected _fillValue?: string;
    protected _strokeValue?: string;
    protected '_stroke-width'?: string;
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