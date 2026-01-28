import { Tag } from "../core/tag.js";
import { El, Empty } from "../core/utils.js";
import type { View } from "../core/types.js";

export class InputTag extends Tag<InputTag> {
  type?: string;
  placeholder?: string;
  name?: string;
  value?: string;
  accept?: string;
  min?: number;
  max?: number;
  step?: number | 'any';
  pattern?: string;
  minlength?: number;
  maxlength?: number;
  autocomplete?: string;
  autofocus?: boolean;
  checked?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  multiple?: boolean;
  list?: string;

  setType(type?: string): this {
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

  setMin(min?: number): this {
    this.min = min;
    return this;
  }

  setMax(max?: number): this {
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

  setAutocomplete(autocomplete?: string): this {
    this.autocomplete = autocomplete;
    return this;
  }

  setAutofocus(autofocus: boolean = true): this {
    this.autofocus = autofocus;
    return this;
  }

  setChecked(checked: boolean = true): this {
    this.checked = checked;
    return this;
  }

  setDisabled(disabled: boolean = true): this {
    this.disabled = disabled;
    return this;
  }

  setReadonly(readonly: boolean = true): this {
    this.readonly = readonly;
    return this;
  }

  setMultiple(multiple: boolean = true): this {
    this.multiple = multiple;
    return this;
  }

  setList(list?: string): this {
    this.list = list;
    return this;
  }
}

/** @internal */
(InputTag.prototype as any)._sk = ['type', 'name', 'placeholder', 'value', 'accept', 'min', 'max', 'step', 'pattern', 'minlength', 'maxlength', 'autocomplete', 'autofocus', 'checked', 'disabled', 'readonly', 'multiple', 'list'];

export function Input(child: View = Empty()): InputTag {
  return new InputTag("input", child);
}

export class TextareaTag extends Tag<TextareaTag> {
  placeholder?: string;
  name?: string;
  rows?: number;
  cols?: number;
  minlength?: number;
  maxlength?: number;
  wrap?: 'hard' | 'soft' | 'off';
  autocomplete?: string;
  autofocus?: boolean;
  disabled?: boolean;
  readonly?: boolean;

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

  setAutocomplete(autocomplete?: string): this {
    this.autocomplete = autocomplete;
    return this;
  }

  setAutofocus(autofocus: boolean = true): this {
    this.autofocus = autofocus;
    return this;
  }

  setDisabled(disabled: boolean = true): this {
    this.disabled = disabled;
    return this;
  }

  setReadonly(readonly: boolean = true): this {
    this.readonly = readonly;
    return this;
  }
}

/** @internal */
(TextareaTag.prototype as any)._sk = ['name', 'placeholder', 'rows', 'cols', 'minlength', 'maxlength', 'wrap', 'autocomplete', 'autofocus', 'disabled', 'readonly'];

export function Textarea(child: View = Empty()): TextareaTag {
  return new TextareaTag("textarea", child);
}

export class ButtonTag extends Tag<ButtonTag> {
  type?: 'submit' | 'reset' | 'button';
  name?: string;
  value?: string;
  disabled?: boolean;
  formaction?: string;
  formmethod?: string;

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

  setDisabled(disabled: boolean = true): this {
    this.disabled = disabled;
    return this;
  }

  setFormaction(formaction?: string): this {
    this.formaction = formaction;
    return this;
  }

  setFormmethod(formmethod?: string): this {
    this.formmethod = formmethod;
    return this;
  }
}

/** @internal */
(ButtonTag.prototype as any)._sk = ['type', 'name', 'value', 'disabled', 'formaction', 'formmethod'];

export function Button(child: View = Empty()): ButtonTag {
  return new ButtonTag("button", child);
}

export class LabelTag extends Tag<LabelTag> {
  for?: string;

  setFor(forId?: string): this {
    this.for = forId;
    return this;
  }
}

/** @internal */
(LabelTag.prototype as any)._sk = ['for'];

export function Label(child: View = Empty()): LabelTag {
  return new LabelTag("label", child);
}

export class FormTag extends Tag<FormTag> {
  action?: string;
  method?: string;
  enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
  target?: string;
  novalidate?: boolean;
  autocomplete?: 'on' | 'off';

  setAction(action?: string): this {
    this.action = action;
    return this;
  }

  setMethod(method?: string): this {
    this.method = method;
    return this;
  }

  setEnctype(enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'): this {
    this.enctype = enctype;
    return this;
  }

  setTarget(target?: string): this {
    this.target = target;
    return this;
  }

  setNovalidate(novalidate: boolean = true): this {
    this.novalidate = novalidate;
    return this;
  }

  setAutocomplete(autocomplete?: 'on' | 'off'): this {
    this.autocomplete = autocomplete;
    return this;
  }
}

/** @internal */
(FormTag.prototype as any)._sk = ['action', 'method', 'enctype', 'target', 'novalidate', 'autocomplete'];

export function Form(child: View = Empty()): FormTag {
  return new FormTag("form", child);
}

export class SelectTag extends Tag<SelectTag> {
  name?: string;
  multiple?: boolean;
  size?: number;
  disabled?: boolean;
  autofocus?: boolean;

  setName(name?: string): this {
    this.name = name;
    return this;
  }

  setMultiple(multiple: boolean = true): this {
    this.multiple = multiple;
    return this;
  }

  setSize(size?: number): this {
    this.size = size;
    return this;
  }

  setDisabled(disabled: boolean = true): this {
    this.disabled = disabled;
    return this;
  }

  setAutofocus(autofocus: boolean = true): this {
    this.autofocus = autofocus;
    return this;
  }
}

/** @internal */
(SelectTag.prototype as any)._sk = ['name', 'multiple', 'size', 'disabled', 'autofocus'];

export function Select(child: View = Empty()): SelectTag {
  return new SelectTag("select", child);
}

export class OptionTag extends Tag<OptionTag> {
  value?: string;
  selected?: boolean;
  disabled?: boolean;
  label?: string;

  setValue(value: string): this {
    this.value = value;
    return this;
  }

  setSelected(selected: boolean = true): this {
    this.selected = selected;
    return this;
  }

  setDisabled(disabled: boolean = true): this {
    this.disabled = disabled;
    return this;
  }

  setLabel(label?: string): this {
    this.label = label;
    return this;
  }
}

/** @internal */
(OptionTag.prototype as any)._sk = ['value', 'selected', 'disabled', 'label'];

export function Option(child: View = Empty()): OptionTag {
  return new OptionTag("option", child);
}

export class OptgroupTag extends Tag<OptgroupTag> {
  label?: string;
  disabled?: boolean;

  setLabel(label?: string): this {
    this.label = label;
    return this;
  }

  setDisabled(disabled: boolean = true): this {
    this.disabled = disabled;
    return this;
  }
}

/** @internal */
(OptgroupTag.prototype as any)._sk = ['label', 'disabled'];

export function Optgroup(child: View = Empty()): OptgroupTag {
  return new OptgroupTag("optgroup", child);
}

export function Datalist(child: View = Empty()): Tag {
  return El("datalist", child);
}

export class FieldsetTag extends Tag<FieldsetTag> {
  name?: string;
  disabled?: boolean;

  setName(name?: string): this {
    this.name = name;
    return this;
  }

  setDisabled(disabled: boolean = true): this {
    this.disabled = disabled;
    return this;
  }
}

/** @internal */
(FieldsetTag.prototype as any)._sk = ['name', 'disabled'];

export function Fieldset(child: View = Empty()): FieldsetTag {
  return new FieldsetTag("fieldset", child);
}

export function Legend(child: View = Empty()): Tag {
  return El("legend", child);
}

export class OutputTag extends Tag<OutputTag> {
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

/** @internal */
(OutputTag.prototype as any)._sk = ['for', 'name'];

export function Output(child: View = Empty()): OutputTag {
  return new OutputTag("output", child);
}
