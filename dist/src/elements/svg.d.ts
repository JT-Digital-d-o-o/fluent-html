import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
export declare class SvgShapeTag extends Tag {
    fillValue?: string;
    strokeValue?: string;
    'stroke-width'?: string;
    'stroke-linecap'?: 'butt' | 'round' | 'square';
    'stroke-linejoin'?: 'miter' | 'round' | 'bevel';
    'stroke-dasharray'?: string;
    'stroke-dashoffset'?: string;
    'stroke-opacity'?: string;
    transformValue?: string;
    svgOpacity?: string;
    filter?: string;
    setFill(fill: string): this;
    setStroke(stroke: string): this;
    setStrokeWidth(width: string | number): this;
    setStrokeLinecap(linecap: 'butt' | 'round' | 'square'): this;
    setStrokeLinejoin(linejoin: 'miter' | 'round' | 'bevel'): this;
    setStrokeDasharray(dasharray: string): this;
    setStrokeDashoffset(offset: string | number): this;
    setStrokeOpacity(opacity: string | number): this;
    setOpacity(opacity: string): this;
    setTransform(transform: string): this;
    setFilter(filter: string): this;
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
    setWidth(width: string | number): this;
    setHeight(height: string | number): this;
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
    setPoints(points: string | [number, number][]): this;
}
export declare function Polygon(...children: View[]): PolygonTag;
export declare class PolylineTag extends SvgShapeTag {
    points?: string;
    setPoints(points: string | [number, number][]): this;
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
    'font-weight'?: string;
    'font-style'?: 'normal' | 'italic' | 'oblique';
    'text-decoration'?: 'none' | 'underline' | 'overline' | 'line-through';
    'letter-spacing'?: string;
    setX(x: string): this;
    setY(y: string): this;
    setDx(dx: string): this;
    setDy(dy: string): this;
    setTextAnchor(anchor: 'start' | 'middle' | 'end'): this;
    setDominantBaseline(baseline: string): this;
    setFontSize(size: string): this;
    setFontFamily(family: string): this;
    setFontWeight(weight: number | 'normal' | 'bold' | 'bolder' | 'lighter'): this;
    setFontStyle(style: 'normal' | 'italic' | 'oblique'): this;
    setTextDecoration(decoration: 'none' | 'underline' | 'overline' | 'line-through'): this;
    setLetterSpacing(spacing: string): this;
}
export declare function Text(...children: View[]): SvgTextTag;
export declare class TspanTag extends SvgShapeTag {
    x?: string;
    y?: string;
    dx?: string;
    dy?: string;
    'font-weight'?: string;
    'font-style'?: 'normal' | 'italic' | 'oblique';
    'text-decoration'?: 'none' | 'underline' | 'overline' | 'line-through';
    'letter-spacing'?: string;
    'font-size'?: string;
    'font-family'?: string;
    setX(x: string): this;
    setY(y: string): this;
    setDx(dx: string): this;
    setDy(dy: string): this;
    setFontSize(size: string): this;
    setFontFamily(family: string): this;
    setFontWeight(weight: number | 'normal' | 'bold' | 'bolder' | 'lighter'): this;
    setFontStyle(style: 'normal' | 'italic' | 'oblique'): this;
    setTextDecoration(decoration: 'none' | 'underline' | 'overline' | 'line-through'): this;
    setLetterSpacing(spacing: string): this;
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
    setWidth(width: string | number): this;
    setHeight(height: string | number): this;
}
export declare function Use(...children: View[]): UseTag;
export declare function G(...children: View[]): SvgShapeTag;
export declare function Defs(...children: View[]): Tag;
type GradientUnits = 'userSpaceOnUse' | 'objectBoundingBox';
type SpreadMethod = 'pad' | 'reflect' | 'repeat';
export declare class LinearGradientTag extends Tag {
    x1?: string;
    y1?: string;
    x2?: string;
    y2?: string;
    gradientUnits?: GradientUnits;
    gradientTransform?: string;
    spreadMethod?: SpreadMethod;
    setX1(v: string | number): this;
    setY1(v: string | number): this;
    setX2(v: string | number): this;
    setY2(v: string | number): this;
    setGradientUnits(v: GradientUnits): this;
    setGradientTransform(v: string): this;
    setSpreadMethod(v: SpreadMethod): this;
}
export declare function LinearGradient(...children: View[]): LinearGradientTag;
export declare class RadialGradientTag extends Tag {
    cx?: string;
    cy?: string;
    r?: string;
    fx?: string;
    fy?: string;
    gradientUnits?: GradientUnits;
    gradientTransform?: string;
    spreadMethod?: SpreadMethod;
    setCx(v: string | number): this;
    setCy(v: string | number): this;
    setR(v: string | number): this;
    setFx(v: string | number): this;
    setFy(v: string | number): this;
    setGradientUnits(v: GradientUnits): this;
    setGradientTransform(v: string): this;
    setSpreadMethod(v: SpreadMethod): this;
}
export declare function RadialGradient(...children: View[]): RadialGradientTag;
export declare class StopTag extends Tag {
    offset?: string;
    'stop-color'?: string;
    'stop-opacity'?: string;
    setOffset(v: string | number): this;
    setStopColor(v: string): this;
    setStopOpacity(v: string | number): this;
}
export declare function Stop(...children: View[]): StopTag;
export declare class ClipPathTag extends Tag {
    clipPathUnits?: GradientUnits;
    setClipPathUnits(v: GradientUnits): this;
}
export declare function ClipPath(...children: View[]): ClipPathTag;
export declare class MaskTag extends Tag {
    maskUnits?: GradientUnits;
    maskContentUnits?: GradientUnits;
    x?: string;
    y?: string;
    width?: string;
    height?: string;
    setMaskUnits(v: GradientUnits): this;
    setMaskContentUnits(v: GradientUnits): this;
    setX(v: string | number): this;
    setY(v: string | number): this;
    setWidth(v: string | number): this;
    setHeight(v: string | number): this;
}
export declare function Mask(...children: View[]): MaskTag;
export declare class FilterTag extends Tag {
    x?: string;
    y?: string;
    width?: string;
    height?: string;
    filterUnits?: GradientUnits;
    primitiveUnits?: GradientUnits;
    setX(v: string | number): this;
    setY(v: string | number): this;
    setWidth(v: string | number): this;
    setHeight(v: string | number): this;
    setFilterUnits(v: GradientUnits): this;
    setPrimitiveUnits(v: GradientUnits): this;
}
export declare function Filter(...children: View[]): FilterTag;
export declare class FeGaussianBlurTag extends Tag {
    in?: string;
    stdDeviation?: string;
    result?: string;
    edgeMode?: 'duplicate' | 'wrap' | 'none';
    setIn(v: string): this;
    setStdDeviation(v: string | number): this;
    setResult(v: string): this;
    setEdgeMode(v: 'duplicate' | 'wrap' | 'none'): this;
}
export declare function FeGaussianBlur(...children: View[]): FeGaussianBlurTag;
export {};
//# sourceMappingURL=svg.d.ts.map