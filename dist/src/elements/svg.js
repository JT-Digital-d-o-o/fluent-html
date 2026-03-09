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
        this['stroke-width'] = width;
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
    setSvgOpacity(opacity) {
        return this.addAttribute('opacity', opacity);
    }
    setTransform(transform) {
        this.transform = transform;
        return this;
    }
}
/** @internal */
const SHAPE_SK = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'transform'];
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
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
CircleTag.prototype._sk = ['cx', 'cy', 'r', ...SHAPE_SK];
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
        this.width = width;
        return this;
    }
    setHeight(height) {
        this.height = height;
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
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
RectTag.prototype._sk = ['x', 'y', 'width', 'height', 'rx', 'ry', ...SHAPE_SK];
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
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
LineTag.prototype._sk = ['x1', 'y1', 'x2', 'y2', ...SHAPE_SK];
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
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
PathTag.prototype._sk = ['d', 'fill-rule', 'clip-rule', ...SHAPE_SK];
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
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
EllipseTag.prototype._sk = ['cx', 'cy', 'rx', 'ry', ...SHAPE_SK];
export function Ellipse(...children) {
    return new EllipseTag("ellipse", ...children);
}
// ─── Polygon ────────────────────────────────────────────────────────
export class PolygonTag extends SvgShapeTag {
    setPoints(points) {
        this.points = points;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
PolygonTag.prototype._sk = ['points', ...SHAPE_SK];
export function Polygon(...children) {
    return new PolygonTag("polygon", ...children);
}
// ─── Polyline ───────────────────────────────────────────────────────
export class PolylineTag extends SvgShapeTag {
    setPoints(points) {
        this.points = points;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
PolylineTag.prototype._sk = ['points', ...SHAPE_SK];
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
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
SvgTextTag.prototype._sk = ['x', 'y', 'dx', 'dy', 'text-anchor', 'dominant-baseline', 'font-size', 'font-family', ...SHAPE_SK];
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
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
TspanTag.prototype._sk = ['x', 'y', 'dx', 'dy', ...SHAPE_SK];
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
UseTag.prototype._sk = ['href', 'x', 'y', 'width', 'height'];
export function Use(...children) {
    return new UseTag("use", ...children);
}
// ─── Container elements (no extra attributes) ──────────────────────
export function G(...children) {
    return El("g", ...children);
}
export function Defs(...children) {
    return El("defs", ...children);
}
//# sourceMappingURL=svg.js.map