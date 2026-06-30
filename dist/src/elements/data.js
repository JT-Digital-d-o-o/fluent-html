import { defineSchemaKeys } from "../core/proto.js";
import { Tag } from "../core/tag.js";
export class TimeTag extends Tag {
    setDatetime(datetime) {
        this.datetime = datetime;
        return this;
    }
}
defineSchemaKeys(TimeTag, ['datetime']);
export function Time(...children) {
    return new TimeTag("time", ...children);
}
export class DataTag extends Tag {
    setValue(value) {
        this.value = value;
        return this;
    }
}
defineSchemaKeys(DataTag, ['value']);
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
defineSchemaKeys(ProgressTag, ['value', 'max']);
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
defineSchemaKeys(MeterTag, ['value', 'min', 'max', 'low', 'high', 'optimum']);
export function Meter(...children) {
    return new MeterTag("meter", ...children);
}
export class InsTag extends Tag {
    setCite(cite) {
        this.cite = cite;
        return this;
    }
    setDatetime(datetime) {
        this.datetime = datetime;
        return this;
    }
}
defineSchemaKeys(InsTag, ['cite', 'datetime']);
export function Ins(...children) {
    return new InsTag("ins", ...children);
}
export class DelTag extends Tag {
    setCite(cite) {
        this.cite = cite;
        return this;
    }
    setDatetime(datetime) {
        this.datetime = datetime;
        return this;
    }
}
defineSchemaKeys(DelTag, ['cite', 'datetime']);
export function Del(...children) {
    return new DelTag("del", ...children);
}
//# sourceMappingURL=data.js.map