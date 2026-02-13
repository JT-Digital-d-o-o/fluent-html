import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";


export class TimeTag extends Tag {
  datetime?: string;

  setDatetime(datetime?: string): this {
    this.datetime = datetime;
    return this;
  }
}

/** @internal */
(TimeTag.prototype as any)._sk = ['datetime'];

export function Time(...children: View[]): TimeTag {
  return new TimeTag("time", ...children);
}

export class DataTag extends Tag {
  value?: string;

  setValue(value?: string): this {
    this.value = value;
    return this;
  }
}

/** @internal */
(DataTag.prototype as any)._sk = ['value'];

export function Data(...children: View[]): DataTag {
  return new DataTag("data", ...children);
}

export class ProgressTag extends Tag {
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

/** @internal */
(ProgressTag.prototype as any)._sk = ['value', 'max'];

export function Progress(...children: View[]): ProgressTag {
  return new ProgressTag("progress", ...children);
}

export class MeterTag extends Tag {
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

/** @internal */
(MeterTag.prototype as any)._sk = ['value', 'min', 'max', 'low', 'high', 'optimum'];

export function Meter(...children: View[]): MeterTag {
  return new MeterTag("meter", ...children);
}
