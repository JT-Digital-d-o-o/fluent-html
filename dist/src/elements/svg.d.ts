import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
export declare class SvgShapeTag extends Tag {
    protected _fillValue?: string;
    protected _strokeValue?: string;
    protected '_stroke-width'?: string;
    protected '_stroke-linecap'?: 'butt' | 'round' | 'square';
    protected '_stroke-linejoin'?: 'miter' | 'round' | 'bevel';
    protected '_stroke-dasharray'?: string;
    protected '_stroke-dashoffset'?: string;
    protected '_stroke-opacity'?: string;
    protected _transformValue?: string;
    protected _svgOpacity?: string;
    protected _filter?: string;
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
    protected _cx?: string;
    protected _cy?: string;
    protected _r?: string;
    setCx(cx: string): this;
    setCy(cy: string): this;
    setR(r: string): this;
}
export declare function Circle(...children: View[]): CircleTag;
export declare class RectTag extends SvgShapeTag {
    protected _x?: string;
    protected _y?: string;
    protected _width?: string;
    protected _height?: string;
    protected _rx?: string;
    protected _ry?: string;
    setX(x: string): this;
    setY(y: string): this;
    setWidth(width: string | number): this;
    setHeight(height: string | number): this;
    setRx(rx: string): this;
    setRy(ry: string): this;
}
export declare function Rect(...children: View[]): RectTag;
export declare class LineTag extends SvgShapeTag {
    protected _x1?: string;
    protected _y1?: string;
    protected _x2?: string;
    protected _y2?: string;
    setX1(x1: string): this;
    setY1(y1: string): this;
    setX2(x2: string): this;
    setY2(y2: string): this;
}
export declare function Line(...children: View[]): LineTag;
export declare class PathTag extends SvgShapeTag {
    protected _d?: string;
    protected '_fill-rule'?: 'nonzero' | 'evenodd';
    protected '_clip-rule'?: 'nonzero' | 'evenodd';
    setD(d: string): this;
    setFillRule(rule: 'nonzero' | 'evenodd'): this;
    setClipRule(rule: 'nonzero' | 'evenodd'): this;
}
export declare function Path(...children: View[]): PathTag;
export declare class EllipseTag extends SvgShapeTag {
    protected _cx?: string;
    protected _cy?: string;
    protected _rx?: string;
    protected _ry?: string;
    setCx(cx: string): this;
    setCy(cy: string): this;
    setRx(rx: string): this;
    setRy(ry: string): this;
}
export declare function Ellipse(...children: View[]): EllipseTag;
export declare class PolygonTag extends SvgShapeTag {
    protected _points?: string;
    setPoints(points: string | [number, number][]): this;
}
export declare function Polygon(...children: View[]): PolygonTag;
export declare class PolylineTag extends SvgShapeTag {
    protected _points?: string;
    setPoints(points: string | [number, number][]): this;
}
export declare function Polyline(...children: View[]): PolylineTag;
export declare class SvgTextTag extends SvgShapeTag {
    protected _x?: string;
    protected _y?: string;
    protected _dx?: string;
    protected _dy?: string;
    protected '_text-anchor'?: 'start' | 'middle' | 'end';
    protected '_dominant-baseline'?: string;
    protected '_font-size'?: string;
    protected '_font-family'?: string;
    protected '_font-weight'?: string;
    protected '_font-style'?: 'normal' | 'italic' | 'oblique';
    protected '_text-decoration'?: 'none' | 'underline' | 'overline' | 'line-through';
    protected '_letter-spacing'?: string;
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
    protected _x?: string;
    protected _y?: string;
    protected _dx?: string;
    protected _dy?: string;
    protected '_font-weight'?: string;
    protected '_font-style'?: 'normal' | 'italic' | 'oblique';
    protected '_text-decoration'?: 'none' | 'underline' | 'overline' | 'line-through';
    protected '_letter-spacing'?: string;
    protected '_font-size'?: string;
    protected '_font-family'?: string;
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
    protected _href?: string;
    protected _x?: string;
    protected _y?: string;
    protected _width?: string;
    protected _height?: string;
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
    protected _x1?: string;
    protected _y1?: string;
    protected _x2?: string;
    protected _y2?: string;
    protected _gradientUnits?: GradientUnits;
    protected _gradientTransform?: string;
    protected _spreadMethod?: SpreadMethod;
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
    protected _cx?: string;
    protected _cy?: string;
    protected _r?: string;
    protected _fx?: string;
    protected _fy?: string;
    protected _gradientUnits?: GradientUnits;
    protected _gradientTransform?: string;
    protected _spreadMethod?: SpreadMethod;
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
    protected _offset?: string;
    protected '_stop-color'?: string;
    protected '_stop-opacity'?: string;
    setOffset(v: string | number): this;
    setStopColor(v: string): this;
    setStopOpacity(v: string | number): this;
}
export declare function Stop(...children: View[]): StopTag;
export declare class ClipPathTag extends Tag {
    protected _clipPathUnits?: GradientUnits;
    setClipPathUnits(v: GradientUnits): this;
}
export declare function ClipPath(...children: View[]): ClipPathTag;
export declare class MaskTag extends Tag {
    protected _maskUnits?: GradientUnits;
    protected _maskContentUnits?: GradientUnits;
    protected _x?: string;
    protected _y?: string;
    protected _width?: string;
    protected _height?: string;
    setMaskUnits(v: GradientUnits): this;
    setMaskContentUnits(v: GradientUnits): this;
    setX(v: string | number): this;
    setY(v: string | number): this;
    setWidth(v: string | number): this;
    setHeight(v: string | number): this;
}
export declare function Mask(...children: View[]): MaskTag;
export declare class FilterTag extends Tag {
    protected _x?: string;
    protected _y?: string;
    protected _width?: string;
    protected _height?: string;
    protected _filterUnits?: GradientUnits;
    protected _primitiveUnits?: GradientUnits;
    setX(v: string | number): this;
    setY(v: string | number): this;
    setWidth(v: string | number): this;
    setHeight(v: string | number): this;
    setFilterUnits(v: GradientUnits): this;
    setPrimitiveUnits(v: GradientUnits): this;
}
export declare function Filter(...children: View[]): FilterTag;
export declare class FeGaussianBlurTag extends Tag {
    protected _in?: string;
    protected _stdDeviation?: string;
    protected _result?: string;
    protected _edgeMode?: 'duplicate' | 'wrap' | 'none';
    setIn(v: string): this;
    setStdDeviation(v: string | number): this;
    setResult(v: string): this;
    setEdgeMode(v: 'duplicate' | 'wrap' | 'none'): this;
}
export declare function FeGaussianBlur(...children: View[]): FeGaussianBlurTag;
export {};
//# sourceMappingURL=svg.d.ts.map