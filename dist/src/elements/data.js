import { Tag } from "../core/tag.js";
export class TimeTag extends Tag {
    setDatetime(datetime) {
        this.datetime = datetime;
        return this;
    }
}
/** @internal */
TimeTag.prototype._sk = ['datetime'];
export function Time(...children) {
    return new TimeTag("time", ...children);
}
export class DataTag extends Tag {
    setValue(value) {
        this.value = value;
        return this;
    }
}
/** @internal */
DataTag.prototype._sk = ['value'];
export function Data(...children) {
    return new DataTag("data", ...children);
}
export class ProgressTag extends Tag {
    setValue(value) {
        this.value = value;
        return this;
    }
    setMax(max) {
        this.max = max;
        return this;
    }
}
/** @internal */
ProgressTag.prototype._sk = ['value', 'max'];
export function Progress(...children) {
    return new ProgressTag("progress", ...children);
}
export class MeterTag extends Tag {
    setValue(value) {
        this.value = value;
        return this;
    }
    setMin(min) {
        this.min = min;
        return this;
    }
    setMax(max) {
        this.max = max;
        return this;
    }
    setLow(low) {
        this.low = low;
        return this;
    }
    setHigh(high) {
        this.high = high;
        return this;
    }
    setOptimum(optimum) {
        this.optimum = optimum;
        return this;
    }
}
/** @internal */
MeterTag.prototype._sk = ['value', 'min', 'max', 'low', 'high', 'optimum'];
export function Meter(...children) {
    return new MeterTag("meter", ...children);
}
//# sourceMappingURL=data.js.map