import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
export declare class TimeTag extends Tag {
    protected _datetime?: string;
    setDatetime(datetime?: string): this;
}
export declare function Time(...children: View[]): TimeTag;
export declare class DataTag extends Tag {
    protected _value?: string;
    setValue(value?: string): this;
}
export declare function Data(...children: View[]): DataTag;
export declare class ProgressTag extends Tag {
    protected _value?: number;
    protected _max?: number;
    setValue(value?: number): this;
    setMax(max?: number): this;
}
export declare function Progress(...children: View[]): ProgressTag;
export declare class MeterTag extends Tag {
    protected _value?: number;
    protected _min?: number;
    protected _max?: number;
    protected _low?: number;
    protected _high?: number;
    protected _optimum?: number;
    setValue(value?: number): this;
    setMin(min?: number): this;
    setMax(max?: number): this;
    setLow(low?: number): this;
    setHigh(high?: number): this;
    setOptimum(optimum?: number): this;
}
export declare function Meter(...children: View[]): MeterTag;
export declare class InsTag extends Tag {
    protected _cite?: string;
    protected _datetime?: string;
    setCite(cite?: string): this;
    setDatetime(datetime?: string): this;
}
export declare function Ins(...children: View[]): InsTag;
export declare class DelTag extends Tag {
    protected _cite?: string;
    protected _datetime?: string;
    setCite(cite?: string): this;
    setDatetime(datetime?: string): this;
}
export declare function Del(...children: View[]): DelTag;
//# sourceMappingURL=data.d.ts.map