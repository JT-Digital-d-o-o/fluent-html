import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
export declare class InputTag extends Tag<InputTag> {
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
    setType(type?: string): this;
    setPlaceholder(placeholder?: string): this;
    setName(name?: string): this;
    setValue(value?: string): this;
    setAccept(accept?: string): this;
    setMin(min?: number): this;
    setMax(max?: number): this;
    setStep(step?: number | 'any'): this;
    setPattern(pattern?: string): this;
    setMinlength(minlength?: number): this;
    setMaxlength(maxlength?: number): this;
    setAutocomplete(autocomplete?: string): this;
    setAutofocus(autofocus?: boolean): this;
    setChecked(checked?: boolean): this;
    setDisabled(disabled?: boolean): this;
    setReadonly(readonly?: boolean): this;
    setMultiple(multiple?: boolean): this;
    setList(list?: string): this;
}
export declare function Input(child?: View): InputTag;
export declare class TextareaTag extends Tag<TextareaTag> {
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
    setPlaceholder(placeholder?: string): this;
    setName(name?: string): this;
    setRows(rows?: number): this;
    setCols(cols?: number): this;
    setMinlength(minlength?: number): this;
    setMaxlength(maxlength?: number): this;
    setWrap(wrap?: 'hard' | 'soft' | 'off'): this;
    setAutocomplete(autocomplete?: string): this;
    setAutofocus(autofocus?: boolean): this;
    setDisabled(disabled?: boolean): this;
    setReadonly(readonly?: boolean): this;
}
export declare function Textarea(child?: View): TextareaTag;
export declare class ButtonTag extends Tag<ButtonTag> {
    type?: 'submit' | 'reset' | 'button';
    name?: string;
    value?: string;
    disabled?: boolean;
    formaction?: string;
    formmethod?: string;
    setType(type?: 'submit' | 'reset' | 'button'): this;
    setName(name?: string): this;
    setValue(value?: string): this;
    setDisabled(disabled?: boolean): this;
    setFormaction(formaction?: string): this;
    setFormmethod(formmethod?: string): this;
}
export declare function Button(child?: View): ButtonTag;
export declare class LabelTag extends Tag<LabelTag> {
    for?: string;
    setFor(forId?: string): this;
}
export declare function Label(child?: View): LabelTag;
export declare class FormTag extends Tag<FormTag> {
    action?: string;
    method?: string;
    enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
    target?: string;
    novalidate?: boolean;
    autocomplete?: 'on' | 'off';
    setAction(action?: string): this;
    setMethod(method?: string): this;
    setEnctype(enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'): this;
    setTarget(target?: string): this;
    setNovalidate(novalidate?: boolean): this;
    setAutocomplete(autocomplete?: 'on' | 'off'): this;
}
export declare function Form(child?: View): FormTag;
export declare class SelectTag extends Tag<SelectTag> {
    name?: string;
    multiple?: boolean;
    size?: number;
    disabled?: boolean;
    autofocus?: boolean;
    setName(name?: string): this;
    setMultiple(multiple?: boolean): this;
    setSize(size?: number): this;
    setDisabled(disabled?: boolean): this;
    setAutofocus(autofocus?: boolean): this;
}
export declare function Select(child?: View): SelectTag;
export declare class OptionTag extends Tag<OptionTag> {
    value?: string;
    selected?: boolean;
    disabled?: boolean;
    label?: string;
    setValue(value: string): this;
    setSelected(selected?: boolean): this;
    setDisabled(disabled?: boolean): this;
    setLabel(label?: string): this;
}
export declare function Option(child?: View): OptionTag;
export declare class OptgroupTag extends Tag<OptgroupTag> {
    label?: string;
    disabled?: boolean;
    setLabel(label?: string): this;
    setDisabled(disabled?: boolean): this;
}
export declare function Optgroup(child?: View): OptgroupTag;
export declare function Datalist(child?: View): Tag;
export declare class FieldsetTag extends Tag<FieldsetTag> {
    name?: string;
    disabled?: boolean;
    setName(name?: string): this;
    setDisabled(disabled?: boolean): this;
}
export declare function Fieldset(child?: View): FieldsetTag;
export declare function Legend(child?: View): Tag;
export declare class OutputTag extends Tag<OutputTag> {
    for?: string;
    name?: string;
    setFor(forId?: string): this;
    setName(name?: string): this;
}
export declare function Output(child?: View): OutputTag;
//# sourceMappingURL=forms.d.ts.map