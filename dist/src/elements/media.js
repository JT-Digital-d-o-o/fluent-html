import { defineSchemaKeys } from "../core/proto.js";
import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
/**
 * Specialized Tag for `<img>` elements with typed attribute setters.
 *
 * @example
 * Img().setSrc("/photo.jpg").setAlt("A photo").setLoading("lazy")
 */
export class ImgTag extends Tag {
    setSrc(src) {
        this.src = src;
        return this;
    }
    setAlt(alt) {
        this.alt = alt;
        return this;
    }
    setWidth(width) {
        this.width = width === undefined ? undefined : String(width);
        return this;
    }
    setHeight(height) {
        this.height = height === undefined ? undefined : String(height);
        return this;
    }
    setLoading(loading) {
        this.loading = loading;
        return this;
    }
    setDecoding(decoding) {
        this.decoding = decoding;
        return this;
    }
    setSrcset(srcset) {
        this.srcset = srcset;
        return this;
    }
    setSizes(sizes) {
        this.sizes = sizes;
        return this;
    }
    setCrossOrigin(crossorigin) {
        this.crossorigin = crossorigin;
        return this;
    }
    /** Core Web Vitals priority hint — promote the LCP image (`'high'`) or de-prioritise (`'low'`). */
    setFetchPriority(fetchpriority) {
        this.fetchpriority = fetchpriority;
        return this;
    }
    setReferrerPolicy(referrerpolicy) {
        this.referrerpolicy = referrerpolicy;
        return this;
    }
}
defineSchemaKeys(ImgTag, ['src', 'alt', 'width', 'height', 'loading', 'decoding', 'srcset', 'sizes', 'crossorigin', 'fetchpriority', 'referrerpolicy']);
/** Create an `<img>` element with typed attribute methods. */
export function Img() {
    return new ImgTag("img");
}
export function Picture(...children) {
    return El("picture", ...children);
}
export class SourceTag extends Tag {
    setSrc(src) {
        this.src = src;
        return this;
    }
    setSrcset(srcset) {
        this.srcset = srcset;
        return this;
    }
    setSizes(sizes) {
        this.sizes = sizes;
        return this;
    }
    setType(type) {
        this.type = type;
        return this;
    }
    setMedia(media) {
        this.media = media;
        return this;
    }
    setWidth(width) {
        this.width = width === undefined ? undefined : String(width);
        return this;
    }
    setHeight(height) {
        this.height = height === undefined ? undefined : String(height);
        return this;
    }
}
defineSchemaKeys(SourceTag, ['src', 'srcset', 'media', 'sizes', 'type', 'width', 'height']);
export function Source() {
    return new SourceTag("source");
}
export class VideoTag extends Tag {
    setWidth(width) {
        this.width = width === undefined ? undefined : String(width);
        return this;
    }
    setHeight(height) {
        this.height = height === undefined ? undefined : String(height);
        return this;
    }
    setSrc(src) {
        this.src = src;
        return this;
    }
    setPreload(preload) {
        this.preload = preload;
        return this;
    }
    setPoster(poster) {
        this.poster = poster;
        return this;
    }
    setCrossOrigin(crossorigin) {
        this.crossorigin = crossorigin;
        return this;
    }
}
defineSchemaKeys(VideoTag, ['src', 'poster', 'preload', 'width', 'height', 'crossorigin']);
export function Video(...children) {
    return new VideoTag("video", ...children);
}
export class AudioTag extends Tag {
    setSrc(src) {
        this.src = src;
        return this;
    }
    setPreload(preload) {
        this.preload = preload;
        return this;
    }
    setCrossOrigin(crossorigin) {
        this.crossorigin = crossorigin;
        return this;
    }
}
defineSchemaKeys(AudioTag, ['src', 'preload', 'crossorigin']);
export function Audio(...children) {
    return new AudioTag("audio", ...children);
}
export class TrackTag extends Tag {
    setSrc(src) {
        this.src = src;
        return this;
    }
    setKind(kind) {
        this.kind = kind;
        return this;
    }
    setSrclang(srclang) {
        this.srclang = srclang;
        return this;
    }
    setLabel(label) {
        this.label = label;
        return this;
    }
}
defineSchemaKeys(TrackTag, ['src', 'kind', 'srclang', 'label']);
export function Track() {
    return new TrackTag("track");
}
export class CanvasTag extends Tag {
    setWidth(width) {
        this.width = width === undefined ? undefined : String(width);
        return this;
    }
    setHeight(height) {
        this.height = height === undefined ? undefined : String(height);
        return this;
    }
}
defineSchemaKeys(CanvasTag, ['width', 'height']);
export function Canvas(...children) {
    return new CanvasTag("canvas", ...children);
}
export class SvgTag extends Tag {
    setWidth(width) {
        this.width = width === undefined ? undefined : String(width);
        return this;
    }
    setHeight(height) {
        this.height = height === undefined ? undefined : String(height);
        return this;
    }
    setViewBox(viewBox) {
        this.viewBox = viewBox;
        return this;
    }
    setXmlns(xmlns = "http://www.w3.org/2000/svg") {
        this.xmlns = xmlns;
        return this;
    }
    setFill(fill) {
        this.fillValue = fill;
        return this;
    }
    setStroke(stroke) {
        this.strokeValue = stroke;
        return this;
    }
    setStrokeWidth(width) {
        this['stroke-width'] = String(width);
        return this;
    }
}
defineSchemaKeys(SvgTag, ['width', 'height', 'viewBox', 'xmlns', ['fillValue', 'fill'], ['strokeValue', 'stroke'], 'stroke-width']);
export function Svg(...children) {
    return new SvgTag("svg", ...children);
}
//# sourceMappingURL=media.js.map