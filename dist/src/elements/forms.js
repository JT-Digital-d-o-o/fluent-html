import { Tag } from "../core/tag.js";
import { El } from "../core/utils.js";
/**
 * Specialized Tag for `<input>` elements with typed attribute setters.
 *
 * @example
 * Input().setType("email").setName("email").setPlaceholder("you@example.com")
 */
export class InputTag extends Tag {
    setType(type) {
        this.type = type;
        return this;
    }
    setPlaceholder(placeholder) {
        this.placeholder = placeholder;
        return this;
    }
    setName(name) {
        this.name = name;
        return this;
    }
    setValue(value) {
        this.value = value;
        return this;
    }
    setAccept(accept) {
        this.accept = accept;
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
    setStep(step) {
        this.step = step;
        return this;
    }
    setPattern(pattern) {
        this.pattern = pattern;
        return this;
    }
    setMinlength(minlength) {
        this.minlength = minlength;
        return this;
    }
    setMaxlength(maxlength) {
        this.maxlength = maxlength;
        return this;
    }
    setAutocomplete(autocomplete) {
        this.autocomplete = autocomplete;
        return this;
    }
    setAutofocus(autofocus = true) {
        this.autofocus = autofocus;
        return this;
    }
    setChecked(checked = true) {
        this.checked = checked;
        return this;
    }
    setDisabled(disabled = true) {
        this.disabled = disabled;
        return this;
    }
    setReadonly(readonly = true) {
        this.readonly = readonly;
        return this;
    }
    setMultiple(multiple = true) {
        this.multiple = multiple;
        return this;
    }
    setList(list) {
        this.list = list;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
InputTag.prototype._sk = ['type', 'name', 'placeholder', 'value', 'accept', 'min', 'max', 'step', 'pattern', 'minlength', 'maxlength', 'autocomplete', 'autofocus', 'checked', 'disabled', 'readonly', 'multiple', 'list'];
/** Create an `<input>` element with typed attribute methods. */
export function Input(...children) {
    return new InputTag("input", ...children);
}
/**
 * Specialized Tag for `<textarea>` elements with typed attribute setters.
 *
 * @example
 * Textarea().setName("comment").setRows(5).setPlaceholder("Write a comment...")
 */
export class TextareaTag extends Tag {
    setPlaceholder(placeholder) {
        this.placeholder = placeholder;
        return this;
    }
    setName(name) {
        this.name = name;
        return this;
    }
    setRows(rows) {
        this.rows = rows;
        return this;
    }
    setCols(cols) {
        this.cols = cols;
        return this;
    }
    setMinlength(minlength) {
        this.minlength = minlength;
        return this;
    }
    setMaxlength(maxlength) {
        this.maxlength = maxlength;
        return this;
    }
    setWrap(wrap) {
        this.wrap = wrap;
        return this;
    }
    setAutocomplete(autocomplete) {
        this.autocomplete = autocomplete;
        return this;
    }
    setAutofocus(autofocus = true) {
        this.autofocus = autofocus;
        return this;
    }
    setDisabled(disabled = true) {
        this.disabled = disabled;
        return this;
    }
    setReadonly(readonly = true) {
        this.readonly = readonly;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
TextareaTag.prototype._sk = ['name', 'placeholder', 'rows', 'cols', 'minlength', 'maxlength', 'wrap', 'autocomplete', 'autofocus', 'disabled', 'readonly'];
/** Create a `<textarea>` element with typed attribute methods. */
export function Textarea(...children) {
    return new TextareaTag("textarea", ...children);
}
/**
 * Specialized Tag for `<button>` elements with typed attribute setters.
 *
 * @example
 * Button("Submit").setType("submit").setDisabled(isLoading)
 */
export class ButtonTag extends Tag {
    setType(type) {
        this.type = type;
        return this;
    }
    setName(name) {
        this.name = name;
        return this;
    }
    setValue(value) {
        this.value = value;
        return this;
    }
    setDisabled(disabled = true) {
        this.disabled = disabled;
        return this;
    }
    setFormaction(formaction) {
        this.formaction = formaction;
        return this;
    }
    setFormmethod(formmethod) {
        this.formmethod = formmethod;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
ButtonTag.prototype._sk = ['type', 'name', 'value', 'disabled', 'formaction', 'formmethod'];
/** Create a `<button>` element with typed attribute methods. */
export function Button(...children) {
    return new ButtonTag("button", ...children);
}
export class LabelTag extends Tag {
    setFor(forId) {
        this.for = forId;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
LabelTag.prototype._sk = ['for'];
export function Label(...children) {
    return new LabelTag("label", ...children);
}
export class FormTag extends Tag {
    setAction(action) {
        this.action = action;
        return this;
    }
    setMethod(method) {
        this.method = method;
        return this;
    }
    setEnctype(enctype) {
        this.enctype = enctype;
        return this;
    }
    setTarget(target) {
        this.target = target;
        return this;
    }
    setNovalidate(novalidate = true) {
        this.novalidate = novalidate;
        return this;
    }
    setAutocomplete(autocomplete) {
        this.autocomplete = autocomplete;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
FormTag.prototype._sk = ['action', 'method', 'enctype', 'target', 'novalidate', 'autocomplete'];
/** Create a `<form>` element with typed attribute methods. */
export function Form(...children) {
    return new FormTag("form", ...children);
}
export class SelectTag extends Tag {
    setName(name) {
        this.name = name;
        return this;
    }
    setMultiple(multiple = true) {
        this.multiple = multiple;
        return this;
    }
    setSize(size) {
        this.size = size;
        return this;
    }
    setDisabled(disabled = true) {
        this.disabled = disabled;
        return this;
    }
    setAutofocus(autofocus = true) {
        this.autofocus = autofocus;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
SelectTag.prototype._sk = ['name', 'multiple', 'size', 'disabled', 'autofocus'];
export function Select(...children) {
    return new SelectTag("select", ...children);
}
export class OptionTag extends Tag {
    setValue(value) {
        this.value = value;
        return this;
    }
    setSelected(selected = true) {
        this.selected = selected;
        return this;
    }
    setDisabled(disabled = true) {
        this.disabled = disabled;
        return this;
    }
    setLabel(label) {
        this.label = label;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
OptionTag.prototype._sk = ['value', 'selected', 'disabled', 'label'];
export function Option(...children) {
    return new OptionTag("option", ...children);
}
export class OptgroupTag extends Tag {
    setLabel(label) {
        this.label = label;
        return this;
    }
    setDisabled(disabled = true) {
        this.disabled = disabled;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
OptgroupTag.prototype._sk = ['label', 'disabled'];
export function Optgroup(...children) {
    return new OptgroupTag("optgroup", ...children);
}
export function Datalist(...children) {
    return El("datalist", ...children);
}
export class FieldsetTag extends Tag {
    setName(name) {
        this.name = name;
        return this;
    }
    setDisabled(disabled = true) {
        this.disabled = disabled;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
FieldsetTag.prototype._sk = ['name', 'disabled'];
export function Fieldset(...children) {
    return new FieldsetTag("fieldset", ...children);
}
export function Legend(...children) {
    return El("legend", ...children);
}
export class OutputTag extends Tag {
    setFor(forId) {
        this.for = forId;
        return this;
    }
    setName(name) {
        this.name = name;
        return this;
    }
}
/** @internal */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- intentional prototype schema
OutputTag.prototype._sk = ['for', 'name'];
export function Output(...children) {
    return new OutputTag("output", ...children);
}
//# sourceMappingURL=forms.js.map