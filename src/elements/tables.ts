import { Tag } from "../core/tag.js";
import { El, Empty } from "../core/utils.js";
import type { View } from "../core/types.js";

export function Table(child: View = Empty()): Tag {
  return El("table", child);
}

export function Thead(child: View = Empty()): Tag {
  return El("thead", child);
}

export function Tbody(child: View = Empty()): Tag {
  return El("tbody", child);
}

export function Tfoot(child: View = Empty()): Tag {
  return El("tfoot", child);
}

export function Tr(child: View = Empty()): Tag {
  return El("tr", child);
}

export class ThTag extends Tag<ThTag> {
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

export function Th(child: View = Empty()): ThTag {
  return new ThTag("th", child);
}

export class TdTag extends Tag<TdTag> {
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

export function Td(child: View = Empty()): TdTag {
  return new TdTag("td", child);
}

export function Caption(child: View = Empty()): Tag {
  return El("caption", child);
}

export class ColgroupTag extends Tag<ColgroupTag> {
  span?: number;

  setSpan(span: number): this {
    this.span = span;
    return this;
  }
}

export function Colgroup(child: View = Empty()): ColgroupTag {
  return new ColgroupTag("colgroup", child);
}

export class ColTag extends Tag<ColTag> {
  span?: number;

  setSpan(span: number): this {
    this.span = span;
    return this;
  }
}

export function Col(child: View = Empty()): ColTag {
  return new ColTag("col", child);
}
