"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SvgTag = exports.CanvasTag = exports.TrackTag = exports.AudioTag = exports.VideoTag = exports.SourceTag = exports.ImgTag = void 0;
exports.Img = Img;
exports.Picture = Picture;
exports.Source = Source;
exports.Video = Video;
exports.Audio = Audio;
exports.Track = Track;
exports.Canvas = Canvas;
exports.Svg = Svg;
const tag_js_1 = require("../core/tag.js");
const utils_js_1 = require("../core/utils.js");
class ImgTag extends tag_js_1.Tag {
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
exports.ImgTag = ImgTag;
/** @internal */
ImgTag.prototype._sk = ['src', 'alt', 'width', 'height', 'loading', 'decoding', 'srcset', 'sizes', 'crossorigin'];
function Img(...children) {
    return new ImgTag("img", ...children);
}
function Picture(...children) {
    return (0, utils_js_1.El)("picture", ...children);
}
class SourceTag extends tag_js_1.Tag {
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
exports.SourceTag = SourceTag;
/** @internal */
SourceTag.prototype._sk = ['src', 'srcset', 'media', 'sizes', 'type'];
function Source(...children) {
    return new SourceTag("source", ...children);
}
class VideoTag extends tag_js_1.Tag {
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
exports.VideoTag = VideoTag;
/** @internal */
VideoTag.prototype._sk = ['src', 'controls', 'autoplay', 'loop', 'muted', 'poster', 'preload', 'playsinline', 'width', 'height'];
function Video(...children) {
    return new VideoTag("video", ...children);
}
class AudioTag extends tag_js_1.Tag {
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
exports.AudioTag = AudioTag;
/** @internal */
AudioTag.prototype._sk = ['src', 'controls', 'autoplay', 'loop', 'muted', 'preload'];
function Audio(...children) {
    return new AudioTag("audio", ...children);
}
class TrackTag extends tag_js_1.Tag {
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
exports.TrackTag = TrackTag;
/** @internal */
TrackTag.prototype._sk = ['src', 'kind', 'srclang', 'label', 'default'];
function Track(...children) {
    return new TrackTag("track", ...children);
}
class CanvasTag extends tag_js_1.Tag {
    setWidth(width) {
        this.width = width;
        return this;
    }
    setHeight(height) {
        this.height = height;
        return this;
    }
}
exports.CanvasTag = CanvasTag;
/** @internal */
CanvasTag.prototype._sk = ['width', 'height'];
function Canvas(...children) {
    return new CanvasTag("canvas", ...children);
}
class SvgTag extends tag_js_1.Tag {
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
exports.SvgTag = SvgTag;
/** @internal */
SvgTag.prototype._sk = ['width', 'height', 'viewBox', 'xmlns', 'fill', 'stroke'];
function Svg(...children) {
    return new SvgTag("svg", ...children);
}
//# sourceMappingURL=media.js.map