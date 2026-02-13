import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
import type { View } from "../core/types.js";

export function Table(...children: View[]): Tag {
  return El("table", ...children);
}

export function Thead(...children: View[]): Tag {
  return El("thead", ...children);
}

export function Tbody(...children: View[]): Tag {
  return El("tbody", ...children);
}

export function Tfoot(...children: View[]): Tag {
  return El("tfoot", ...children);
}

export function Tr(...children: View[]): Tag {
  return El("tr", ...children);
}

export class ThTag extends Tag {
  colspan?: number;
  rowspan?: number;
  scope?: 'row' | 'col' | 'rowgroup' | 'colgroup';

  setColspan(colspan: number): this {
    this.colspan = colspan;
    return this;
  }

  setRowspan(rowspan: number): this {
    this.rowspan = rowspan;
    return this;
  }

  setScope(scope: 'row' | 'col' | 'rowgroup' | 'colgroup'): this {
    this.scope = scope;
    return this;
  }
}

/** @internal */
(ThTag.prototype as any)._sk = ['colspan', 'rowspan', 'scope'];

export function Th(...children: View[]): ThTag {
  return new ThTag("th", ...children);
}

export class TdTag extends Tag {
  colspan?: number;
  rowspan?: number;

  setColspan(colspan: number): this {
    this.colspan = colspan;
    return this;
  }

  setRowspan(rowspan: number): this {
    this.rowspan = rowspan;
    return this;
  }
}

/** @internal */
(TdTag.prototype as any)._sk = ['colspan', 'rowspan'];

export function Td(...children: View[]): TdTag {
  return new TdTag("td", ...children);
}

export function Caption(...children: View[]): Tag {
  return El("caption", ...children);
}

export class ColgroupTag extends Tag {
  span?: number;

  setSpan(span: number): this {
    this.span = span;
    return this;
  }
}

/** @internal */
(ColgroupTag.prototype as any)._sk = ['span'];

export function Colgroup(...children: View[]): ColgroupTag {
  return new ColgroupTag("colgroup", ...children);
}

export class ColTag extends Tag {
  span?: number;

  setSpan(span: number): this {
    this.span = span;
    return this;
  }
}

/** @internal */
(ColTag.prototype as any)._sk = ['span'];

export function Col(...children: View[]): ColTag {
  return new ColTag("col", ...children);
}
