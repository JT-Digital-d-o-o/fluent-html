"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeterTag = exports.ProgressTag = exports.DataTag = exports.TimeTag = void 0;
exports.Time = Time;
exports.Data = Data;
exports.Progress = Progress;
exports.Meter = Meter;
const tag_js_1 = require("../core/tag.js");
const utils_js_1 = require("../core/utils.js");
class TimeTag extends tag_js_1.Tag {
    setDatetime(datetime) {
        this.datetime = datetime;
        return this;
    }
}
exports.TimeTag = TimeTag;
function Time(child = (0, utils_js_1.Empty)()) {
    return new TimeTag("time", child);
}
class DataTag extends tag_js_1.Tag {
    setValue(value) {
        this.value = value;
        return this;
    }
}
exports.DataTag = DataTag;
function Data(child = (0, utils_js_1.Empty)()) {
    return new DataTag("data", child);
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
function Progress(child = (0, utils_js_1.Empty)()) {
    return new ProgressTag("progress", child);
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
function Meter(child = (0, utils_js_1.Empty)()) {
    return new MeterTag("meter", child);
}
//# sourceMappingURL=data.js.map