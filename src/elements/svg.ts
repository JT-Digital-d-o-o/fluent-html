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
  transform?: string;

  setFill(fill: string): this {
    this.fill = fill;
    return this;
  }

  setStroke(stroke: string): this {
    this.stroke = stroke;
    return this;
  }

  setStrokeWidth(width: string): this {
    this['stroke-width'] = width;
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

  setSvgOpacity(opacity: string): this {
    return this.addAttribute('opacity', opacity);
  }

  setTransform(transform: string): this {
    this.transform = transform;
    return this;
  }
}

/** @internal */
const SHAPE_SK = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'transform'] as const;

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

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
(CircleTag.prototype as any)._sk = ['cx', 'cy', 'r', ...SHAPE_SK];

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

  setWidth(width: string): this {
    this.width = width;
    return this;
  }

  setHeight(height: string): this {
    this.height = height;
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

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
(RectTag.prototype as any)._sk = ['x', 'y', 'width', 'height', 'rx', 'ry', ...SHAPE_SK];

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

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
(LineTag.prototype as any)._sk = ['x1', 'y1', 'x2', 'y2', ...SHAPE_SK];

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

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
(PathTag.prototype as any)._sk = ['d', 'fill-rule', 'clip-rule', ...SHAPE_SK];

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

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
(EllipseTag.prototype as any)._sk = ['cx', 'cy', 'rx', 'ry', ...SHAPE_SK];

export function Ellipse(...children: View[]): EllipseTag {
  return new EllipseTag("ellipse", ...children);
}

// ─── Polygon ────────────────────────────────────────────────────────

export class PolygonTag extends SvgShapeTag {
  points?: string;

  setPoints(points: string): this {
    this.points = points;
    return this;
  }
}

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
(PolygonTag.prototype as any)._sk = ['points', ...SHAPE_SK];

export function Polygon(...children: View[]): PolygonTag {
  return new PolygonTag("polygon", ...children);
}

// ─── Polyline ───────────────────────────────────────────────────────

export class PolylineTag extends SvgShapeTag {
  points?: string;

  setPoints(points: string): this {
    this.points = points;
    return this;
  }
}

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
(PolylineTag.prototype as any)._sk = ['points', ...SHAPE_SK];

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
}

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
(SvgTextTag.prototype as any)._sk = ['x', 'y', 'dx', 'dy', 'text-anchor', 'dominant-baseline', 'font-size', 'font-family', ...SHAPE_SK];

export function Text(...children: View[]): SvgTextTag {
  return new SvgTextTag("text", ...children);
}

// ─── Tspan ──────────────────────────────────────────────────────────

export class TspanTag extends SvgShapeTag {
  x?: string;
  y?: string;
  dx?: string;
  dy?: string;

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
}

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
(TspanTag.prototype as any)._sk = ['x', 'y', 'dx', 'dy', ...SHAPE_SK];

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

  setWidth(width: string): this {
    this.width = width;
    return this;
  }

  setHeight(height: string): this {
    this.height = height;
    return this;
  }
}

/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
(UseTag.prototype as any)._sk = ['href', 'x', 'y', 'width', 'height'];

export function Use(...children: View[]): UseTag {
  return new UseTag("use", ...children);
}

// ─── Container elements (no extra attributes) ──────────────────────

export function G(...children: View[]): Tag {
  return El("g", ...children);
}

export function Defs(...children: View[]): Tag {
  return El("defs", ...children);
}
