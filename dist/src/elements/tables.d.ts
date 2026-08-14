import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
import type { Id } from "../ids.js";
/** `<th scope>` value. Use `scope` for simple/regular tables; for irregular or
 *  spanning header layouts use `setHeaders` (cell-to-header id association). */
export type TableCellScope = 'row' | 'col' | 'rowgroup' | 'colgroup';
export declare function Table(...children: View[]): Tag;
export declare function Thead(...children: View[]): Tag;
export declare function Tbody(...children: View[]): Tag;
export declare function Tfoot(...children: View[]): Tag;
export declare function Tr(...children: View[]): Tag;
export declare class ThTag extends Tag {
    protected _colspan?: number;
    protected _rowspan?: number;
    protected _scope?: TableCellScope;
    protected _headers?: string;
    protected _abbr?: string;
    setColspan(colspan: number): this;
    setRowspan(rowspan: number): this;
    setScope(scope: TableCellScope): this;
    setHeaders(...ids: (string | Id)[]): this;
    addHeaders(...ids: (string | Id)[]): this;
    setAbbr(abbr: string): this;
}
export declare function Th(...children: View[]): ThTag;
export declare class TdTag extends Tag {
    protected _colspan?: number;
    protected _rowspan?: number;
    protected _headers?: string;
    setColspan(colspan: number): this;
    setRowspan(rowspan: number): this;
    setHeaders(...ids: (string | Id)[]): this;
    addHeaders(...ids: (string | Id)[]): this;
}
export declare function Td(...children: View[]): TdTag;
export declare function Caption(...children: View[]): Tag;
export declare class ColgroupTag extends Tag {
    protected _span?: number;
    setSpan(span: number): this;
}
export declare function Colgroup(...children: View[]): ColgroupTag;
export declare class ColTag extends Tag {
    protected _span?: number;
    setSpan(span: number): this;
}
export declare function Col(): ColTag;
//# sourceMappingURL=tables.d.ts.map