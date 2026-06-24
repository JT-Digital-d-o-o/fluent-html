import { defineSchemaKeys } from "../core/proto.js";
import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
// ─── Shared SVG presentation attributes ────────────────────────────
export class SvgShapeTag extends Tag {
    setFill(fill) {
        this.fill = fill;
        return this;
    }
    setStroke(stroke) {
        this.stroke = stroke;
        return this;
    }
    setStrokeWidth(width) {
        this['stroke-width'] = String(width);
        return this;
    }
    setStrokeLinecap(linecap) {
        this['stroke-linecap'] = linecap;
        return this;
    }
    setStrokeLinejoin(linejoin) {
        this['stroke-linejoin'] = linejoin;
        return this;
    }
    setStrokeDasharray(dasharray) {
        this['stroke-dasharray'] = dasharray;
        return this;
    }
    setStrokeDashoffset(offset) {
        this['stroke-dashoffset'] = String(offset);
        return this;
    }
    setStrokeOpacity(opacity) {
        this['stroke-opacity'] = String(opacity);
        return this;
    }
    setOpacity(opacity) {
        this.svgOpacity = opacity;
        return this;
    }
    setTransform(transform) {
        this.transform = transform;
        return this;
    }
    setFilter(filter) {
        this.filter = filter;
        return this;
    }
}
/** @internal */
const SHAPE_SK = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-opacity', 'transform', ['svgOpacity', 'opacity'], 'filter'];
defineSchemaKeys(SvgShapeTag, [...SHAPE_SK]);
// ─── Circle ─────────────────────────────────────────────────────────
export class CircleTag extends SvgShapeTag {
    setCx(cx) {
        this.cx = cx;
        return this;
    }
    setCy(cy) {
        this.cy = cy;
        return this;
    }
    setR(r) {
        this.r = r;
        return this;
    }
}
defineSchemaKeys(CircleTag, ['cx', 'cy', 'r', ...SHAPE_SK]);
export function Circle(...children) {
    return new CircleTag("circle", ...children);
}
// ─── Rect ───────────────────────────────────────────────────────────
export class RectTag extends SvgShapeTag {
    setX(x) {
        this.x = x;
        return this;
    }
    setY(y) {
        this.y = y;
        return this;
    }
    setWidth(width) {
        this.width = String(width);
        return this;
    }
    setHeight(height) {
        this.height = String(height);
        return this;
    }
    setRx(rx) {
        this.rx = rx;
        return this;
    }
    setRy(ry) {
        this.ry = ry;
        return this;
    }
}
defineSchemaKeys(RectTag, ['x', 'y', 'width', 'height', 'rx', 'ry', ...SHAPE_SK]);
export function Rect(...children) {
    return new RectTag("rect", ...children);
}
// ─── Line ───────────────────────────────────────────────────────────
export class LineTag extends SvgShapeTag {
    setX1(x1) {
        this.x1 = x1;
        return this;
    }
    setY1(y1) {
        this.y1 = y1;
        return this;
    }
    setX2(x2) {
        this.x2 = x2;
        return this;
    }
    setY2(y2) {
        this.y2 = y2;
        return this;
    }
}
defineSchemaKeys(LineTag, ['x1', 'y1', 'x2', 'y2', ...SHAPE_SK]);
export function Line(...children) {
    return new LineTag("line", ...children);
}
// ─── Path ───────────────────────────────────────────────────────────
export class PathTag extends SvgShapeTag {
    setD(d) {
        this.d = d;
        return this;
    }
    setFillRule(rule) {
        this['fill-rule'] = rule;
        return this;
    }
    setClipRule(rule) {
        this['clip-rule'] = rule;
        return this;
    }
}
defineSchemaKeys(PathTag, ['d', 'fill-rule', 'clip-rule', ...SHAPE_SK]);
export function Path(...children) {
    return new PathTag("path", ...children);
}
// ─── Ellipse ────────────────────────────────────────────────────────
export class EllipseTag extends SvgShapeTag {
    setCx(cx) {
        this.cx = cx;
        return this;
    }
    setCy(cy) {
        this.cy = cy;
        return this;
    }
    setRx(rx) {
        this.rx = rx;
        return this;
    }
    setRy(ry) {
        this.ry = ry;
        return this;
    }
}
defineSchemaKeys(EllipseTag, ['cx', 'cy', 'rx', 'ry', ...SHAPE_SK]);
export function Ellipse(...children) {
    return new EllipseTag("ellipse", ...children);
}
// ─── Polygon ────────────────────────────────────────────────────────
export class PolygonTag extends SvgShapeTag {
    setPoints(points) {
        this.points = Array.isArray(points)
            ? points.map(([x, y]) => `${x},${y}`).join(' ')
            : points;
        return this;
    }
}
defineSchemaKeys(PolygonTag, ['points', ...SHAPE_SK]);
export function Polygon(...children) {
    return new PolygonTag("polygon", ...children);
}
// ─── Polyline ───────────────────────────────────────────────────────
export class PolylineTag extends SvgShapeTag {
    setPoints(points) {
        this.points = Array.isArray(points)
            ? points.map(([x, y]) => `${x},${y}`).join(' ')
            : points;
        return this;
    }
}
defineSchemaKeys(PolylineTag, ['points', ...SHAPE_SK]);
export function Polyline(...children) {
    return new PolylineTag("polyline", ...children);
}
// ─── Text ───────────────────────────────────────────────────────────
export class SvgTextTag extends SvgShapeTag {
    setX(x) {
        this.x = x;
        return this;
    }
    setY(y) {
        this.y = y;
        return this;
    }
    setDx(dx) {
        this.dx = dx;
        return this;
    }
    setDy(dy) {
        this.dy = dy;
        return this;
    }
    setTextAnchor(anchor) {
        this['text-anchor'] = anchor;
        return this;
    }
    setDominantBaseline(baseline) {
        this['dominant-baseline'] = baseline;
        return this;
    }
    setFontSize(size) {
        this['font-size'] = size;
        return this;
    }
    setFontFamily(family) {
        this['font-family'] = family;
        return this;
    }
    setFontWeight(weight) {
        this['font-weight'] = `${weight}`;
        return this;
    }
    setFontStyle(style) {
        this['font-style'] = style;
        return this;
    }
    setTextDecoration(decoration) {
        this['text-decoration'] = decoration;
        return this;
    }
    setLetterSpacing(spacing) {
        this['letter-spacing'] = spacing;
        return this;
    }
}
defineSchemaKeys(SvgTextTag, ['x', 'y', 'dx', 'dy', 'text-anchor', 'dominant-baseline', 'font-size', 'font-family', 'font-weight', 'font-style', 'text-decoration', 'letter-spacing', ...SHAPE_SK]);
export function Text(...children) {
    return new SvgTextTag("text", ...children);
}
// ─── Tspan ──────────────────────────────────────────────────────────
export class TspanTag extends SvgShapeTag {
    setX(x) {
        this.x = x;
        return this;
    }
    setY(y) {
        this.y = y;
        return this;
    }
    setDx(dx) {
        this.dx = dx;
        return this;
    }
    setDy(dy) {
        this.dy = dy;
        return this;
    }
    setFontSize(size) {
        this['font-size'] = size;
        return this;
    }
    setFontFamily(family) {
        this['font-family'] = family;
        return this;
    }
    setFontWeight(weight) {
        this['font-weight'] = `${weight}`;
        return this;
    }
    setFontStyle(style) {
        this['font-style'] = style;
        return this;
    }
    setTextDecoration(decoration) {
        this['text-decoration'] = decoration;
        return this;
    }
    setLetterSpacing(spacing) {
        this['letter-spacing'] = spacing;
        return this;
    }
}
defineSchemaKeys(TspanTag, ['x', 'y', 'dx', 'dy', 'font-weight', 'font-style', 'text-decoration', 'letter-spacing', 'font-size', 'font-family', ...SHAPE_SK]);
export function Tspan(...children) {
    return new TspanTag("tspan", ...children);
}
// ─── Use ────────────────────────────────────────────────────────────
export class UseTag extends Tag {
    setHref(href) {
        this.href = href;
        return this;
    }
    setX(x) {
        this.x = x;
        return this;
    }
    setY(y) {
        this.y = y;
        return this;
    }
    setWidth(width) {
        this.width = String(width);
        return this;
    }
    setHeight(height) {
        this.height = String(height);
        return this;
    }
}
defineSchemaKeys(UseTag, ['href', 'x', 'y', 'width', 'height']);
export function Use(...children) {
    return new UseTag("use", ...children);
}
// ─── Container elements (no extra attributes) ──────────────────────
export function G(...children) {
    return new SvgShapeTag("g", ...children);
}
export function Defs(...children) {
    return El("defs", ...children);
}
export class LinearGradientTag extends Tag {
    setX1(v) { this.x1 = String(v); return this; }
    setY1(v) { this.y1 = String(v); return this; }
    setX2(v) { this.x2 = String(v); return this; }
    setY2(v) { this.y2 = String(v); return this; }
    setGradientUnits(v) { this.gradientUnits = v; return this; }
    setGradientTransform(v) { this.gradientTransform = v; return this; }
    setSpreadMethod(v) { this.spreadMethod = v; return this; }
}
defineSchemaKeys(LinearGradientTag, ['x1', 'y1', 'x2', 'y2', 'gradientUnits', 'gradientTransform', 'spreadMethod']);
export function LinearGradient(...children) {
    return new LinearGradientTag("linearGradient", ...children);
}
export class RadialGradientTag extends Tag {
    setCx(v) { this.cx = String(v); return this; }
    setCy(v) { this.cy = String(v); return this; }
    setR(v) { this.r = String(v); return this; }
    setFx(v) { this.fx = String(v); return this; }
    setFy(v) { this.fy = String(v); return this; }
    setGradientUnits(v) { this.gradientUnits = v; return this; }
    setGradientTransform(v) { this.gradientTransform = v; return this; }
    setSpreadMethod(v) { this.spreadMethod = v; return this; }
}
defineSchemaKeys(RadialGradientTag, ['cx', 'cy', 'r', 'fx', 'fy', 'gradientUnits', 'gradientTransform', 'spreadMethod']);
export function RadialGradient(...children) {
    return new RadialGradientTag("radialGradient", ...children);
}
export class StopTag extends Tag {
    setOffset(v) { this.offset = String(v); return this; }
    setStopColor(v) { this['stop-color'] = v; return this; }
    setStopOpacity(v) { this['stop-opacity'] = String(v); return this; }
}
defineSchemaKeys(StopTag, ['offset', 'stop-color', 'stop-opacity']);
export function Stop(...children) {
    return new StopTag("stop", ...children);
}
// ─── Clipping, masking, filters ────────────────────────────────────
export class ClipPathTag extends Tag {
    setClipPathUnits(v) { this.clipPathUnits = v; return this; }
}
defineSchemaKeys(ClipPathTag, ['clipPathUnits']);
export function ClipPath(...children) {
    return new ClipPathTag("clipPath", ...children);
}
export class MaskTag extends Tag {
    setMaskUnits(v) { this.maskUnits = v; return this; }
    setMaskContentUnits(v) { this.maskContentUnits = v; return this; }
    setX(v) { this.x = String(v); return this; }
    setY(v) { this.y = String(v); return this; }
    setWidth(v) { this.width = String(v); return this; }
    setHeight(v) { this.height = String(v); return this; }
}
defineSchemaKeys(MaskTag, ['maskUnits', 'maskContentUnits', 'x', 'y', 'width', 'height']);
export function Mask(...children) {
    return new MaskTag("mask", ...children);
}
export class FilterTag extends Tag {
    setX(v) { this.x = String(v); return this; }
    setY(v) { this.y = String(v); return this; }
    setWidth(v) { this.width = String(v); return this; }
    setHeight(v) { this.height = String(v); return this; }
    setFilterUnits(v) { this.filterUnits = v; return this; }
    setPrimitiveUnits(v) { this.primitiveUnits = v; return this; }
}
defineSchemaKeys(FilterTag, ['x', 'y', 'width', 'height', 'filterUnits', 'primitiveUnits']);
export function Filter(...children) {
    return new FilterTag("filter", ...children);
}
export class FeGaussianBlurTag extends Tag {
    setIn(v) { this.in = v; return this; }
    setStdDeviation(v) { this.stdDeviation = String(v); return this; }
    setResult(v) { this.result = v; return this; }
    setEdgeMode(v) { this.edgeMode = v; return this; }
}
defineSchemaKeys(FeGaussianBlurTag, ['in', 'stdDeviation', 'result', 'edgeMode']);
export function FeGaussianBlur(...children) {
    return new FeGaussianBlurTag("feGaussianBlur", ...children);
}
//# sourceMappingURL=svg.js.map