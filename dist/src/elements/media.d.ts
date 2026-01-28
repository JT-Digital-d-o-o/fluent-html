import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
export declare class ImgTag extends Tag<ImgTag> {
    src?: string;
    alt?: string;
    width?: string;
    height?: string;
    loading?: 'lazy' | 'eager';
    decoding?: 'sync' | 'async' | 'auto';
    srcset?: string;
    sizes?: string;
    crossorigin?: 'anonymous' | 'use-credentials';
    setSrc(src?: string): this;
    setAlt(alt?: string): this;
    setWidth(width?: string): this;
    setHeight(height?: string): this;
    setLoading(loading?: 'lazy' | 'eager'): this;
    setDecoding(decoding?: 'sync' | 'async' | 'auto'): this;
    setSrcset(srcset?: string): this;
    setSizes(sizes?: string): this;
    setCrossorigin(crossorigin?: 'anonymous' | 'use-credentials'): this;
}
export declare function Img(child?: View): ImgTag;
export declare function Picture(child?: View): Tag;
export declare class SourceTag extends Tag<SourceTag> {
    src?: string;
    srcset?: string;
    sizes?: string;
    type?: string;
    media?: string;
    setSrc(src?: string): this;
    setSrcset(srcset?: string): this;
    setSizes(sizes?: string): this;
    setType(type?: string): this;
    setMedia(media?: string): this;
}
export declare function Source(child?: View): SourceTag;
export declare class VideoTag extends Tag<VideoTag> {
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
    setWidth(width: number): this;
    setHeight(height: number): this;
    setControls(enabled?: boolean): this;
    setSrc(src: string): this;
    setAutoplay(autoplay?: boolean): this;
    setLoop(loop?: boolean): this;
    setMuted(muted?: boolean): this;
    setPreload(preload?: 'none' | 'metadata' | 'auto'): this;
    setPoster(poster?: string): this;
    setPlaysinline(playsinline?: boolean): this;
}
export declare function Video(child?: View): VideoTag;
export declare class AudioTag extends Tag<AudioTag> {
    src?: string;
    controls?: boolean;
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    preload?: 'none' | 'metadata' | 'auto';
    setSrc(src?: string): this;
    setControls(controls?: boolean): this;
    setAutoplay(autoplay?: boolean): this;
    setLoop(loop?: boolean): this;
    setMuted(muted?: boolean): this;
    setPreload(preload?: 'none' | 'metadata' | 'auto'): this;
}
export declare function Audio(child?: View): AudioTag;
export declare class TrackTag extends Tag<TrackTag> {
    src?: string;
    kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
    srclang?: string;
    label?: string;
    default?: boolean;
    setSrc(src?: string): this;
    setKind(kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'): this;
    setSrclang(srclang?: string): this;
    setLabel(label?: string): this;
    setDefault(isDefault?: boolean): this;
}
export declare function Track(child?: View): TrackTag;
export declare class CanvasTag extends Tag<CanvasTag> {
    width?: number;
    height?: number;
    setWidth(width: number): this;
    setHeight(height: number): this;
}
export declare function Canvas(child?: View): CanvasTag;
export declare class SvgTag extends Tag<SvgTag> {
    width?: string;
    height?: string;
    viewBox?: string;
    xmlns?: string;
    fill?: string;
    stroke?: string;
    setWidth(width: string): this;
    setHeight(height: string): this;
    setViewBox(viewBox: string): this;
    setXmlns(xmlns?: string): this;
    setFill(fill: string): this;
    setStroke(stroke: string): this;
}
export declare function Svg(child?: View): SvgTag;
//# sourceMappingURL=media.d.ts.map