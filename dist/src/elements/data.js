import { defineSchemaKeys } from "../core/proto.js";
import { devChecks, assertMutable } from "../core/dev-checks.js";
import { Tag } from "../core/tag.js";
export class TimeTag extends Tag {
    setDatetime(datetime) {
        if (devChecks)
            assertMutable(this, "setDatetime");
        this._datetime = datetime;
        return this;
    }
}
defineSchemaKeys(TimeTag, ['datetime']);
export function Time(...children) {
    return new TimeTag("time", ...children);
}
export class DataTag extends Tag {
    setValue(value) {
        if (devChecks)
            assertMutable(this, "setValue");
        this._value = value;
        return this;
    }
}
defineSchemaKeys(DataTag, ['value']);
export function Data(...children) {
    return new DataTag("data", ...children);
}
export class ProgressTag extends Tag {
    setValue(value) {
        if (devChecks)
            assertMutable(this, "setValue");
        this._value = value;
        return this;
    }
    setMax(max) {
        if (devChecks)
            assertMutable(this, "setMax");
        this._max = max;
        return this;
    }
}
defineSchemaKeys(ProgressTag, ['value', 'max']);
export function Progress(...children) {
    return new ProgressTag("progress", ...children);
}
export class MeterTag extends Tag {
    setValue(value) {
        if (devChecks)
            assertMutable(this, "setValue");
        this._value = value;
        return this;
    }
    setMin(min) {
        if (devChecks)
            assertMutable(this, "setMin");
        this._min = min;
        return this;
    }
    setMax(max) {
        if (devChecks)
            assertMutable(this, "setMax");
        this._max = max;
        return this;
    }
    setLow(low) {
        if (devChecks)
            assertMutable(this, "setLow");
        this._low = low;
        return this;
    }
    setHigh(high) {
        if (devChecks)
            assertMutable(this, "setHigh");
        this._high = high;
        return this;
    }
    setOptimum(optimum) {
        if (devChecks)
            assertMutable(this, "setOptimum");
        this._optimum = optimum;
        return this;
    }
}
defineSchemaKeys(MeterTag, ['value', 'min', 'max', 'low', 'high', 'optimum']);
export function Meter(...children) {
    return new MeterTag("meter", ...children);
}
export class InsTag extends Tag {
    setCite(cite) {
        if (devChecks)
            assertMutable(this, "setCite");
        this._cite = cite;
        return this;
    }
    setDatetime(datetime) {
        if (devChecks)
            assertMutable(this, "setDatetime");
        this._datetime = datetime;
        return this;
    }
}
defineSchemaKeys(InsTag, ['cite', 'datetime']);
export function Ins(...children) {
    return new InsTag("ins", ...children);
}
export class DelTag extends Tag {
    setCite(cite) {
        if (devChecks)
            assertMutable(this, "setCite");
        this._cite = cite;
        return this;
    }
    setDatetime(datetime) {
        if (devChecks)
            assertMutable(this, "setDatetime");
        this._datetime = datetime;
        return this;
    }
}
defineSchemaKeys(DelTag, ['cite', 'datetime']);
export function Del(...children) {
    return new DelTag("del", ...children);
}
//# sourceMappingURL=data.js.map