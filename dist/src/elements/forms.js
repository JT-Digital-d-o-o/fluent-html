"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputTag = exports.FieldsetTag = exports.OptgroupTag = exports.OptionTag = exports.SelectTag = exports.FormTag = exports.LabelTag = exports.ButtonTag = exports.TextareaTag = exports.InputTag = void 0;
exports.Input = Input;
exports.Textarea = Textarea;
exports.Button = Button;
exports.Label = Label;
exports.Form = Form;
exports.Select = Select;
exports.Option = Option;
exports.Optgroup = Optgroup;
exports.Datalist = Datalist;
exports.Fieldset = Fieldset;
exports.Legend = Legend;
exports.Output = Output;
const tag_js_1 = require("../core/tag.js");
const utils_js_1 = require("../core/utils.js");
class InputTag extends tag_js_1.Tag {
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
exports.InputTag = InputTag;
/** @internal */
InputTag.prototype._sk = ['type', 'name', 'placeholder', 'value', 'accept', 'min', 'max', 'step', 'pattern', 'minlength', 'maxlength', 'autocomplete', 'autofocus', 'checked', 'disabled', 'readonly', 'multiple', 'list'];
function Input(child = (0, utils_js_1.Empty)()) {
    return new InputTag("input", child);
}
class TextareaTag extends tag_js_1.Tag {
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
exports.TextareaTag = TextareaTag;
/** @internal */
TextareaTag.prototype._sk = ['name', 'placeholder', 'rows', 'cols', 'minlength', 'maxlength', 'wrap', 'autocomplete', 'autofocus', 'disabled', 'readonly'];
function Textarea(child = (0, utils_js_1.Empty)()) {
    return new TextareaTag("textarea", child);
}
class ButtonTag extends tag_js_1.Tag {
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
exports.ButtonTag = ButtonTag;
/** @internal */
ButtonTag.prototype._sk = ['type', 'name', 'value', 'disabled', 'formaction', 'formmethod'];
function Button(child = (0, utils_js_1.Empty)()) {
    return new ButtonTag("button", child);
}
class LabelTag extends tag_js_1.Tag {
    setFor(forId) {
        this.for = forId;
        return this;
    }
}
exports.LabelTag = LabelTag;
/** @internal */
LabelTag.prototype._sk = ['for'];
function Label(child = (0, utils_js_1.Empty)()) {
    return new LabelTag("label", child);
}
class FormTag extends tag_js_1.Tag {
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
exports.FormTag = FormTag;
/** @internal */
FormTag.prototype._sk = ['action', 'method', 'enctype', 'target', 'novalidate', 'autocomplete'];
function Form(child = (0, utils_js_1.Empty)()) {
    return new FormTag("form", child);
}
class SelectTag extends tag_js_1.Tag {
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
exports.SelectTag = SelectTag;
/** @internal */
SelectTag.prototype._sk = ['name', 'multiple', 'size', 'disabled', 'autofocus'];
function Select(child = (0, utils_js_1.Empty)()) {
    return new SelectTag("select", child);
}
class OptionTag extends tag_js_1.Tag {
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
exports.OptionTag = OptionTag;
/** @internal */
OptionTag.prototype._sk = ['value', 'selected', 'disabled', 'label'];
function Option(child = (0, utils_js_1.Empty)()) {
    return new OptionTag("option", child);
}
class OptgroupTag extends tag_js_1.Tag {
    setLabel(label) {
        this.label = label;
        return this;
    }
    setDisabled(disabled = true) {
        this.disabled = disabled;
        return this;
    }
}
exports.OptgroupTag = OptgroupTag;
/** @internal */
OptgroupTag.prototype._sk = ['label', 'disabled'];
function Optgroup(child = (0, utils_js_1.Empty)()) {
    return new OptgroupTag("optgroup", child);
}
function Datalist(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("datalist", child);
}
class FieldsetTag extends tag_js_1.Tag {
    setName(name) {
        this.name = name;
        return this;
    }
    setDisabled(disabled = true) {
        this.disabled = disabled;
        return this;
    }
}
exports.FieldsetTag = FieldsetTag;
/** @internal */
FieldsetTag.prototype._sk = ['name', 'disabled'];
function Fieldset(child = (0, utils_js_1.Empty)()) {
    return new FieldsetTag("fieldset", child);
}
function Legend(child = (0, utils_js_1.Empty)()) {
    return (0, utils_js_1.El)("legend", child);
}
class OutputTag extends tag_js_1.Tag {
    setFor(forId) {
        this.for = forId;
        return this;
    }
    setName(name) {
        this.name = name;
        return this;
    }
}
exports.OutputTag = OutputTag;
/** @internal */
OutputTag.prototype._sk = ['for', 'name'];
function Output(child = (0, utils_js_1.Empty)()) {
    return new OutputTag("output", child);
}
//# sourceMappingURL=forms.js.map