import { defineSchemaKeys } from "../core/proto.js";
import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
import type { View } from "../core/types.js";
import { extractId } from "../ids.js";
import type { Id } from "../ids.js";

/** `<th scope>` value. Use `scope` for simple/regular tables; for irregular or
 *  spanning header layouts use `setHeaders` (cell-to-header id association). */
export type TableCellScope = 'row' | 'col' | 'rowgroup' | 'colgroup';

function joinHeaderIds(ids: (string | Id)[]): string[] {
  return ids.map(extractId).map(s => s.trim()).filter(Boolean);
}

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
  scope?: TableCellScope;
  headers?: string;
  abbr?: string;

  setColspan(colspan: number): this {
    this.colspan = colspan;
    return this;
  }

  setRowspan(rowspan: number): this {
    this.rowspan = rowspan;
    return this;
  }

  setScope(scope: TableCellScope): this {
    this.scope = scope;
    return this;
  }

  setHeaders(...ids: (string | Id)[]): this {
    const j = joinHeaderIds(ids);
    this.headers = j.length ? j.join(' ') : undefined;
    return this;
  }

  addHeaders(...ids: (string | Id)[]): this {
    const existing = this.headers ? this.headers.split(/\s+/).filter(Boolean) : [];
    const merged = [...new Set([...existing, ...joinHeaderIds(ids)])];
    this.headers = merged.length ? merged.join(' ') : undefined;
    return this;
  }

  setAbbr(abbr: string): this {
    this.abbr = abbr;
    return this;
  }
}

defineSchemaKeys(ThTag, ['colspan', 'rowspan', 'scope', 'headers', 'abbr']);

export function Th(...children: View[]): ThTag {
  return new ThTag("th", ...children);
}

export class TdTag extends Tag {
  colspan?: number;
  rowspan?: number;
  headers?: string;

  setColspan(colspan: number): this {
    this.colspan = colspan;
    return this;
  }

  setRowspan(rowspan: number): this {
    this.rowspan = rowspan;
    return this;
  }

  setHeaders(...ids: (string | Id)[]): this {
    const j = joinHeaderIds(ids);
    this.headers = j.length ? j.join(' ') : undefined;
    return this;
  }

  addHeaders(...ids: (string | Id)[]): this {
    const existing = this.headers ? this.headers.split(/\s+/).filter(Boolean) : [];
    const merged = [...new Set([...existing, ...joinHeaderIds(ids)])];
    this.headers = merged.length ? merged.join(' ') : undefined;
    return this;
  }
}

defineSchemaKeys(TdTag, ['colspan', 'rowspan', 'headers']);

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

defineSchemaKeys(ColgroupTag, ['span']);

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

defineSchemaKeys(ColTag, ['span']);

export function Col(): ColTag {
  return new ColTag("col");
}
