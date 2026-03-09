import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
export declare class SvgShapeTag extends Tag {
    fill?: string;
    stroke?: string;
    'stroke-width'?: string;
    'stroke-linecap'?: 'butt' | 'round' | 'square';
    'stroke-linejoin'?: 'miter' | 'round' | 'bevel';
    'stroke-dasharray'?: string;
    transform?: string;
    setFill(fill: string): this;
    setStroke(stroke: string): this;
    setStrokeWidth(width: string): this;
    setStrokeLinecap(linecap: 'butt' | 'round' | 'square'): this;
    setStrokeLinejoin(linejoin: 'miter' | 'round' | 'bevel'): this;
    setStrokeDasharray(dasharray: string): this;
    setSvgOpacity(opacity: string): this;
    setTransform(transform: string): this;
}
export declare class CircleTag extends SvgShapeTag {
    cx?: string;
    cy?: string;
    r?: string;
    setCx(cx: string): this;
    setCy(cy: string): this;
    setR(r: string): this;
}
export declare function Circle(...children: View[]): CircleTag;
export declare class RectTag extends SvgShapeTag {
    x?: string;
    y?: string;
    width?: string;
    height?: string;
    rx?: string;
    ry?: string;
    setX(x: string): this;
    setY(y: string): this;
    setWidth(width: string): this;
    setHeight(height: string): this;
    setRx(rx: string): this;
    setRy(ry: string): this;
}
export declare function Rect(...children: View[]): RectTag;
export declare class LineTag extends SvgShapeTag {
    x1?: string;
    y1?: string;
    x2?: string;
    y2?: string;
    setX1(x1: string): this;
    setY1(y1: string): this;
    setX2(x2: string): this;
    setY2(y2: string): this;
}
export declare function Line(...children: View[]): LineTag;
export declare class PathTag extends SvgShapeTag {
    d?: string;
    'fill-rule'?: 'nonzero' | 'evenodd';
    'clip-rule'?: 'nonzero' | 'evenodd';
    setD(d: string): this;
    setFillRule(rule: 'nonzero' | 'evenodd'): this;
    setClipRule(rule: 'nonzero' | 'evenodd'): this;
}
export declare function Path(...children: View[]): PathTag;
export declare class EllipseTag extends SvgShapeTag {
    cx?: string;
    cy?: string;
    rx?: string;
    ry?: string;
    setCx(cx: string): this;
    setCy(cy: string): this;
    setRx(rx: string): this;
    setRy(ry: string): this;
}
export declare function Ellipse(...children: View[]): EllipseTag;
export declare class PolygonTag extends SvgShapeTag {
    points?: string;
    setPoints(points: string): this;
}
export declare function Polygon(...children: View[]): PolygonTag;
export declare class PolylineTag extends SvgShapeTag {
    points?: string;
    setPoints(points: string): this;
}
export declare function Polyline(...children: View[]): PolylineTag;
export declare class SvgTextTag extends SvgShapeTag {
    x?: string;
    y?: string;
    dx?: string;
    dy?: string;
    'text-anchor'?: 'start' | 'middle' | 'end';
    'dominant-baseline'?: string;
    'font-size'?: string;
    'font-family'?: string;
    setX(x: string): this;
    setY(y: string): this;
    setDx(dx: string): this;
    setDy(dy: string): this;
    setTextAnchor(anchor: 'start' | 'middle' | 'end'): this;
    setDominantBaseline(baseline: string): this;
    setFontSize(size: string): this;
    setFontFamily(family: string): this;
}
export declare function Text(...children: View[]): SvgTextTag;
export declare class TspanTag extends SvgShapeTag {
    x?: string;
    y?: string;
    dx?: string;
    dy?: string;
    setX(x: string): this;
    setY(y: string): this;
    setDx(dx: string): this;
    setDy(dy: string): this;
}
export declare function Tspan(...children: View[]): TspanTag;
export declare class UseTag extends Tag {
    href?: string;
    x?: string;
    y?: string;
    width?: string;
    height?: string;
    setHref(href: string): this;
    setX(x: string): this;
    setY(y: string): this;
    setWidth(width: string): this;
    setHeight(height: string): this;
}
export declare function Use(...children: View[]): UseTag;
export declare function G(...children: View[]): Tag;
export declare function Defs(...children: View[]): Tag;
//# sourceMappingURL=svg.d.ts.map