import { defineSchemaKeys } from "../core/proto.js";
import { devChecks, assertMutable } from "../core/dev-checks.js";
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
        if (devChecks)
            assertMutable(this, "setSrc");
        this._src = src;
        return this;
    }
    setAlt(alt) {
        if (devChecks)
            assertMutable(this, "setAlt");
        this._alt = alt;
        return this;
    }
    setWidth(width) {
        if (devChecks)
            assertMutable(this, "setWidth");
        this._width = width === undefined ? undefined : String(width);
        return this;
    }
    setHeight(height) {
        if (devChecks)
            assertMutable(this, "setHeight");
        this._height = height === undefined ? undefined : String(height);
        return this;
    }
    setLoading(loading) {
        if (devChecks)
            assertMutable(this, "setLoading");
        this._loading = loading;
        return this;
    }
    setDecoding(decoding) {
        if (devChecks)
            assertMutable(this, "setDecoding");
        this._decoding = decoding;
        return this;
    }
    setSrcset(srcset) {
        if (devChecks)
            assertMutable(this, "setSrcset");
        this._srcset = srcset;
        return this;
    }
    setSizes(sizes) {
        if (devChecks)
            assertMutable(this, "setSizes");
        this._sizes = sizes;
        return this;
    }
    setCrossOrigin(crossorigin) {
        if (devChecks)
            assertMutable(this, "setCrossOrigin");
        this._crossorigin = crossorigin;
        return this;
    }
    /** Core Web Vitals priority hint — promote the LCP image (`'high'`) or de-prioritise (`'low'`). */
    setFetchPriority(fetchpriority) {
        if (devChecks)
            assertMutable(this, "setFetchPriority");
        this._fetchpriority = fetchpriority;
        return this;
    }
    setReferrerPolicy(referrerpolicy) {
        if (devChecks)
            assertMutable(this, "setReferrerPolicy");
        this._referrerpolicy = referrerpolicy;
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
        if (devChecks)
            assertMutable(this, "setSrc");
        this._src = src;
        return this;
    }
    setSrcset(srcset) {
        if (devChecks)
            assertMutable(this, "setSrcset");
        this._srcset = srcset;
        return this;
    }
    setSizes(sizes) {
        if (devChecks)
            assertMutable(this, "setSizes");
        this._sizes = sizes;
        return this;
    }
    setType(type) {
        if (devChecks)
            assertMutable(this, "setType");
        this._type = type;
        return this;
    }
    setMedia(media) {
        if (devChecks)
            assertMutable(this, "setMedia");
        this._media = media;
        return this;
    }
    setWidth(width) {
        if (devChecks)
            assertMutable(this, "setWidth");
        this._width = width === undefined ? undefined : String(width);
        return this;
    }
    setHeight(height) {
        if (devChecks)
            assertMutable(this, "setHeight");
        this._height = height === undefined ? undefined : String(height);
        return this;
    }
}
defineSchemaKeys(SourceTag, ['src', 'srcset', 'media', 'sizes', 'type', 'width', 'height']);
export function Source() {
    return new SourceTag("source");
}
export class VideoTag extends Tag {
    setWidth(width) {
        if (devChecks)
            assertMutable(this, "setWidth");
        this._width = width === undefined ? undefined : String(width);
        return this;
    }
    setHeight(height) {
        if (devChecks)
            assertMutable(this, "setHeight");
        this._height = height === undefined ? undefined : String(height);
        return this;
    }
    setSrc(src) {
        if (devChecks)
            assertMutable(this, "setSrc");
        this._src = src;
        return this;
    }
    setPreload(preload) {
        if (devChecks)
            assertMutable(this, "setPreload");
        this._preload = preload;
        return this;
    }
    setPoster(poster) {
        if (devChecks)
            assertMutable(this, "setPoster");
        this._poster = poster;
        return this;
    }
    setCrossOrigin(crossorigin) {
        if (devChecks)
            assertMutable(this, "setCrossOrigin");
        this._crossorigin = crossorigin;
        return this;
    }
}
defineSchemaKeys(VideoTag, ['src', 'poster', 'preload', 'width', 'height', 'crossorigin']);
export function Video(...children) {
    return new VideoTag("video", ...children);
}
export class AudioTag extends Tag {
    setSrc(src) {
        if (devChecks)
            assertMutable(this, "setSrc");
        this._src = src;
        return this;
    }
    setPreload(preload) {
        if (devChecks)
            assertMutable(this, "setPreload");
        this._preload = preload;
        return this;
    }
    setCrossOrigin(crossorigin) {
        if (devChecks)
            assertMutable(this, "setCrossOrigin");
        this._crossorigin = crossorigin;
        return this;
    }
}
defineSchemaKeys(AudioTag, ['src', 'preload', 'crossorigin']);
export function Audio(...children) {
    return new AudioTag("audio", ...children);
}
export class TrackTag extends Tag {
    setSrc(src) {
        if (devChecks)
            assertMutable(this, "setSrc");
        this._src = src;
        return this;
    }
    setKind(kind) {
        if (devChecks)
            assertMutable(this, "setKind");
        this._kind = kind;
        return this;
    }
    setSrclang(srclang) {
        if (devChecks)
            assertMutable(this, "setSrclang");
        this._srclang = srclang;
        return this;
    }
    setLabel(label) {
        if (devChecks)
            assertMutable(this, "setLabel");
        this._label = label;
        return this;
    }
}
defineSchemaKeys(TrackTag, ['src', 'kind', 'srclang', 'label']);
export function Track() {
    return new TrackTag("track");
}
export class CanvasTag extends Tag {
    setWidth(width) {
        if (devChecks)
            assertMutable(this, "setWidth");
        this._width = width === undefined ? undefined : String(width);
        return this;
    }
    setHeight(height) {
        if (devChecks)
            assertMutable(this, "setHeight");
        this._height = height === undefined ? undefined : String(height);
        return this;
    }
}
defineSchemaKeys(CanvasTag, ['width', 'height']);
export function Canvas(...children) {
    return new CanvasTag("canvas", ...children);
}
export class SvgTag extends Tag {
    setWidth(width) {
        if (devChecks)
            assertMutable(this, "setWidth");
        this._width = width === undefined ? undefined : String(width);
        return this;
    }
    setHeight(height) {
        if (devChecks)
            assertMutable(this, "setHeight");
        this._height = height === undefined ? undefined : String(height);
        return this;
    }
    setViewBox(viewBox) {
        if (devChecks)
            assertMutable(this, "setViewBox");
        this._viewBox = viewBox;
        return this;
    }
    setXmlns(xmlns = "http://www.w3.org/2000/svg") {
        if (devChecks)
            assertMutable(this, "setXmlns");
        this._xmlns = xmlns;
        return this;
    }
    setFill(fill) {
        if (devChecks)
            assertMutable(this, "setFill");
        this._fillValue = fill;
        return this;
    }
    setStroke(stroke) {
        if (devChecks)
            assertMutable(this, "setStroke");
        this._strokeValue = stroke;
        return this;
    }
    setStrokeWidth(width) {
        if (devChecks)
            assertMutable(this, "setStrokeWidth");
        this['_stroke-width'] = String(width);
        return this;
    }
}
defineSchemaKeys(SvgTag, ['width', 'height', 'viewBox', 'xmlns', ['fillValue', 'fill'], ['strokeValue', 'stroke'], 'stroke-width']);
export function Svg(...children) {
    return new SvgTag("svg", ...children);
}
//# sourceMappingURL=media.js.map