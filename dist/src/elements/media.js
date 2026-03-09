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
        this.width = width;
        return this;
    }
    setHeight(height) {
        this.height = height;
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
    setCrossorigin(crossorigin) {
        this.crossorigin = crossorigin;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
ImgTag.prototype._sk = ['src', 'alt', 'width', 'height', 'loading', 'decoding', 'srcset', 'sizes', 'crossorigin'];
/** Create an `<img>` element with typed attribute methods. */
export function Img(...children) {
    return new ImgTag("img", ...children);
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
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
SourceTag.prototype._sk = ['src', 'srcset', 'media', 'sizes', 'type'];
export function Source(...children) {
    return new SourceTag("source", ...children);
}
export class VideoTag extends Tag {
    setWidth(width) {
        this.width = width;
        return this;
    }
    setHeight(height) {
        this.height = height;
        return this;
    }
    setControls(enabled = true) {
        this.controls = enabled;
        return this;
    }
    setSrc(src) {
        this.src = src;
        return this;
    }
    setAutoplay(autoplay = true) {
        this.autoplay = autoplay;
        return this;
    }
    setLoop(loop = true) {
        this.loop = loop;
        return this;
    }
    setMuted(muted = true) {
        this.muted = muted;
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
    setPlaysinline(playsinline = true) {
        this.playsinline = playsinline;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
VideoTag.prototype._sk = ['src', 'controls', 'autoplay', 'loop', 'muted', 'poster', 'preload', 'playsinline', 'width', 'height'];
export function Video(...children) {
    return new VideoTag("video", ...children);
}
export class AudioTag extends Tag {
    setSrc(src) {
        this.src = src;
        return this;
    }
    setControls(controls = true) {
        this.controls = controls;
        return this;
    }
    setAutoplay(autoplay = true) {
        this.autoplay = autoplay;
        return this;
    }
    setLoop(loop = true) {
        this.loop = loop;
        return this;
    }
    setMuted(muted = true) {
        this.muted = muted;
        return this;
    }
    setPreload(preload) {
        this.preload = preload;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
AudioTag.prototype._sk = ['src', 'controls', 'autoplay', 'loop', 'muted', 'preload'];
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
    setDefault(isDefault = true) {
        this.default = isDefault;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
TrackTag.prototype._sk = ['src', 'kind', 'srclang', 'label', 'default'];
export function Track(...children) {
    return new TrackTag("track", ...children);
}
export class CanvasTag extends Tag {
    setWidth(width) {
        this.width = width;
        return this;
    }
    setHeight(height) {
        this.height = height;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
CanvasTag.prototype._sk = ['width', 'height'];
export function Canvas(...children) {
    return new CanvasTag("canvas", ...children);
}
export class SvgTag extends Tag {
    setWidth(width) {
        this.width = width;
        return this;
    }
    setHeight(height) {
        this.height = height;
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
        this.fill = fill;
        return this;
    }
    setStroke(stroke) {
        this.stroke = stroke;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
SvgTag.prototype._sk = ['width', 'height', 'viewBox', 'xmlns', 'fill', 'stroke'];
export function Svg(...children) {
    return new SvgTag("svg", ...children);
}
//# sourceMappingURL=media.js.map