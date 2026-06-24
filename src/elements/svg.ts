import { defineSchemaKeys } from "../core/proto.js";
import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
import type { View } from "../core/types.js";

// ─── Shared SVG presentation attributes ────────────────────────────

export class SvgShapeTag extends Tag {
  fill?: string;
  stroke?: string;
  'stroke-width'?: string;
  'stroke-linecap'?: 'butt' | 'round' | 'square';
  'stroke-linejoin'?: 'miter' | 'round' | 'bevel';
  'stroke-dasharray'?: string;
  'stroke-dashoffset'?: string;
  'stroke-opacity'?: string;
  transform?: string;
  // Named `svgOpacity` (not `opacity`) to avoid clashing with the Tailwind `.opacity()`
  // method; the `_sk` tuple emits it as the `opacity` presentation attribute.
  svgOpacity?: string;
  filter?: string;

  setFill(fill: string): this {
    this.fill = fill;
    return this;
  }

  setStroke(stroke: string): this {
    this.stroke = stroke;
    return this;
  }

  setStrokeWidth(width: string | number): this {
    this['stroke-width'] = String(width);
    return this;
  }

  setStrokeLinecap(linecap: 'butt' | 'round' | 'square'): this {
    this['stroke-linecap'] = linecap;
    return this;
  }

  setStrokeLinejoin(linejoin: 'miter' | 'round' | 'bevel'): this {
    this['stroke-linejoin'] = linejoin;
    return this;
  }

  setStrokeDasharray(dasharray: string): this {
    this['stroke-dasharray'] = dasharray;
    return this;
  }

  setStrokeDashoffset(offset: string | number): this {
    this['stroke-dashoffset'] = String(offset);
    return this;
  }

  setStrokeOpacity(opacity: string | number): this {
    this['stroke-opacity'] = String(opacity);
    return this;
  }

  setOpacity(opacity: string): this {
    this.svgOpacity = opacity;
    return this;
  }

  setTransform(transform: string): this {
    this.transform = transform;
    return this;
  }

  setFilter(filter: string): this {
    this.filter = filter;
    return this;
  }
}

/** @internal */
const SHAPE_SK = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-opacity', 'transform', ['svgOpacity', 'opacity'], 'filter'] as const;

defineSchemaKeys(SvgShapeTag, [...SHAPE_SK]);

// ─── Circle ─────────────────────────────────────────────────────────

export class CircleTag extends SvgShapeTag {
  cx?: string;
  cy?: string;
  r?: string;

  setCx(cx: string): this {
    this.cx = cx;
    return this;
  }

  setCy(cy: string): this {
    this.cy = cy;
    return this;
  }

  setR(r: string): this {
    this.r = r;
    return this;
  }
}

defineSchemaKeys(CircleTag, ['cx', 'cy', 'r', ...SHAPE_SK]);

export function Circle(...children: View[]): CircleTag {
  return new CircleTag("circle", ...children);
}

// ─── Rect ───────────────────────────────────────────────────────────

export class RectTag extends SvgShapeTag {
  x?: string;
  y?: string;
  width?: string;
  height?: string;
  rx?: string;
  ry?: string;

  setX(x: string): this {
    this.x = x;
    return this;
  }

  setY(y: string): this {
    this.y = y;
    return this;
  }

  setWidth(width: string | number): this {
    this.width = String(width);
    return this;
  }

  setHeight(height: string | number): this {
    this.height = String(height);
    return this;
  }

  setRx(rx: string): this {
    this.rx = rx;
    return this;
  }

  setRy(ry: string): this {
    this.ry = ry;
    return this;
  }
}

defineSchemaKeys(RectTag, ['x', 'y', 'width', 'height', 'rx', 'ry', ...SHAPE_SK]);

export function Rect(...children: View[]): RectTag {
  return new RectTag("rect", ...children);
}

// ─── Line ───────────────────────────────────────────────────────────

export class LineTag extends SvgShapeTag {
  x1?: string;
  y1?: string;
  x2?: string;
  y2?: string;

  setX1(x1: string): this {
    this.x1 = x1;
    return this;
  }

  setY1(y1: string): this {
    this.y1 = y1;
    return this;
  }

  setX2(x2: string): this {
    this.x2 = x2;
    return this;
  }

  setY2(y2: string): this {
    this.y2 = y2;
    return this;
  }
}

defineSchemaKeys(LineTag, ['x1', 'y1', 'x2', 'y2', ...SHAPE_SK]);

export function Line(...children: View[]): LineTag {
  return new LineTag("line", ...children);
}

// ─── Path ───────────────────────────────────────────────────────────

export class PathTag extends SvgShapeTag {
  d?: string;
  'fill-rule'?: 'nonzero' | 'evenodd';
  'clip-rule'?: 'nonzero' | 'evenodd';

  setD(d: string): this {
    this.d = d;
    return this;
  }

  setFillRule(rule: 'nonzero' | 'evenodd'): this {
    this['fill-rule'] = rule;
    return this;
  }

  setClipRule(rule: 'nonzero' | 'evenodd'): this {
    this['clip-rule'] = rule;
    return this;
  }
}

defineSchemaKeys(PathTag, ['d', 'fill-rule', 'clip-rule', ...SHAPE_SK]);

export function Path(...children: View[]): PathTag {
  return new PathTag("path", ...children);
}

// ─── Ellipse ────────────────────────────────────────────────────────

export class EllipseTag extends SvgShapeTag {
  cx?: string;
  cy?: string;
  rx?: string;
  ry?: string;

  setCx(cx: string): this {
    this.cx = cx;
    return this;
  }

  setCy(cy: string): this {
    this.cy = cy;
    return this;
  }

  setRx(rx: string): this {
    this.rx = rx;
    return this;
  }

  setRy(ry: string): this {
    this.ry = ry;
    return this;
  }
}

defineSchemaKeys(EllipseTag, ['cx', 'cy', 'rx', 'ry', ...SHAPE_SK]);

export function Ellipse(...children: View[]): EllipseTag {
  return new EllipseTag("ellipse", ...children);
}

// ─── Polygon ────────────────────────────────────────────────────────

export class PolygonTag extends SvgShapeTag {
  points?: string;

  setPoints(points: string | [number, number][]): this {
    this.points = Array.isArray(points)
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
  points?: string;

  setPoints(points: string | [number, number][]): this {
    this.points = Array.isArray(points)
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

  setX(x: string): this {
    this.x = x;
    return this;
  }

  setY(y: string): this {
    this.y = y;
    return this;
  }

  setDx(dx: string): this {
    this.dx = dx;
    return this;
  }

  setDy(dy: string): this {
    this.dy = dy;
    return this;
  }

  setTextAnchor(anchor: 'start' | 'middle' | 'end'): this {
    this['text-anchor'] = anchor;
    return this;
  }

  setDominantBaseline(baseline: string): this {
    this['dominant-baseline'] = baseline;
    return this;
  }

  setFontSize(size: string): this {
    this['font-size'] = size;
    return this;
  }

  setFontFamily(family: string): this {
    this['font-family'] = family;
    return this;
  }

  setFontWeight(weight: number | 'normal' | 'bold' | 'bolder' | 'lighter'): this {
    this['font-weight'] = `${weight}`;
    return this;
  }

  setFontStyle(style: 'normal' | 'italic' | 'oblique'): this {
    this['font-style'] = style;
    return this;
  }

  setTextDecoration(decoration: 'none' | 'underline' | 'overline' | 'line-through'): this {
    this['text-decoration'] = decoration;
    return this;
  }

  setLetterSpacing(spacing: string): this {
    this['letter-spacing'] = spacing;
    return this;
  }
}

defineSchemaKeys(SvgTextTag, ['x', 'y', 'dx', 'dy', 'text-anchor', 'dominant-baseline', 'font-size', 'font-family', 'font-weight', 'font-style', 'text-decoration', 'letter-spacing', ...SHAPE_SK]);

export function Text(...children: View[]): SvgTextTag {
  return new SvgTextTag("text", ...children);
}

// ─── Tspan ──────────────────────────────────────────────────────────

export class TspanTag extends SvgShapeTag {
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

  setX(x: string): this {
    this.x = x;
    return this;
  }

  setY(y: string): this {
    this.y = y;
    return this;
  }

  setDx(dx: string): this {
    this.dx = dx;
    return this;
  }

  setDy(dy: string): this {
    this.dy = dy;
    return this;
  }

  setFontSize(size: string): this {
    this['font-size'] = size;
    return this;
  }

  setFontFamily(family: string): this {
    this['font-family'] = family;
    return this;
  }

  setFontWeight(weight: number | 'normal' | 'bold' | 'bolder' | 'lighter'): this {
    this['font-weight'] = `${weight}`;
    return this;
  }

  setFontStyle(style: 'normal' | 'italic' | 'oblique'): this {
    this['font-style'] = style;
    return this;
  }

  setTextDecoration(decoration: 'none' | 'underline' | 'overline' | 'line-through'): this {
    this['text-decoration'] = decoration;
    return this;
  }

  setLetterSpacing(spacing: string): this {
    this['letter-spacing'] = spacing;
    return this;
  }
}

defineSchemaKeys(TspanTag, ['x', 'y', 'dx', 'dy', 'font-weight', 'font-style', 'text-decoration', 'letter-spacing', 'font-size', 'font-family', ...SHAPE_SK]);

export function Tspan(...children: View[]): TspanTag {
  return new TspanTag("tspan", ...children);
}

// ─── Use ────────────────────────────────────────────────────────────

export class UseTag extends Tag {
  href?: string;
  x?: string;
  y?: string;
  width?: string;
  height?: string;

  setHref(href: string): this {
    this.href = href;
    return this;
  }

  setX(x: string): this {
    this.x = x;
    return this;
  }

  setY(y: string): this {
    this.y = y;
    return this;
  }

  setWidth(width: string | number): this {
    this.width = String(width);
    return this;
  }

  setHeight(height: string | number): this {
    this.height = String(height);
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
  x1?: string; y1?: string; x2?: string; y2?: string;
  gradientUnits?: GradientUnits;
  gradientTransform?: string;
  spreadMethod?: SpreadMethod;

  setX1(v: string | number): this { this.x1 = String(v); return this; }
  setY1(v: string | number): this { this.y1 = String(v); return this; }
  setX2(v: string | number): this { this.x2 = String(v); return this; }
  setY2(v: string | number): this { this.y2 = String(v); return this; }
  setGradientUnits(v: GradientUnits): this { this.gradientUnits = v; return this; }
  setGradientTransform(v: string): this { this.gradientTransform = v; return this; }
  setSpreadMethod(v: SpreadMethod): this { this.spreadMethod = v; return this; }
}
defineSchemaKeys(LinearGradientTag, ['x1', 'y1', 'x2', 'y2', 'gradientUnits', 'gradientTransform', 'spreadMethod']);

export function LinearGradient(...children: View[]): LinearGradientTag {
  return new LinearGradientTag("linearGradient", ...children);
}

export class RadialGradientTag extends Tag {
  cx?: string; cy?: string; r?: string; fx?: string; fy?: string;
  gradientUnits?: GradientUnits;
  gradientTransform?: string;
  spreadMethod?: SpreadMethod;

  setCx(v: string | number): this { this.cx = String(v); return this; }
  setCy(v: string | number): this { this.cy = String(v); return this; }
  setR(v: string | number): this { this.r = String(v); return this; }
  setFx(v: string | number): this { this.fx = String(v); return this; }
  setFy(v: string | number): this { this.fy = String(v); return this; }
  setGradientUnits(v: GradientUnits): this { this.gradientUnits = v; return this; }
  setGradientTransform(v: string): this { this.gradientTransform = v; return this; }
  setSpreadMethod(v: SpreadMethod): this { this.spreadMethod = v; return this; }
}
defineSchemaKeys(RadialGradientTag, ['cx', 'cy', 'r', 'fx', 'fy', 'gradientUnits', 'gradientTransform', 'spreadMethod']);

export function RadialGradient(...children: View[]): RadialGradientTag {
  return new RadialGradientTag("radialGradient", ...children);
}

export class StopTag extends Tag {
  offset?: string;
  'stop-color'?: string;
  'stop-opacity'?: string;

  setOffset(v: string | number): this { this.offset = String(v); return this; }
  setStopColor(v: string): this { this['stop-color'] = v; return this; }
  setStopOpacity(v: string | number): this { this['stop-opacity'] = String(v); return this; }
}
defineSchemaKeys(StopTag, ['offset', 'stop-color', 'stop-opacity']);

export function Stop(...children: View[]): StopTag {
  return new StopTag("stop", ...children);
}

// ─── Clipping, masking, filters ────────────────────────────────────

export class ClipPathTag extends Tag {
  clipPathUnits?: GradientUnits;
  setClipPathUnits(v: GradientUnits): this { this.clipPathUnits = v; return this; }
}
defineSchemaKeys(ClipPathTag, ['clipPathUnits']);

export function ClipPath(...children: View[]): ClipPathTag {
  return new ClipPathTag("clipPath", ...children);
}

export class MaskTag extends Tag {
  maskUnits?: GradientUnits;
  maskContentUnits?: GradientUnits;
  x?: string; y?: string; width?: string; height?: string;

  setMaskUnits(v: GradientUnits): this { this.maskUnits = v; return this; }
  setMaskContentUnits(v: GradientUnits): this { this.maskContentUnits = v; return this; }
  setX(v: string | number): this { this.x = String(v); return this; }
  setY(v: string | number): this { this.y = String(v); return this; }
  setWidth(v: string | number): this { this.width = String(v); return this; }
  setHeight(v: string | number): this { this.height = String(v); return this; }
}
defineSchemaKeys(MaskTag, ['maskUnits', 'maskContentUnits', 'x', 'y', 'width', 'height']);

export function Mask(...children: View[]): MaskTag {
  return new MaskTag("mask", ...children);
}

export class FilterTag extends Tag {
  x?: string; y?: string; width?: string; height?: string;
  filterUnits?: GradientUnits;
  primitiveUnits?: GradientUnits;

  setX(v: string | number): this { this.x = String(v); return this; }
  setY(v: string | number): this { this.y = String(v); return this; }
  setWidth(v: string | number): this { this.width = String(v); return this; }
  setHeight(v: string | number): this { this.height = String(v); return this; }
  setFilterUnits(v: GradientUnits): this { this.filterUnits = v; return this; }
  setPrimitiveUnits(v: GradientUnits): this { this.primitiveUnits = v; return this; }
}
defineSchemaKeys(FilterTag, ['x', 'y', 'width', 'height', 'filterUnits', 'primitiveUnits']);

export function Filter(...children: View[]): FilterTag {
  return new FilterTag("filter", ...children);
}

export class FeGaussianBlurTag extends Tag {
  in?: string;
  stdDeviation?: string;
  result?: string;
  edgeMode?: 'duplicate' | 'wrap' | 'none';

  setIn(v: string): this { this.in = v; return this; }
  setStdDeviation(v: string | number): this { this.stdDeviation = String(v); return this; }
  setResult(v: string): this { this.result = v; return this; }
  setEdgeMode(v: 'duplicate' | 'wrap' | 'none'): this { this.edgeMode = v; return this; }
}
defineSchemaKeys(FeGaussianBlurTag, ['in', 'stdDeviation', 'result', 'edgeMode']);

export function FeGaussianBlur(...children: View[]): FeGaussianBlurTag {
  return new FeGaussianBlurTag("feGaussianBlur", ...children);
}
