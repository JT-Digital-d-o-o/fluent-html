import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
export declare class TimeTag extends Tag<TimeTag> {
    datetime?: string;
    setDatetime(datetime?: string): this;
}
export declare function Time(child?: View): TimeTag;
export declare class DataTag extends Tag<DataTag> {
    value?: string;
    setValue(value?: string): this;
}
export declare function Data(child?: View): DataTag;
export declare class ProgressTag extends Tag<ProgressTag> {
    value?: number;
    max?: number;
    setValue(value?: number): this;
    setMax(max?: number): this;
}
export declare function Progress(child?: View): ProgressTag;
export declare class MeterTag extends Tag<MeterTag> {
    value?: number;
    min?: number;
    max?: number;
    low?: number;
    high?: number;
    optimum?: number;
    setValue(value?: number): this;
    setMin(min?: number): this;
    setMax(max?: number): this;
    setLow(low?: number): this;
    setHigh(high?: number): this;
    setOptimum(optimum?: number): this;
}
export declare function Meter(child?: View): MeterTag;
//# sourceMappingURL=data.d.ts.map