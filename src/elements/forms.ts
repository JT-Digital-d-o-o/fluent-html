import { defineSchemaKeys } from "../core/proto.js";
import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
import type { View } from "../core/types.js";
import type { InputType, NumericInputType, DateTimeInputType, NoMinMaxInputType, AutocompleteHint, FormMethod, BrowsingContext } from "./html-types.js";

/**
 * Specialized Tag for `<input>` elements with typed attribute setters.
 *
 * @example
 * Input().setType("email").setName("email").setPlaceholder("you@example.com")
 */
export class InputTag extends Tag {
  type?: InputType;
  placeholder?: string;
  name?: string;
  value?: string;
  accept?: string;
  min?: number | string;
  max?: number | string;
  step?: number | 'any';
  pattern?: string;
  minlength?: number;
  maxlength?: number;
  autocomplete?: AutocompleteHint;
  list?: string;

  setType(type?: InputType): this {
    this.type = type;
    return this;
  }

  setPlaceholder(placeholder?: string): this {
    this.placeholder = placeholder;
    return this;
  }

  setName(name?: string): this {
    this.name = name;
    return this;
  }

  setValue(value?: string): this {
    this.value = value;
    return this;
  }

  setAccept(accept?: string): this {
    this.accept = accept;
    return this;
  }

  setMin(min?: number | string): this {
    this.min = min;
    return this;
  }

  setMax(max?: number | string): this {
    this.max = max;
    return this;
  }

  setStep(step?: number | 'any'): this {
    this.step = step;
    return this;
  }

  setPattern(pattern?: string): this {
    this.pattern = pattern;
    return this;
  }

  setMinlength(minlength?: number): this {
    this.minlength = minlength;
    return this;
  }

  setMaxlength(maxlength?: number): this {
    this.maxlength = maxlength;
    return this;
  }

  setAutocomplete(autocomplete?: AutocompleteHint): this {
    this.autocomplete = autocomplete;
    return this;
  }

  setList(list?: string): this {
    this.list = list;
    return this;
  }
}

defineSchemaKeys(InputTag, ['type', 'name', 'placeholder', 'value', 'accept', 'min', 'max', 'step', 'pattern', 'minlength', 'maxlength', 'autocomplete', 'list']);

/** InputTag narrowed for numeric input types (number, range). */
export interface NumericInputTag extends InputTag {
  setMin(min?: number): this;
  setMax(max?: number): this;
}

/** InputTag narrowed for date/time input types. */
export interface DateTimeInputTag extends InputTag {
  setMin(min?: string): this;
  setMax(max?: string): this;
}

/** InputTag narrowed for input types that don't support min/max/step. */
export interface NoMinMaxInputTag extends InputTag {
  setMin(min?: never): this;
  setMax(max?: never): this;
  setStep(step?: never): this;
}

/** Create an `<input>` element. Pass a type for typed min/max/step validation. */
export function Input(): InputTag;
export function Input(type: NumericInputType): NumericInputTag;
export function Input(type: DateTimeInputType): DateTimeInputTag;
export function Input(type: NoMinMaxInputType): NoMinMaxInputTag;
export function Input(type?: InputType): InputTag {
  const tag = new InputTag("input");
  if (type) tag.type = type;
  return tag;
}

/**
 * Specialized Tag for `<textarea>` elements with typed attribute setters.
 *
 * @example
 * Textarea().setName("comment").setRows(5).setPlaceholder("Write a comment...")
 */
export class TextareaTag extends Tag {
  placeholder?: string;
  name?: string;
  rows?: number;
  cols?: number;
  minlength?: number;
  maxlength?: number;
  wrap?: 'hard' | 'soft' | 'off';
  autocomplete?: AutocompleteHint;

  setPlaceholder(placeholder?: string): this {
    this.placeholder = placeholder;
    return this;
  }

  setName(name?: string): this {
    this.name = name;
    return this;
  }

  setRows(rows?: number): this {
    this.rows = rows;
    return this;
  }

  setCols(cols?: number): this {
    this.cols = cols;
    return this;
  }

  setMinlength(minlength?: number): this {
    this.minlength = minlength;
    return this;
  }

  setMaxlength(maxlength?: number): this {
    this.maxlength = maxlength;
    return this;
  }

  setWrap(wrap?: 'hard' | 'soft' | 'off'): this {
    this.wrap = wrap;
    return this;
  }

  setAutocomplete(autocomplete?: AutocompleteHint): this {
    this.autocomplete = autocomplete;
    return this;
  }
}

defineSchemaKeys(TextareaTag, ['name', 'placeholder', 'rows', 'cols', 'minlength', 'maxlength', 'wrap', 'autocomplete']);

/** Create a `<textarea>` element with typed attribute methods. */
export function Textarea(...children: View[]): TextareaTag {
  return new TextareaTag("textarea", ...children);
}

/**
 * Specialized Tag for `<button>` elements with typed attribute setters.
 *
 * @example
 * Button("Submit").setType("submit").toggle("disabled", isLoading)
 */
export class ButtonTag extends Tag {
  type?: 'submit' | 'reset' | 'button';
  name?: string;
  value?: string;
  formaction?: string;
  formmethod?: 'get' | 'post';

  setType(type?: 'submit' | 'reset' | 'button'): this {
    this.type = type;
    return this;
  }

  setName(name?: string): this {
    this.name = name;
    return this;
  }

  setValue(value?: string): this {
    this.value = value;
    return this;
  }

  setFormaction(formaction?: string): this {
    this.formaction = formaction;
    return this;
  }

  setFormmethod(formmethod?: 'get' | 'post'): this {
    this.formmethod = formmethod;
    return this;
  }
}

defineSchemaKeys(ButtonTag, ['type', 'name', 'value', 'formaction', 'formmethod']);

/** Create a `<button>` element with typed attribute methods. */
export function Button(...children: View[]): ButtonTag {
  return new ButtonTag("button", ...children);
}

export class LabelTag extends Tag {
  for?: string;

  setFor(forId?: string): this {
    this.for = forId;
    return this;
  }
}

defineSchemaKeys(LabelTag, ['for']);

export function Label(...children: View[]): LabelTag {
  return new LabelTag("label", ...children);
}

export class FormTag extends Tag {
  action?: string;
  method?: FormMethod;
  enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
  target?: BrowsingContext;
  autocomplete?: 'on' | 'off';

  setAction(action?: string): this {
    this.action = action;
    return this;
  }

  setMethod(method?: FormMethod): this {
    this.method = method;
    return this;
  }

  setEnctype(enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'): this {
    this.enctype = enctype;
    return this;
  }

  setTarget(target?: BrowsingContext): this {
    this.target = target;
    return this;
  }

  setAutocomplete(autocomplete?: 'on' | 'off'): this {
    this.autocomplete = autocomplete;
    return this;
  }
}

defineSchemaKeys(FormTag, ['action', 'method', 'enctype', 'target', 'autocomplete']);

/** Create a `<form>` element with typed attribute methods. */
export function Form(...children: View[]): FormTag {
  return new FormTag("form", ...children);
}

export class SelectTag extends Tag {
  name?: string;
  size?: number;

  setName(name?: string): this {
    this.name = name;
    return this;
  }

  setSize(size?: number): this {
    this.size = size;
    return this;
  }
}

defineSchemaKeys(SelectTag, ['name', 'size']);

export function Select(...children: View[]): SelectTag {
  return new SelectTag("select", ...children);
}

export class OptionTag extends Tag {
  value?: string;
  label?: string;

  setValue(value: string): this {
    this.value = value;
    return this;
  }

  setLabel(label?: string): this {
    this.label = label;
    return this;
  }
}

defineSchemaKeys(OptionTag, ['value', 'label']);

export function Option(...children: View[]): OptionTag {
  return new OptionTag("option", ...children);
}

export class OptgroupTag extends Tag {
  label?: string;

  setLabel(label?: string): this {
    this.label = label;
    return this;
  }
}

defineSchemaKeys(OptgroupTag, ['label']);

export function Optgroup(...children: View[]): OptgroupTag {
  return new OptgroupTag("optgroup", ...children);
}

export function Datalist(...children: View[]): Tag {
  return El("datalist", ...children);
}

export class FieldsetTag extends Tag {
  name?: string;

  setName(name?: string): this {
    this.name = name;
    return this;
  }
}

defineSchemaKeys(FieldsetTag, ['name']);

export function Fieldset(...children: View[]): FieldsetTag {
  return new FieldsetTag("fieldset", ...children);
}

export function Legend(...children: View[]): Tag {
  return El("legend", ...children);
}

export class OutputTag extends Tag {
  for?: string;
  name?: string;

  setFor(forId?: string): this {
    this.for = forId;
    return this;
  }

  setName(name?: string): this {
    this.name = name;
    return this;
  }
}

defineSchemaKeys(OutputTag, ['for', 'name']);

export function Output(...children: View[]): OutputTag {
  return new OutputTag("output", ...children);
}
