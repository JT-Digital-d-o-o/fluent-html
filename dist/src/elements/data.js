"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeterTag = exports.ProgressTag = exports.DataTag = exports.TimeTag = void 0;
exports.Time = Time;
exports.Data = Data;
exports.Progress = Progress;
exports.Meter = Meter;
const tag_js_1 = require("../core/tag.js");
class TimeTag extends tag_js_1.Tag {
    setDatetime(datetime) {
        this.datetime = datetime;
        return this;
    }
}
exports.TimeTag = TimeTag;
/** @internal */
TimeTag.prototype._sk = ['datetime'];
function Time(...children) {
    return new TimeTag("time", ...children);
}
class DataTag extends tag_js_1.Tag {
    setValue(value) {
        this.value = value;
        return this;
    }
}
exports.DataTag = DataTag;
/** @internal */
DataTag.prototype._sk = ['value'];
function Data(...children) {
    return new DataTag("data", ...children);
}
class ProgressTag extends tag_js_1.Tag {
    setValue(value) {
        this.value = value;
        return this;
    }
    setMax(max) {
        this.max = max;
        return this;
    }
}
exports.ProgressTag = ProgressTag;
/** @internal */
ProgressTag.prototype._sk = ['value', 'max'];
function Progress(...children) {
    return new ProgressTag("progress", ...children);
}
class MeterTag extends tag_js_1.Tag {
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
exports.MeterTag = MeterTag;
/** @internal */
MeterTag.prototype._sk = ['value', 'min', 'max', 'low', 'high', 'optimum'];
function Meter(...children) {
    return new MeterTag("meter", ...children);
}
//# sourceMappingURL=data.js.map