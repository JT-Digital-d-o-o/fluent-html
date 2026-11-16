import { defineSchemaKeys } from "../core/proto.js";
import { devChecks, assertMutable } from "../core/dev-checks.js";
import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
import type { View } from "../core/types.js";

// ─── Shared SVG presentation attributes ────────────────────────────

export class SvgShapeTag extends Tag {
  // Storage is `fillValue`/`strokeValue`/`transformValue` (aliased to the `fill`/
  // `stroke`/`transform` presentation attributes in the schema) so the fields don't
  // shadow the Tag `.fill()`/`.stroke()`/`.transform()` styling methods (canonical-names).
  protected _fillValue?: string;
  protected _strokeValue?: string;
  protected '_stroke-width'?: string;
  protected '_stroke-linecap'?: 'butt' | 'round' | 'square';
  protected '_stroke-linejoin'?: 'miter' | 'round' | 'bevel';
  protected '_stroke-dasharray'?: string;
  protected '_stroke-dashoffset'?: string;
  protected '_stroke-opacity'?: string;
  protected _transformValue?: string;
  // Named `svgOpacity` (not `opacity`) to avoid clashing with the Tailwind `.opacity()`
  // method; the `_sk` tuple emits it as the `opacity` presentation attribute.
  protected _svgOpacity?: string;
  protected _filter?: string;

  setFill(fill: string): this {
    if (devChecks) assertMutable(this, "setFill");
    this._fillValue = fill;
    return this;
  }

  setStroke(stroke: string): this {
    if (devChecks) assertMutable(this, "setStroke");
    this._strokeValue = stroke;
    return this;
  }

  setStrokeWidth(width: string | number): this {
    if (devChecks) assertMutable(this, "setStrokeWidth");
    this['_stroke-width'] = String(width);
    return this;
  }

  setStrokeLinecap(linecap: 'butt' | 'round' | 'square'): this {
    if (devChecks) assertMutable(this, "setStrokeLinecap");
    this['_stroke-linecap'] = linecap;
    return this;
  }

  setStrokeLinejoin(linejoin: 'miter' | 'round' | 'bevel'): this {
    if (devChecks) assertMutable(this, "setStrokeLinejoin");
    this['_stroke-linejoin'] = linejoin;
    return this;
  }

  setStrokeDasharray(dasharray: string): this {
    if (devChecks) assertMutable(this, "setStrokeDasharray");
    this['_stroke-dasharray'] = dasharray;
    return this;
  }

  setStrokeDashoffset(offset: string | number): this {
    if (devChecks) assertMutable(this, "setStrokeDashoffset");
    this['_stroke-dashoffset'] = String(offset);
    return this;
  }

  setStrokeOpacity(opacity: string | number): this {
    if (devChecks) assertMutable(this, "setStrokeOpacity");
    this['_stroke-opacity'] = String(opacity);
    return this;
  }

  setOpacity(opacity: string): this {
    if (devChecks) assertMutable(this, "setOpacity");
    this._svgOpacity = opacity;
    return this;
  }

  setTransform(transform: string): this {
    if (devChecks) assertMutable(this, "setTransform");
    this._transformValue = transform;
    return this;
  }

  setFilter(filter: string): this {
    if (devChecks) assertMutable(this, "setFilter");
    this._filter = filter;
    return this;
  }
}

/** @internal */
const SHAPE_SK = [['fillValue', 'fill'], ['strokeValue', 'stroke'], 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-opacity', ['transformValue', 'transform'], ['svgOpacity', 'opacity'], 'filter'] as const;

defineSchemaKeys(SvgShapeTag, [...SHAPE_SK]);

// ─── Circle ─────────────────────────────────────────────────────────

export class CircleTag extends SvgShapeTag {
  protected _cx?: string;
  protected _cy?: string;
  protected _r?: string;

  setCx(cx: string): this {
    if (devChecks) assertMutable(this, "setCx");
    this._cx = cx;
    return this;
  }

  setCy(cy: string): this {
    if (devChecks) assertMutable(this, "setCy");
    this._cy = cy;
    return this;
  }

  setR(r: string): this {
    if (devChecks) assertMutable(this, "setR");
    this._r = r;
    return this;
  }
}

defineSchemaKeys(CircleTag, ['cx', 'cy', 'r', ...SHAPE_SK]);

export function Circle(...children: View[]): CircleTag {
  return new CircleTag("circle", ...children);
}

// ─── Rect ───────────────────────────────────────────────────────────

export class RectTag extends SvgShapeTag {
  protected _x?: string;
  protected _y?: string;
  protected _width?: string;
  protected _height?: string;
  protected _rx?: string;
  protected _ry?: string;

  setX(x: string): this {
    if (devChecks) assertMutable(this, "setX");
    this._x = x;
    return this;
  }

  setY(y: string): this {
    if (devChecks) assertMutable(this, "setY");
    this._y = y;
    return this;
  }

  setWidth(width: string | number): this {
    if (devChecks) assertMutable(this, "setWidth");
    this._width = String(width);
    return this;
  }

  setHeight(height: string | number): this {
    if (devChecks) assertMutable(this, "setHeight");
    this._height = String(height);
    return this;
  }

  setRx(rx: string): this {
    if (devChecks) assertMutable(this, "setRx");
    this._rx = rx;
    return this;
  }

  setRy(ry: string): this {
    if (devChecks) assertMutable(this, "setRy");
    this._ry = ry;
    return this;
  }
}

defineSchemaKeys(RectTag, ['x', 'y', 'width', 'height', 'rx', 'ry', ...SHAPE_SK]);

export function Rect(...children: View[]): RectTag {
  return new RectTag("rect", ...children);
}

// ─── Line ───────────────────────────────────────────────────────────

export class LineTag extends SvgShapeTag {
  protected _x1?: string;
  protected _y1?: string;
  protected _x2?: string;
  protected _y2?: string;

  setX1(x1: string): this {
    if (devChecks) assertMutable(this, "setX1");
    this._x1 = x1;
    return this;
  }

  setY1(y1: string): this {
    if (devChecks) assertMutable(this, "setY1");
    this._y1 = y1;
    return this;
  }

  setX2(x2: string): this {
    if (devChecks) assertMutable(this, "setX2");
    this._x2 = x2;
    return this;
  }

  setY2(y2: string): this {
    if (devChecks) assertMutable(this, "setY2");
    this._y2 = y2;
    return this;
  }
}

defineSchemaKeys(LineTag, ['x1', 'y1', 'x2', 'y2', ...SHAPE_SK]);

export function Line(...children: View[]): LineTag {
  return new LineTag("line", ...children);
}

// ─── Path ───────────────────────────────────────────────────────────

export class PathTag extends SvgShapeTag {
  protected _d?: string;
  protected '_fill-rule'?: 'nonzero' | 'evenodd';
  protected '_clip-rule'?: 'nonzero' | 'evenodd';

  setD(d: string): this {
    if (devChecks) assertMutable(this, "setD");
    this._d = d;
    return this;
  }

  setFillRule(rule: 'nonzero' | 'evenodd'): this {
    if (devChecks) assertMutable(this, "setFillRule");
    this['_fill-rule'] = rule;
    return this;
  }

  setClipRule(rule: 'nonzero' | 'evenodd'): this {
    if (devChecks) assertMutable(this, "setClipRule");
    this['_clip-rule'] = rule;
    return this;
  }
}

defineSchemaKeys(PathTag, ['d', 'fill-rule', 'clip-rule', ...SHAPE_SK]);

export function Path(...children: View[]): PathTag {
  return new PathTag("path", ...children);
}

// ─── Ellipse ────────────────────────────────────────────────────────

export class EllipseTag extends SvgShapeTag {
  protected _cx?: string;
  protected _cy?: string;
  protected _rx?: string;
  protected _ry?: string;

  setCx(cx: string): this {
    if (devChecks) assertMutable(this, "setCx");
    this._cx = cx;
    return this;
  }

  setCy(cy: string): this {
    if (devChecks) assertMutable(this, "setCy");
    this._cy = cy;
    return this;
  }

  setRx(rx: string): this {
    if (devChecks) assertMutable(this, "setRx");
    this._rx = rx;
    return this;
  }

  setRy(ry: string): this {
    if (devChecks) assertMutable(this, "setRy");
    this._ry = ry;
    return this;
  }
}

defineSchemaKeys(EllipseTag, ['cx', 'cy', 'rx', 'ry', ...SHAPE_SK]);

export function Ellipse(...children: View[]): EllipseTag {
  return new EllipseTag("ellipse", ...children);
}

// ─── Polygon ────────────────────────────────────────────────────────

export class PolygonTag extends SvgShapeTag {
  protected _points?: string;

  setPoints(points: string | [number, number][]): this {
    if (devChecks) assertMutable(this, "setPoints");
    this._points = Array.isArray(points)
      ? points.map(([x, y]) => `${x},${y}`).join(' ')
      : points;
    return this;
  }
}

defineSchemaKeys(PolygonTag, ['points', ...SHAPE_SK]);

export function Polygon(...children: View[]): PolygonTag {
  return new PolygonTag("polygon", ...children);
}

// ─── Polyline ───────────────────────────────────────────────────────

export class PolylineTag extends SvgShapeTag {
  protected _points?: string;

  setPoints(points: string | [number, number][]): this {
    if (devChecks) assertMutable(this, "setPoints");
    this._points = Array.isArray(points)
      ? points.map(([x, y]) => `${x},${y}`).join(' ')
      : points;
    return this;
  }
}

defineSchemaKeys(PolylineTag, ['points', ...SHAPE_SK]);

export function Polyline(...children: View[]): PolylineTag {
  return new PolylineTag("polyline", ...children);
}

// ─── Text ───────────────────────────────────────────────────────────

export class SvgTextTag extends SvgShapeTag {
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

  setX(x: string): this {
    if (devChecks) assertMutable(this, "setX");
    this._x = x;
    return this;
  }

  setY(y: string): this {
    if (devChecks) assertMutable(this, "setY");
    this._y = y;
    return this;
  }

  setDx(dx: string): this {
    if (devChecks) assertMutable(this, "setDx");
    this._dx = dx;
    return this;
  }

  setDy(dy: string): this {
    if (devChecks) assertMutable(this, "setDy");
    this._dy = dy;
    return this;
  }

  setTextAnchor(anchor: 'start' | 'middle' | 'end'): this {
    if (devChecks) assertMutable(this, "setTextAnchor");
    this['_text-anchor'] = anchor;
    return this;
  }

  setDominantBaseline(baseline: string): this {
    if (devChecks) assertMutable(this, "setDominantBaseline");
    this['_dominant-baseline'] = baseline;
    return this;
  }

  setFontSize(size: string): this {
    if (devChecks) assertMutable(this, "setFontSize");
    this['_font-size'] = size;
    return this;
  }

  setFontFamily(family: string): this {
    if (devChecks) assertMutable(this, "setFontFamily");
    this['_font-family'] = family;
    return this;
  }

  setFontWeight(weight: number | 'normal' | 'bold' | 'bolder' | 'lighter'): this {
    if (devChecks) assertMutable(this, "setFontWeight");
    this['_font-weight'] = `${weight}`;
    return this;
  }

  setFontStyle(style: 'normal' | 'italic' | 'oblique'): this {
    if (devChecks) assertMutable(this, "setFontStyle");
    this['_font-style'] = style;
    return this;
  }

  setTextDecoration(decoration: 'none' | 'underline' | 'overline' | 'line-through'): this {
    if (devChecks) assertMutable(this, "setTextDecoration");
    this['_text-decoration'] = decoration;
    return this;
  }

  setLetterSpacing(spacing: string): this {
    if (devChecks) assertMutable(this, "setLetterSpacing");
    this['_letter-spacing'] = spacing;
    return this;
  }
}

defineSchemaKeys(SvgTextTag, ['x', 'y', 'dx', 'dy', 'text-anchor', 'dominant-baseline', 'font-size', 'font-family', 'font-weight', 'font-style', 'text-decoration', 'letter-spacing', ...SHAPE_SK]);

export function Text(...children: View[]): SvgTextTag {
  return new SvgTextTag("text", ...children);
}

// ─── Tspan ──────────────────────────────────────────────────────────

export class TspanTag extends SvgShapeTag {
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

  setX(x: string): this {
    if (devChecks) assertMutable(this, "setX");
    this._x = x;
    return this;
  }

  setY(y: string): this {
    if (devChecks) assertMutable(this, "setY");
    this._y = y;
    return this;
  }

  setDx(dx: string): this {
    if (devChecks) assertMutable(this, "setDx");
    this._dx = dx;
    return this;
  }

  setDy(dy: string): this {
    if (devChecks) assertMutable(this, "setDy");
    this._dy = dy;
    return this;
  }

  setFontSize(size: string): this {
    if (devChecks) assertMutable(this, "setFontSize");
    this['_font-size'] = size;
    return this;
  }

  setFontFamily(family: string): this {
    if (devChecks) assertMutable(this, "setFontFamily");
    this['_font-family'] = family;
    return this;
  }

  setFontWeight(weight: number | 'normal' | 'bold' | 'bolder' | 'lighter'): this {
    if (devChecks) assertMutable(this, "setFontWeight");
    this['_font-weight'] = `${weight}`;
    return this;
  }

  setFontStyle(style: 'normal' | 'italic' | 'oblique'): this {
    if (devChecks) assertMutable(this, "setFontStyle");
    this['_font-style'] = style;
    return this;
  }

  setTextDecoration(decoration: 'none' | 'underline' | 'overline' | 'line-through'): this {
    if (devChecks) assertMutable(this, "setTextDecoration");
    this['_text-decoration'] = decoration;
    return this;
  }

  setLetterSpacing(spacing: string): this {
    if (devChecks) assertMutable(this, "setLetterSpacing");
    this['_letter-spacing'] = spacing;
    return this;
  }
}

defineSchemaKeys(TspanTag, ['x', 'y', 'dx', 'dy', 'font-weight', 'font-style', 'text-decoration', 'letter-spacing', 'font-size', 'font-family', ...SHAPE_SK]);

export function Tspan(...children: View[]): TspanTag {
  return new TspanTag("tspan", ...children);
}

// ─── Use ────────────────────────────────────────────────────────────

export class UseTag extends Tag {
  protected _href?: string;
  protected _x?: string;
  protected _y?: string;
  protected _width?: string;
  protected _height?: string;

  setHref(href: string): this {
    if (devChecks) assertMutable(this, "setHref");
    this._href = href;
    return this;
  }

  setX(x: string): this {
    if (devChecks) assertMutable(this, "setX");
    this._x = x;
    return this;
  }

  setY(y: string): this {
    if (devChecks) assertMutable(this, "setY");
    this._y = y;
    return this;
  }

  setWidth(width: string | number): this {
    if (devChecks) assertMutable(this, "setWidth");
    this._width = String(width);
    return this;
  }

  setHeight(height: string | number): this {
    if (devChecks) assertMutable(this, "setHeight");
    this._height = String(height);
    return this;
  }
}

defineSchemaKeys(UseTag, ['href', 'x', 'y', 'width', 'height']);

export function Use(...children: View[]): UseTag {
  return new UseTag("use", ...children);
}

// ─── Container elements (no extra attributes) ──────────────────────

export function G(...children: View[]): SvgShapeTag {
  return new SvgShapeTag("g", ...children);
}

export function Defs(...children: View[]): Tag {
  return El("defs", ...children);
}

// ─── Gradients & paint servers ─────────────────────────────────────

type GradientUnits = 'userSpaceOnUse' | 'objectBoundingBox';
type SpreadMethod = 'pad' | 'reflect' | 'repeat';

export class LinearGradientTag extends Tag {
  protected _x1?: string; protected _y1?: string; protected _x2?: string; protected _y2?: string;
  protected _gradientUnits?: GradientUnits;
  protected _gradientTransform?: string;
  protected _spreadMethod?: SpreadMethod;

  setX1(v: string | number): this {
    if (devChecks) assertMutable(this, "setX1"); this._x1 = String(v); return this; }
  setY1(v: string | number): this {
    if (devChecks) assertMutable(this, "setY1"); this._y1 = String(v); return this; }
  setX2(v: string | number): this {
    if (devChecks) assertMutable(this, "setX2"); this._x2 = String(v); return this; }
  setY2(v: string | number): this {
    if (devChecks) assertMutable(this, "setY2"); this._y2 = String(v); return this; }
  setGradientUnits(v: GradientUnits): this {
    if (devChecks) assertMutable(this, "setGradientUnits"); this._gradientUnits = v; return this; }
  setGradientTransform(v: string): this {
    if (devChecks) assertMutable(this, "setGradientTransform"); this._gradientTransform = v; return this; }
  setSpreadMethod(v: SpreadMethod): this {
    if (devChecks) assertMutable(this, "setSpreadMethod"); this._spreadMethod = v; return this; }
}
defineSchemaKeys(LinearGradientTag, ['x1', 'y1', 'x2', 'y2', 'gradientUnits', 'gradientTransform', 'spreadMethod']);

export function LinearGradient(...children: View[]): LinearGradientTag {
  return new LinearGradientTag("linearGradient", ...children);
}

export class RadialGradientTag extends Tag {
  protected _cx?: string; protected _cy?: string; protected _r?: string; protected _fx?: string; protected _fy?: string;
  protected _gradientUnits?: GradientUnits;
  protected _gradientTransform?: string;
  protected _spreadMethod?: SpreadMethod;

  setCx(v: string | number): this {
    if (devChecks) assertMutable(this, "setCx"); this._cx = String(v); return this; }
  setCy(v: string | number): this {
    if (devChecks) assertMutable(this, "setCy"); this._cy = String(v); return this; }
  setR(v: string | number): this {
    if (devChecks) assertMutable(this, "setR"); this._r = String(v); return this; }
  setFx(v: string | number): this {
    if (devChecks) assertMutable(this, "setFx"); this._fx = String(v); return this; }
  setFy(v: string | number): this {
    if (devChecks) assertMutable(this, "setFy"); this._fy = String(v); return this; }
  setGradientUnits(v: GradientUnits): this {
    if (devChecks) assertMutable(this, "setGradientUnits"); this._gradientUnits = v; return this; }
  setGradientTransform(v: string): this {
    if (devChecks) assertMutable(this, "setGradientTransform"); this._gradientTransform = v; return this; }
  setSpreadMethod(v: SpreadMethod): this {
    if (devChecks) assertMutable(this, "setSpreadMethod"); this._spreadMethod = v; return this; }
}
defineSchemaKeys(RadialGradientTag, ['cx', 'cy', 'r', 'fx', 'fy', 'gradientUnits', 'gradientTransform', 'spreadMethod']);

export function RadialGradient(...children: View[]): RadialGradientTag {
  return new RadialGradientTag("radialGradient", ...children);
}

export class StopTag extends Tag {
  protected _offset?: string;
  protected '_stop-color'?: string;
  protected '_stop-opacity'?: string;

  setOffset(v: string | number): this {
    if (devChecks) assertMutable(this, "setOffset"); this._offset = String(v); return this; }
  setStopColor(v: string): this {
    if (devChecks) assertMutable(this, "setStopColor"); this['_stop-color'] = v; return this; }
  setStopOpacity(v: string | number): this {
    if (devChecks) assertMutable(this, "setStopOpacity"); this['_stop-opacity'] = String(v); return this; }
}
defineSchemaKeys(StopTag, ['offset', 'stop-color', 'stop-opacity']);

export function Stop(...children: View[]): StopTag {
  return new StopTag("stop", ...children);
}

// ─── Clipping, masking, filters ────────────────────────────────────

export class ClipPathTag extends Tag {
  protected _clipPathUnits?: GradientUnits;
  setClipPathUnits(v: GradientUnits): this {
    if (devChecks) assertMutable(this, "setClipPathUnits"); this._clipPathUnits = v; return this; }
}
defineSchemaKeys(ClipPathTag, ['clipPathUnits']);

export function ClipPath(...children: View[]): ClipPathTag {
  return new ClipPathTag("clipPath", ...children);
}

export class MaskTag extends Tag {
  protected _maskUnits?: GradientUnits;
  protected _maskContentUnits?: GradientUnits;
  protected _x?: string; protected _y?: string; protected _width?: string; protected _height?: string;

  setMaskUnits(v: GradientUnits): this {
    if (devChecks) assertMutable(this, "setMaskUnits"); this._maskUnits = v; return this; }
  setMaskContentUnits(v: GradientUnits): this {
    if (devChecks) assertMutable(this, "setMaskContentUnits"); this._maskContentUnits = v; return this; }
  setX(v: string | number): this {
    if (devChecks) assertMutable(this, "setX"); this._x = String(v); return this; }
  setY(v: string | number): this {
    if (devChecks) assertMutable(this, "setY"); this._y = String(v); return this; }
  setWidth(v: string | number): this {
    if (devChecks) assertMutable(this, "setWidth"); this._width = String(v); return this; }
  setHeight(v: string | number): this {
    if (devChecks) assertMutable(this, "setHeight"); this._height = String(v); return this; }
}
defineSchemaKeys(MaskTag, ['maskUnits', 'maskContentUnits', 'x', 'y', 'width', 'height']);

export function Mask(...children: View[]): MaskTag {
  return new MaskTag("mask", ...children);
}

export class FilterTag extends Tag {
  protected _x?: string; protected _y?: string; protected _width?: string; protected _height?: string;
  protected _filterUnits?: GradientUnits;
  protected _primitiveUnits?: GradientUnits;

  setX(v: string | number): this {
    if (devChecks) assertMutable(this, "setX"); this._x = String(v); return this; }
  setY(v: string | number): this {
    if (devChecks) assertMutable(this, "setY"); this._y = String(v); return this; }
  setWidth(v: string | number): this {
    if (devChecks) assertMutable(this, "setWidth"); this._width = String(v); return this; }
  setHeight(v: string | number): this {
    if (devChecks) assertMutable(this, "setHeight"); this._height = String(v); return this; }
  setFilterUnits(v: GradientUnits): this {
    if (devChecks) assertMutable(this, "setFilterUnits"); this._filterUnits = v; return this; }
  setPrimitiveUnits(v: GradientUnits): this {
    if (devChecks) assertMutable(this, "setPrimitiveUnits"); this._primitiveUnits = v; return this; }
}
defineSchemaKeys(FilterTag, ['x', 'y', 'width', 'height', 'filterUnits', 'primitiveUnits']);

export function Filter(...children: View[]): FilterTag {
  return new FilterTag("filter", ...children);
}

export class FeGaussianBlurTag extends Tag {
  protected _in?: string;
  protected _stdDeviation?: string;
  protected _result?: string;
  protected _edgeMode?: 'duplicate' | 'wrap' | 'none';

  setIn(v: string): this {
    if (devChecks) assertMutable(this, "setIn"); this._in = v; return this; }
  setStdDeviation(v: string | number): this {
    if (devChecks) assertMutable(this, "setStdDeviation"); this._stdDeviation = String(v); return this; }
  setResult(v: string): this {
    if (devChecks) assertMutable(this, "setResult"); this._result = v; return this; }
  setEdgeMode(v: 'duplicate' | 'wrap' | 'none'): this {
    if (devChecks) assertMutable(this, "setEdgeMode"); this._edgeMode = v; return this; }
}
defineSchemaKeys(FeGaussianBlurTag, ['in', 'stdDeviation', 'result', 'edgeMode']);

export function FeGaussianBlur(...children: View[]): FeGaussianBlurTag {
  return new FeGaussianBlurTag("feGaussianBlur", ...children);
}
