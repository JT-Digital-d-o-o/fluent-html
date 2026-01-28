import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
import { Empty } from "../core/utils.js";

export class TimeTag extends Tag<TimeTag> {
  datetime?: string;

  setDatetime(datetime?: string): this {
    this.datetime = datetime;
    return this;
  }
}

export function Time(child: View = Empty()): TimeTag {
  return new TimeTag("time", child);
}

export class DataTag extends Tag<DataTag> {
  value?: string;

  setValue(value?: string): this {
    this.value = value;
    return this;
  }
}

export function Data(child: View = Empty()): DataTag {
  return new DataTag("data", child);
}

export class ProgressTag extends Tag<ProgressTag> {
  value?: number;
  max?: number;

  setValue(value?: number): this {
    this.value = value;
    return this;
  }

  setMax(max?: number): this {
    this.max = max;
    return this;
  }
}

export function Progress(child: View = Empty()): ProgressTag {
  return new ProgressTag("progress", child);
}

export class MeterTag extends Tag<MeterTag> {
  value?: number;
  min?: number;
  max?: number;
  low?: number;
  high?: number;
  optimum?: number;

  setValue(value?: number): this {
    this.value = value;
    return this;
  }

  setMin(min?: number): this {
    this.min = min;
    return this;
  }

  setMax(max?: number): this {
    this.max = max;
    return this;
  }

  setLow(low?: number): this {
    this.low = low;
    return this;
  }

  setHigh(high?: number): this {
    this.high = high;
    return this;
  }

  setOptimum(optimum?: number): this {
    this.optimum = optimum;
    return this;
  }
}

export function Meter(child: View = Empty()): MeterTag {
  return new MeterTag("meter", child);
}
