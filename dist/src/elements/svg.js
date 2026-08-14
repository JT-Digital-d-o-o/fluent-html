import { defineSchemaKeys } from "../core/proto.js";
import { devChecks, assertMutable } from "../core/dev-checks.js";
import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
// ─── Shared SVG presentation attributes ────────────────────────────
export class SvgShapeTag extends Tag {
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
    setStrokeLinecap(linecap) {
        if (devChecks)
            assertMutable(this, "setStrokeLinecap");
        this['_stroke-linecap'] = linecap;
        return this;
    }
    setStrokeLinejoin(linejoin) {
        if (devChecks)
            assertMutable(this, "setStrokeLinejoin");
        this['_stroke-linejoin'] = linejoin;
        return this;
    }
    setStrokeDasharray(dasharray) {
        if (devChecks)
            assertMutable(this, "setStrokeDasharray");
        this['_stroke-dasharray'] = dasharray;
        return this;
    }
    setStrokeDashoffset(offset) {
        if (devChecks)
            assertMutable(this, "setStrokeDashoffset");
        this['_stroke-dashoffset'] = String(offset);
        return this;
    }
    setStrokeOpacity(opacity) {
        if (devChecks)
            assertMutable(this, "setStrokeOpacity");
        this['_stroke-opacity'] = String(opacity);
        return this;
    }
    setOpacity(opacity) {
        if (devChecks)
            assertMutable(this, "setOpacity");
        this._svgOpacity = opacity;
        return this;
    }
    setTransform(transform) {
        if (devChecks)
            assertMutable(this, "setTransform");
        this._transformValue = transform;
        return this;
    }
    setFilter(filter) {
        if (devChecks)
            assertMutable(this, "setFilter");
        this._filter = filter;
        return this;
    }
}
/** @internal */
const SHAPE_SK = [['fillValue', 'fill'], ['strokeValue', 'stroke'], 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-opacity', ['transformValue', 'transform'], ['svgOpacity', 'opacity'], 'filter'];
defineSchemaKeys(SvgShapeTag, [...SHAPE_SK]);
// ─── Circle ─────────────────────────────────────────────────────────
export class CircleTag extends SvgShapeTag {
    setCx(cx) {
        if (devChecks)
            assertMutable(this, "setCx");
        this._cx = cx;
        return this;
    }
    setCy(cy) {
        if (devChecks)
            assertMutable(this, "setCy");
        this._cy = cy;
        return this;
    }
    setR(r) {
        if (devChecks)
            assertMutable(this, "setR");
        this._r = r;
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
        if (devChecks)
            assertMutable(this, "setX");
        this._x = x;
        return this;
    }
    setY(y) {
        if (devChecks)
            assertMutable(this, "setY");
        this._y = y;
        return this;
    }
    setWidth(width) {
        if (devChecks)
            assertMutable(this, "setWidth");
        this._width = String(width);
        return this;
    }
    setHeight(height) {
        if (devChecks)
            assertMutable(this, "setHeight");
        this._height = String(height);
        return this;
    }
    setRx(rx) {
        if (devChecks)
            assertMutable(this, "setRx");
        this._rx = rx;
        return this;
    }
    setRy(ry) {
        if (devChecks)
            assertMutable(this, "setRy");
        this._ry = ry;
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
        if (devChecks)
            assertMutable(this, "setX1");
        this._x1 = x1;
        return this;
    }
    setY1(y1) {
        if (devChecks)
            assertMutable(this, "setY1");
        this._y1 = y1;
        return this;
    }
    setX2(x2) {
        if (devChecks)
            assertMutable(this, "setX2");
        this._x2 = x2;
        return this;
    }
    setY2(y2) {
        if (devChecks)
            assertMutable(this, "setY2");
        this._y2 = y2;
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
        if (devChecks)
            assertMutable(this, "setD");
        this._d = d;
        return this;
    }
    setFillRule(rule) {
        if (devChecks)
            assertMutable(this, "setFillRule");
        this['_fill-rule'] = rule;
        return this;
    }
    setClipRule(rule) {
        if (devChecks)
            assertMutable(this, "setClipRule");
        this['_clip-rule'] = rule;
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
        if (devChecks)
            assertMutable(this, "setCx");
        this._cx = cx;
        return this;
    }
    setCy(cy) {
        if (devChecks)
            assertMutable(this, "setCy");
        this._cy = cy;
        return this;
    }
    setRx(rx) {
        if (devChecks)
            assertMutable(this, "setRx");
        this._rx = rx;
        return this;
    }
    setRy(ry) {
        if (devChecks)
            assertMutable(this, "setRy");
        this._ry = ry;
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
        if (devChecks)
            assertMutable(this, "setPoints");
        this._points = Array.isArray(points)
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
        if (devChecks)
            assertMutable(this, "setPoints");
        this._points = Array.isArray(points)
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
        if (devChecks)
            assertMutable(this, "setX");
        this._x = x;
        return this;
    }
    setY(y) {
        if (devChecks)
            assertMutable(this, "setY");
        this._y = y;
        return this;
    }
    setDx(dx) {
        if (devChecks)
            assertMutable(this, "setDx");
        this._dx = dx;
        return this;
    }
    setDy(dy) {
        if (devChecks)
            assertMutable(this, "setDy");
        this._dy = dy;
        return this;
    }
    setTextAnchor(anchor) {
        if (devChecks)
            assertMutable(this, "setTextAnchor");
        this['_text-anchor'] = anchor;
        return this;
    }
    setDominantBaseline(baseline) {
        if (devChecks)
            assertMutable(this, "setDominantBaseline");
        this['_dominant-baseline'] = baseline;
        return this;
    }
    setFontSize(size) {
        if (devChecks)
            assertMutable(this, "setFontSize");
        this['_font-size'] = size;
        return this;
    }
    setFontFamily(family) {
        if (devChecks)
            assertMutable(this, "setFontFamily");
        this['_font-family'] = family;
        return this;
    }
    setFontWeight(weight) {
        if (devChecks)
            assertMutable(this, "setFontWeight");
        this['_font-weight'] = `${weight}`;
        return this;
    }
    setFontStyle(style) {
        if (devChecks)
            assertMutable(this, "setFontStyle");
        this['_font-style'] = style;
        return this;
    }
    setTextDecoration(decoration) {
        if (devChecks)
            assertMutable(this, "setTextDecoration");
        this['_text-decoration'] = decoration;
        return this;
    }
    setLetterSpacing(spacing) {
        if (devChecks)
            assertMutable(this, "setLetterSpacing");
        this['_letter-spacing'] = spacing;
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
        if (devChecks)
            assertMutable(this, "setX");
        this._x = x;
        return this;
    }
    setY(y) {
        if (devChecks)
            assertMutable(this, "setY");
        this._y = y;
        return this;
    }
    setDx(dx) {
        if (devChecks)
            assertMutable(this, "setDx");
        this._dx = dx;
        return this;
    }
    setDy(dy) {
        if (devChecks)
            assertMutable(this, "setDy");
        this._dy = dy;
        return this;
    }
    setFontSize(size) {
        if (devChecks)
            assertMutable(this, "setFontSize");
        this['_font-size'] = size;
        return this;
    }
    setFontFamily(family) {
        if (devChecks)
            assertMutable(this, "setFontFamily");
        this['_font-family'] = family;
        return this;
    }
    setFontWeight(weight) {
        if (devChecks)
            assertMutable(this, "setFontWeight");
        this['_font-weight'] = `${weight}`;
        return this;
    }
    setFontStyle(style) {
        if (devChecks)
            assertMutable(this, "setFontStyle");
        this['_font-style'] = style;
        return this;
    }
    setTextDecoration(decoration) {
        if (devChecks)
            assertMutable(this, "setTextDecoration");
        this['_text-decoration'] = decoration;
        return this;
    }
    setLetterSpacing(spacing) {
        if (devChecks)
            assertMutable(this, "setLetterSpacing");
        this['_letter-spacing'] = spacing;
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
        if (devChecks)
            assertMutable(this, "setHref");
        this._href = href;
        return this;
    }
    setX(x) {
        if (devChecks)
            assertMutable(this, "setX");
        this._x = x;
        return this;
    }
    setY(y) {
        if (devChecks)
            assertMutable(this, "setY");
        this._y = y;
        return this;
    }
    setWidth(width) {
        if (devChecks)
            assertMutable(this, "setWidth");
        this._width = String(width);
        return this;
    }
    setHeight(height) {
        if (devChecks)
            assertMutable(this, "setHeight");
        this._height = String(height);
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
    setX1(v) {
        if (devChecks)
            assertMutable(this, "setX1");
        this._x1 = String(v);
        return this;
    }
    setY1(v) {
        if (devChecks)
            assertMutable(this, "setY1");
        this._y1 = String(v);
        return this;
    }
    setX2(v) {
        if (devChecks)
            assertMutable(this, "setX2");
        this._x2 = String(v);
        return this;
    }
    setY2(v) {
        if (devChecks)
            assertMutable(this, "setY2");
        this._y2 = String(v);
        return this;
    }
    setGradientUnits(v) {
        if (devChecks)
            assertMutable(this, "setGradientUnits");
        this._gradientUnits = v;
        return this;
    }
    setGradientTransform(v) {
        if (devChecks)
            assertMutable(this, "setGradientTransform");
        this._gradientTransform = v;
        return this;
    }
    setSpreadMethod(v) {
        if (devChecks)
            assertMutable(this, "setSpreadMethod");
        this._spreadMethod = v;
        return this;
    }
}
defineSchemaKeys(LinearGradientTag, ['x1', 'y1', 'x2', 'y2', 'gradientUnits', 'gradientTransform', 'spreadMethod']);
export function LinearGradient(...children) {
    return new LinearGradientTag("linearGradient", ...children);
}
export class RadialGradientTag extends Tag {
    setCx(v) {
        if (devChecks)
            assertMutable(this, "setCx");
        this._cx = String(v);
        return this;
    }
    setCy(v) {
        if (devChecks)
            assertMutable(this, "setCy");
        this._cy = String(v);
        return this;
    }
    setR(v) {
        if (devChecks)
            assertMutable(this, "setR");
        this._r = String(v);
        return this;
    }
    setFx(v) {
        if (devChecks)
            assertMutable(this, "setFx");
        this._fx = String(v);
        return this;
    }
    setFy(v) {
        if (devChecks)
            assertMutable(this, "setFy");
        this._fy = String(v);
        return this;
    }
    setGradientUnits(v) {
        if (devChecks)
            assertMutable(this, "setGradientUnits");
        this._gradientUnits = v;
        return this;
    }
    setGradientTransform(v) {
        if (devChecks)
            assertMutable(this, "setGradientTransform");
        this._gradientTransform = v;
        return this;
    }
    setSpreadMethod(v) {
        if (devChecks)
            assertMutable(this, "setSpreadMethod");
        this._spreadMethod = v;
        return this;
    }
}
defineSchemaKeys(RadialGradientTag, ['cx', 'cy', 'r', 'fx', 'fy', 'gradientUnits', 'gradientTransform', 'spreadMethod']);
export function RadialGradient(...children) {
    return new RadialGradientTag("radialGradient", ...children);
}
export class StopTag extends Tag {
    setOffset(v) {
        if (devChecks)
            assertMutable(this, "setOffset");
        this._offset = String(v);
        return this;
    }
    setStopColor(v) {
        if (devChecks)
            assertMutable(this, "setStopColor");
        this['_stop-color'] = v;
        return this;
    }
    setStopOpacity(v) {
        if (devChecks)
            assertMutable(this, "setStopOpacity");
        this['_stop-opacity'] = String(v);
        return this;
    }
}
defineSchemaKeys(StopTag, ['offset', 'stop-color', 'stop-opacity']);
export function Stop(...children) {
    return new StopTag("stop", ...children);
}
// ─── Clipping, masking, filters ────────────────────────────────────
export class ClipPathTag extends Tag {
    setClipPathUnits(v) {
        if (devChecks)
            assertMutable(this, "setClipPathUnits");
        this._clipPathUnits = v;
        return this;
    }
}
defineSchemaKeys(ClipPathTag, ['clipPathUnits']);
export function ClipPath(...children) {
    return new ClipPathTag("clipPath", ...children);
}
export class MaskTag extends Tag {
    setMaskUnits(v) {
        if (devChecks)
            assertMutable(this, "setMaskUnits");
        this._maskUnits = v;
        return this;
    }
    setMaskContentUnits(v) {
        if (devChecks)
            assertMutable(this, "setMaskContentUnits");
        this._maskContentUnits = v;
        return this;
    }
    setX(v) {
        if (devChecks)
            assertMutable(this, "setX");
        this._x = String(v);
        return this;
    }
    setY(v) {
        if (devChecks)
            assertMutable(this, "setY");
        this._y = String(v);
        return this;
    }
    setWidth(v) {
        if (devChecks)
            assertMutable(this, "setWidth");
        this._width = String(v);
        return this;
    }
    setHeight(v) {
        if (devChecks)
            assertMutable(this, "setHeight");
        this._height = String(v);
        return this;
    }
}
defineSchemaKeys(MaskTag, ['maskUnits', 'maskContentUnits', 'x', 'y', 'width', 'height']);
export function Mask(...children) {
    return new MaskTag("mask", ...children);
}
export class FilterTag extends Tag {
    setX(v) {
        if (devChecks)
            assertMutable(this, "setX");
        this._x = String(v);
        return this;
    }
    setY(v) {
        if (devChecks)
            assertMutable(this, "setY");
        this._y = String(v);
        return this;
    }
    setWidth(v) {
        if (devChecks)
            assertMutable(this, "setWidth");
        this._width = String(v);
        return this;
    }
    setHeight(v) {
        if (devChecks)
            assertMutable(this, "setHeight");
        this._height = String(v);
        return this;
    }
    setFilterUnits(v) {
        if (devChecks)
            assertMutable(this, "setFilterUnits");
        this._filterUnits = v;
        return this;
    }
    setPrimitiveUnits(v) {
        if (devChecks)
            assertMutable(this, "setPrimitiveUnits");
        this._primitiveUnits = v;
        return this;
    }
}
defineSchemaKeys(FilterTag, ['x', 'y', 'width', 'height', 'filterUnits', 'primitiveUnits']);
export function Filter(...children) {
    return new FilterTag("filter", ...children);
}
export class FeGaussianBlurTag extends Tag {
    setIn(v) {
        if (devChecks)
            assertMutable(this, "setIn");
        this._in = v;
        return this;
    }
    setStdDeviation(v) {
        if (devChecks)
            assertMutable(this, "setStdDeviation");
        this._stdDeviation = String(v);
        return this;
    }
    setResult(v) {
        if (devChecks)
            assertMutable(this, "setResult");
        this._result = v;
        return this;
    }
    setEdgeMode(v) {
        if (devChecks)
            assertMutable(this, "setEdgeMode");
        this._edgeMode = v;
        return this;
    }
}
defineSchemaKeys(FeGaussianBlurTag, ['in', 'stdDeviation', 'result', 'edgeMode']);
export function FeGaussianBlur(...children) {
    return new FeGaussianBlurTag("feGaussianBlur", ...children);
}
//# sourceMappingURL=svg.js.map