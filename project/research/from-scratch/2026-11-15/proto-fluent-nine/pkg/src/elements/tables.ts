import { defineSchemaKeys } from "../core/proto.js";
import { devChecks, assertMutable } from "../core/dev-checks.js";
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
  protected _colspan?: number;
  protected _rowspan?: number;
  protected _scope?: TableCellScope;
  protected _headers?: string;
  protected _abbr?: string;

  setColspan(colspan: number): this {
    if (devChecks) assertMutable(this, "setColspan");
    this._colspan = colspan;
    return this;
  }

  setRowspan(rowspan: number): this {
    if (devChecks) assertMutable(this, "setRowspan");
    this._rowspan = rowspan;
    return this;
  }

  setScope(scope: TableCellScope): this {
    if (devChecks) assertMutable(this, "setScope");
    this._scope = scope;
    return this;
  }

  setHeaders(...ids: (string | Id)[]): this {
    if (devChecks) assertMutable(this, "setHeaders");
    const j = joinHeaderIds(ids);
    this._headers = j.length ? j.join(' ') : undefined;
    return this;
  }

  addHeaders(...ids: (string | Id)[]): this {
    if (devChecks) assertMutable(this, "addHeaders");
    const existing = this._headers ? this._headers.split(/\s+/).filter(Boolean) : [];
    const merged = [...new Set([...existing, ...joinHeaderIds(ids)])];
    this._headers = merged.length ? merged.join(' ') : undefined;
    return this;
  }

  setAbbr(abbr: string): this {
    if (devChecks) assertMutable(this, "setAbbr");
    this._abbr = abbr;
    return this;
  }
}

defineSchemaKeys(ThTag, ['colspan', 'rowspan', 'scope', 'headers', 'abbr']);

export function Th(...children: View[]): ThTag {
  return new ThTag("th", ...children);
}

export class TdTag extends Tag {
  protected _colspan?: number;
  protected _rowspan?: number;
  protected _headers?: string;

  setColspan(colspan: number): this {
    if (devChecks) assertMutable(this, "setColspan");
    this._colspan = colspan;
    return this;
  }

  setRowspan(rowspan: number): this {
    if (devChecks) assertMutable(this, "setRowspan");
    this._rowspan = rowspan;
    return this;
  }

  setHeaders(...ids: (string | Id)[]): this {
    if (devChecks) assertMutable(this, "setHeaders");
    const j = joinHeaderIds(ids);
    this._headers = j.length ? j.join(' ') : undefined;
    return this;
  }

  addHeaders(...ids: (string | Id)[]): this {
    if (devChecks) assertMutable(this, "addHeaders");
    const existing = this._headers ? this._headers.split(/\s+/).filter(Boolean) : [];
    const merged = [...new Set([...existing, ...joinHeaderIds(ids)])];
    this._headers = merged.length ? merged.join(' ') : undefined;
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
  protected _span?: number;

  setSpan(span: number): this {
    if (devChecks) assertMutable(this, "setSpan");
    this._span = span;
    return this;
  }
}

defineSchemaKeys(ColgroupTag, ['span']);

export function Colgroup(...children: View[]): ColgroupTag {
  return new ColgroupTag("colgroup", ...children);
}

export class ColTag extends Tag {
  protected _span?: number;

  setSpan(span: number): this {
    if (devChecks) assertMutable(this, "setSpan");
    this._span = span;
    return this;
  }
}

defineSchemaKeys(ColTag, ['span']);

export function Col(): ColTag {
  return new ColTag("col");
}
