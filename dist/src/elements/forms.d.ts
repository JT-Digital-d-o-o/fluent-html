import { Tag } from "../core/tag.js";
import type { View } from "../core/types.js";
import type { Id } from "../ids.js";
import type { InputType, NumericInputType, DateTimeInputType, NoMinMaxInputType, AutocompleteHint, FormMethod, BrowsingContext, InputMode, CommandFor } from "./html-types.js";
/**
 * Specialized Tag for `<input>` elements with typed attribute setters.
 *
 * @example
 * Input().setType("email").setName("email").setPlaceholder("you@example.com")
 */
export declare class InputTag extends Tag {
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
    inputmode?: InputMode;
    capture?: 'user' | 'environment';
    list?: string;
    setType(type?: InputType): this;
    setPlaceholder(placeholder?: string): this;
    setName(name?: string): this;
    setValue(value?: string): this;
    setAccept(accept?: string): this;
    setMin(min?: number | string): this;
    setMax(max?: number | string): this;
    setStep(step?: number | 'any'): this;
    setPattern(pattern?: string): this;
    setMinlength(minlength?: number): this;
    setMaxlength(maxlength?: number): this;
    setAutocomplete(autocomplete?: AutocompleteHint): this;
    setInputmode(inputmode?: InputMode): this;
    /** Set `capture` — hints the camera/mic source for file inputs on mobile. */
    setCapture(capture?: 'user' | 'environment'): this;
    setList(list?: string): this;
}
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
export declare function Input(): InputTag;
export declare function Input(type: NumericInputType): NumericInputTag;
export declare function Input(type: DateTimeInputType): DateTimeInputTag;
export declare function Input(type: NoMinMaxInputType): NoMinMaxInputTag;
/**
 * Specialized Tag for `<textarea>` elements with typed attribute setters.
 *
 * @example
 * Textarea().setName("comment").setRows(5).setPlaceholder("Write a comment...")
 */
export declare class TextareaTag extends Tag {
    placeholder?: string;
    name?: string;
    rows?: number;
    cols?: number;
    minlength?: number;
    maxlength?: number;
    wrap?: 'hard' | 'soft' | 'off';
    autocomplete?: AutocompleteHint;
    inputmode?: InputMode;
    setPlaceholder(placeholder?: string): this;
    setName(name?: string): this;
    setRows(rows?: number): this;
    setCols(cols?: number): this;
    setMinlength(minlength?: number): this;
    setMaxlength(maxlength?: number): this;
    setWrap(wrap?: 'hard' | 'soft' | 'off'): this;
    setAutocomplete(autocomplete?: AutocompleteHint): this;
    setInputmode(inputmode?: InputMode): this;
}
/** Create a `<textarea>` element with typed attribute methods. */
export declare function Textarea(...children: View[]): TextareaTag;
/**
 * Specialized Tag for `<button>` elements with typed attribute setters.
 *
 * @example
 * Button("Submit").setType("submit").toggle("disabled", isLoading)
 */
export declare class ButtonTag extends Tag {
    type?: 'submit' | 'reset' | 'button';
    name?: string;
    value?: string;
    formaction?: string;
    formmethod?: 'get' | 'post';
    command?: CommandFor;
    commandfor?: string;
    setType(type?: 'submit' | 'reset' | 'button'): this;
    /**
     * Set the invoker `command` (Commands API) — a JS-free, nonce-free way to drive a
     * `<dialog>` or popover from a `<button>`. Closed over the native verbs
     * (`show-modal`/`close`/`request-close`/`show-popover`/`hide-popover`/`toggle-popover`);
     * a `--`-prefixed value is an author command that fires a `CommandEvent`. Pair with
     * `setCommandfor`. The `openDialog`/`closeDialog` behaviors remain for htmx-event cases.
     *
     * @example
     * Button("Edit").setCommand("show-modal").setCommandfor(ids.dialog)
     */
    setCommand(command: CommandFor): this;
    /** Wire this invoker to its target element by `Id`, rendering `commandfor="<id>"`. */
    setCommandfor(target: Id): this;
    setName(name?: string): this;
    setValue(value?: string): this;
    setFormaction(formaction?: string): this;
    setFormmethod(formmethod?: 'get' | 'post'): this;
}
/** Create a `<button>` element with typed attribute methods. */
export declare function Button(...children: View[]): ButtonTag;
export declare class LabelTag extends Tag {
    for?: string;
    setFor(forId?: string): this;
}
export declare function Label(...children: View[]): LabelTag;
export declare class FormTag extends Tag {
    action?: string;
    method?: FormMethod;
    enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
    target?: BrowsingContext;
    autocomplete?: 'on' | 'off';
    setAction(action?: string): this;
    setMethod(method?: FormMethod): this;
    setEnctype(enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'): this;
    setTarget(target?: BrowsingContext): this;
    setAutocomplete(autocomplete?: 'on' | 'off'): this;
    /** Set `enctype="multipart/form-data"` (required for file uploads). */
    multipart(): this;
}
/** A `{ field: "message" }` map of validation errors, keyed by `T`'s fields. */
export type ErrorBag<T> = Partial<Record<keyof T & string, string>>;
/** Prefill values + validation errors that `Form<T>` auto-wires into its controls. */
export type FormState<T> = {
    values?: Partial<T>;
    errors?: ErrorBag<T>;
};
/** A `<select>` option descriptor — `Form<T>` builds the `<option>`s and marks the selected one. */
export type SelectOption = {
    value: string;
    label: string;
};
/**
 * Typed control factories given to the `Form<T>` builder. Each field name is
 * constrained to `keyof T`, so a typo is a compile error; values/errors are wired
 * from the form's `state`.
 */
export interface FormBinding<T> {
    input(name: keyof T & string, type?: InputType): InputTag;
    textarea(name: keyof T & string): TextareaTag;
    select(name: keyof T & string, options: readonly SelectOption[]): SelectTag;
    hidden(name: keyof T & string, value: string): InputTag;
    /** The field's error message (an unstyled `<span>`), or nothing when there's no error. */
    error(name: keyof T & string): View;
}
/** Create a `<form>` element with typed attribute methods. */
export declare function Form(...children: View[]): FormTag;
/** Typed-binding form: the builder gets control factories constrained to `keyof T` (no prefill). */
export declare function Form<T>(build: (f: FormBinding<T>) => View): FormTag;
/** Typed-binding form with `state` — values/errors auto-wire into the controls. */
export declare function Form<T>(state: FormState<T> | undefined, build: (f: FormBinding<T>) => View): FormTag;
export declare class SelectTag extends Tag {
    name?: string;
    size?: number;
    setName(name?: string): this;
    setSize(size?: number): this;
}
export declare function Select(...children: View[]): SelectTag;
export declare class OptionTag extends Tag {
    value?: string;
    label?: string;
    setValue(value?: string): this;
    setLabel(label?: string): this;
}
export declare function Option(...children: View[]): OptionTag;
export declare class OptgroupTag extends Tag {
    label?: string;
    setLabel(label?: string): this;
}
export declare function Optgroup(...children: View[]): OptgroupTag;
export declare function Datalist(...children: View[]): Tag;
export declare class FieldsetTag extends Tag {
    name?: string;
    setName(name?: string): this;
}
export declare function Fieldset(...children: View[]): FieldsetTag;
export declare function Legend(...children: View[]): Tag;
export declare class OutputTag extends Tag {
    for?: string;
    name?: string;
    setFor(forId?: string): this;
    setName(name?: string): this;
}
export declare function Output(...children: View[]): OutputTag;
//# sourceMappingURL=forms.d.ts.map