import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
export declare function Table(...children: View[]): Tag;
export declare function Thead(...children: View[]): Tag;
export declare function Tbody(...children: View[]): Tag;
export declare function Tfoot(...children: View[]): Tag;
export declare function Tr(...children: View[]): Tag;
export declare class ThTag extends Tag {
    colspan?: number;
    rowspan?: number;
    scope?: 'row' | 'col' | 'rowgroup' | 'colgroup';
    setColspan(colspan: number): this;
    setRowspan(rowspan: number): this;
    setScope(scope: 'row' | 'col' | 'rowgroup' | 'colgroup'): this;
}
export declare function Th(...children: View[]): ThTag;
export declare class TdTag extends Tag {
    colspan?: number;
    rowspan?: number;
    setColspan(colspan: number): this;
    setRowspan(rowspan: number): this;
}
export declare function Td(...children: View[]): TdTag;
export declare function Caption(...children: View[]): Tag;
export declare class ColgroupTag extends Tag {
    span?: number;
    setSpan(span: number): this;
}
export declare function Colgroup(...children: View[]): ColgroupTag;
export declare class ColTag extends Tag {
    span?: number;
    setSpan(span: number): this;
}
export declare function Col(...children: View[]): ColTag;
//# sourceMappingURL=tables.d.ts.map