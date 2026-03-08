import type { View } from "../core/types.js";
export declare function ForEach<T>(views: Iterable<T>, renderItem: (item: T, index: number) => View): View;
export declare function ForEach(high: number, renderItem: (index: number) => View): View;
export declare function ForEach(low: number, high: number, renderItem: (index: number) => View): View;
export declare function Repeat(times: number, content: () => View): View;
//# sourceMappingURL=iteration.d.ts.map