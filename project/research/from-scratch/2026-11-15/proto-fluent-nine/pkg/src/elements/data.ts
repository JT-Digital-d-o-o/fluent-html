import { defineSchemaKeys } from "../core/proto.js";
import { devChecks, assertMutable } from "../core/dev-checks.js";
import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";


export class TimeTag extends Tag {
  protected _datetime?: string;

  setDatetime(datetime?: string): this {
    if (devChecks) assertMutable(this, "setDatetime");
    this._datetime = datetime;
    return this;
  }
}

defineSchemaKeys(TimeTag, ['datetime']);

export function Time(...children: View[]): TimeTag {
  return new TimeTag("time", ...children);
}

export class DataTag extends Tag {
  protected _value?: string;

  setValue(value?: string): this {
    if (devChecks) assertMutable(this, "setValue");
    this._value = value;
    return this;
  }
}

defineSchemaKeys(DataTag, ['value']);

export function Data(...children: View[]): DataTag {
  return new DataTag("data", ...children);
}

export class ProgressTag extends Tag {
  protected _value?: number;
  protected _max?: number;

  setValue(value?: number): this {
    if (devChecks) assertMutable(this, "setValue");
    this._value = value;
    return this;
  }

  setMax(max?: number): this {
    if (devChecks) assertMutable(this, "setMax");
    this._max = max;
    return this;
  }
}

defineSchemaKeys(ProgressTag, ['value', 'max']);

export function Progress(...children: View[]): ProgressTag {
  return new ProgressTag("progress", ...children);
}

export class MeterTag extends Tag {
  protected _value?: number;
  protected _min?: number;
  protected _max?: number;
  protected _low?: number;
  protected _high?: number;
  protected _optimum?: number;

  setValue(value?: number): this {
    if (devChecks) assertMutable(this, "setValue");
    this._value = value;
    return this;
  }

  setMin(min?: number): this {
    if (devChecks) assertMutable(this, "setMin");
    this._min = min;
    return this;
  }

  setMax(max?: number): this {
    if (devChecks) assertMutable(this, "setMax");
    this._max = max;
    return this;
  }

  setLow(low?: number): this {
    if (devChecks) assertMutable(this, "setLow");
    this._low = low;
    return this;
  }

  setHigh(high?: number): this {
    if (devChecks) assertMutable(this, "setHigh");
    this._high = high;
    return this;
  }

  setOptimum(optimum?: number): this {
    if (devChecks) assertMutable(this, "setOptimum");
    this._optimum = optimum;
    return this;
  }
}

defineSchemaKeys(MeterTag, ['value', 'min', 'max', 'low', 'high', 'optimum']);

export function Meter(...children: View[]): MeterTag {
  return new MeterTag("meter", ...children);
}

export class InsTag extends Tag {
  protected _cite?: string;
  protected _datetime?: string;

  setCite(cite?: string): this {
    if (devChecks) assertMutable(this, "setCite");
    this._cite = cite;
    return this;
  }

  setDatetime(datetime?: string): this {
    if (devChecks) assertMutable(this, "setDatetime");
    this._datetime = datetime;
    return this;
  }
}

defineSchemaKeys(InsTag, ['cite', 'datetime']);

export function Ins(...children: View[]): InsTag {
  return new InsTag("ins", ...children);
}

export class DelTag extends Tag {
  protected _cite?: string;
  protected _datetime?: string;

  setCite(cite?: string): this {
    if (devChecks) assertMutable(this, "setCite");
    this._cite = cite;
    return this;
  }

  setDatetime(datetime?: string): this {
    if (devChecks) assertMutable(this, "setDatetime");
    this._datetime = datetime;
    return this;
  }
}

defineSchemaKeys(DelTag, ['cite', 'datetime']);

export function Del(...children: View[]): DelTag {
  return new DelTag("del", ...children);
}
