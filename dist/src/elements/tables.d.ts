import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
export declare function Table(child?: View): Tag;
export declare function Thead(child?: View): Tag;
export declare function Tbody(child?: View): Tag;
export declare function Tfoot(child?: View): Tag;
export declare function Tr(child?: View): Tag;
export declare class ThTag extends Tag<ThTag> {
    colspan?: number;
    rowspan?: number;
    scope?: 'row' | 'col' | 'rowgroup' | 'colgroup';
    setColspan(colspan: number): this;
    setRowspan(rowspan: number): this;
    setScope(scope: 'row' | 'col' | 'rowgroup' | 'colgroup'): this;
}
export declare function Th(child?: View): ThTag;
export declare class TdTag extends Tag<TdTag> {
    colspan?: number;
    rowspan?: number;
    setColspan(colspan: number): this;
    setRowspan(rowspan: number): this;
}
export declare function Td(child?: View): TdTag;
export declare function Caption(child?: View): Tag;
export declare class ColgroupTag extends Tag<ColgroupTag> {
    span?: number;
    setSpan(span: number): this;
}
export declare function Colgroup(child?: View): ColgroupTag;
export declare class ColTag extends Tag<ColTag> {
    span?: number;
    setSpan(span: number): this;
}
export declare function Col(child?: View): ColTag;
//# sourceMappingURL=tables.d.ts.map