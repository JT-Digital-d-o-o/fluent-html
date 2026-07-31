import { defineSchemaKeys } from "../core/proto.js";
import { Tag } from "../core/tag.js";
import { El, Empty } from "../core/utils.js";
import type { View } from "../core/types.js";
import type { Id } from "../ids.js";
import { extractId } from "../ids.js";
import type { InputType, NumericInputType, DateTimeInputType, NoMinMaxInputType, AutocompleteHint, FormEnctype, FormMethod, BrowsingContext, InputMode, CommandFor } from "./html-types.js";

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
  inputmode?: InputMode;
  capture?: 'user' | 'environment';
  list?: string;
  dirname?: string;

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

  setAccept(accept?: string): this;
  setAccept(accept: readonly string[]): this;
  setAccept(accept?: string | readonly string[]): this {
    this.accept = Array.isArray(accept)
      ? (accept.length ? accept.join(',') : undefined)
      : (accept as string | undefined);
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

  setInputmode(inputmode?: InputMode): this {
    this.inputmode = inputmode;
    return this;
  }

  /** Set `capture` — hints the camera/mic source for file inputs on mobile. */
  setCapture(capture?: 'user' | 'environment'): this {
    this.capture = capture;
    return this;
  }

  setList(list?: string | Id): this {
    this.list = list === undefined ? undefined : extractId(list);
    return this;
  }

  setDirname(dirname?: string): this {
    this.dirname = dirname;
    return this;
  }
}

defineSchemaKeys(InputTag, ['type', 'name', 'placeholder', 'value', 'accept', 'min', 'max', 'step', 'pattern', 'minlength', 'maxlength', 'autocomplete', 'inputmode', 'capture', 'list', 'dirname']);

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
  // Storage is `wrapMode` (aliased to the `wrap` attribute in the schema) so the
  // field doesn't shadow Tag's `.wrap()` styling method.
  wrapMode?: 'hard' | 'soft' | 'off';
  autocomplete?: AutocompleteHint;
  inputmode?: InputMode;
  dirname?: string;

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
    this.wrapMode = wrap;
    return this;
  }

  setAutocomplete(autocomplete?: AutocompleteHint): this {
    this.autocomplete = autocomplete;
    return this;
  }

  setInputmode(inputmode?: InputMode): this {
    this.inputmode = inputmode;
    return this;
  }

  setDirname(dirname?: string): this {
    this.dirname = dirname;
    return this;
  }
}

defineSchemaKeys(TextareaTag, ['name', 'placeholder', 'rows', 'cols', 'minlength', 'maxlength', ['wrapMode', 'wrap'], 'autocomplete', 'inputmode', 'dirname']);

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
  formmethod?: FormMethod;
  formtarget?: BrowsingContext;
  formenctype?: FormEnctype;
  command?: CommandFor;
  commandfor?: string;

  setType(type?: 'submit' | 'reset' | 'button'): this {
    this.type = type;
    return this;
  }

  /**
   * Set the invoker `command` (Commands API) — a JS-free, nonce-free way to drive a
   * `<dialog>` or popover from a `<button>`. Closed over the native verbs
   * (`show-modal`/`close`/`request-close`/`show-popover`/`hide-popover`/`toggle-popover`);
   * a `--`-prefixed value is an author command that fires a `CommandEvent`. Pair with
   * `setCommandfor`. Modal dialogs are always native (this API + `setClosedby`) —
   * non-modal/responsive overlays are the `drawer` behavior verb.
   *
   * @example
   * Button("Edit").setCommand("show-modal").setCommandfor(ids.dialog)
   */
  setCommand(command: CommandFor): this {
    this.command = command;
    return this;
  }

  /** Wire this invoker to its target element by `Id`, rendering `commandfor="<id>"`. */
  setCommandfor(target: Id): this {
    this.commandfor = extractId(target);
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

  /** Override the form's method for this submit button. `"dialog"` closes an ancestor `<dialog>` with the button's value. */
  setFormmethod(formmethod?: FormMethod): this {
    this.formmethod = formmethod;
    return this;
  }

  setFormtarget(formtarget?: BrowsingContext): this {
    this.formtarget = formtarget;
    return this;
  }

  setFormenctype(formenctype?: FormEnctype): this {
    this.formenctype = formenctype;
    return this;
  }
}

defineSchemaKeys(ButtonTag, ['type', 'name', 'value', 'formaction', 'formmethod', 'formtarget', 'formenctype', 'command', 'commandfor']);

/** Create a `<button>` element with typed attribute methods. */
export function Button(...children: View[]): ButtonTag {
  return new ButtonTag("button", ...children);
}

export class LabelTag extends Tag {
  for?: string;

  setFor(forId?: string | Id): this {
    this.for = forId === undefined ? undefined : extractId(forId);
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
  enctype?: FormEnctype;
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

  setEnctype(enctype?: FormEnctype): this {
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

  /** Set `enctype="multipart/form-data"` (required for file uploads). */
  multipart(): this {
    this.enctype = 'multipart/form-data';
    return this;
  }
}

defineSchemaKeys(FormTag, ['action', 'method', 'enctype', 'target', 'autocomplete']);

// ── Typed form binding (B-01) ───────────────────────────────────────

/** A `{ field: "message" }` map of validation errors, keyed by `T`'s fields. */
export type ErrorBag<T> = Partial<Record<keyof T & string, string>>;

/**
 * Prefill values + validation errors that `Form<T>` auto-wires into its controls.
 * `idPrefix` namespaces every control `id` (and its `label for` / error `aria-describedby`)
 * as `${idPrefix}-${name}` — set it when two forms on one page share a field name so their
 * default `id={name}` don't collide.
 */
export type FormState<T> = { values?: Partial<T>; errors?: ErrorBag<T>; idPrefix?: string };

/** A `<select>` option descriptor — `Form<T>` builds the `<option>`s and marks the selected one. */
export type SelectOption = { value: string; label: string };

/**
 * Typed control factories given to the `Form<T>` builder. Each field name is
 * constrained to `keyof T`, so a typo is a compile error; values/errors are wired
 * from the form's `state`.
 */
export interface FormBinding<T> {
  input(name: keyof T & string, type?: InputType): InputTag;
  textarea(name: keyof T & string): TextareaTag;
  select(name: keyof T & string, options: readonly SelectOption[]): SelectTag;
  /**
   * A checkbox bound to a boolean field — `checked` reflects `Boolean(state.values[name])`.
   * Pass `value` for the submitted value (HTML defaults to `"on"` when omitted).
   */
  checkbox(name: keyof T & string, value?: string): InputTag;
  /** A radio in the `name` group — `checked` when `String(state.values[name])` equals `value`. */
  radio(name: keyof T & string, value: string): InputTag;
  hidden(name: keyof T & string, value: string): InputTag;
  /**
   * A `<label>` bound to the `name` control — `for` targets the control's default id, so no
   * stringly id/for repetition. Use the correct HTML for radio groups instead (a `Fieldset` +
   * `Legend`, or wrap each `radio()` in its own `Label`), since one `for` can't target a group.
   */
  label(name: keyof T & string, ...children: View[]): LabelTag;
  /** The field's error message (an unstyled `<span>`), or nothing when there's no error. */
  error(name: keyof T & string): View;
}

function createFormBinding<T>(state?: FormState<T>): FormBinding<T> {
  const values = (state?.values ?? {}) as Record<string, unknown>;
  const errors = (state?.errors ?? {}) as Record<string, string | undefined>;
  const prefix = state?.idPrefix;
  // The deterministic control id derived from the field name (+ optional form prefix). Every
  // bound control gets it, so `label`'s `for` and `error`'s `aria-describedby` line up with no
  // hand-written id — the id/name/for triple-repetition the typed binding exists to kill.
  const controlId = (name: string): string => (prefix ? `${prefix}-${name}` : name);
  const errorId = (name: string): string => `${controlId(name)}-error`;
  // When the field has a bound error, mark the control invalid and link it to its message span,
  // so assistive tech and the `aria-invalid:`/`invalid:` Tailwind variant both see the error state.
  const markInvalid = <E extends Tag>(tag: E, name: string): E => {
    if (errors[name] !== undefined) tag.setAria({ invalid: true, describedby: errorId(name) });
    return tag;
  };
  return {
    input(name, type) {
      // Cast past Input's narrowed overloads — the binding accepts any InputType.
      const tag = type ? (Input as (t: InputType) => InputTag)(type) : Input();
      tag.setName(name).setId(controlId(name));
      const v = values[name];
      if (v !== undefined && v !== null) tag.setValue(String(v));
      return markInvalid(tag, name);
    },
    textarea(name) {
      const v = values[name];
      // A textarea's value is its text content, not a `value` attribute.
      const tag = v !== undefined && v !== null ? Textarea(String(v)) : Textarea();
      return markInvalid(tag.setName(name).setId(controlId(name)), name);
    },
    select(name, options) {
      const selected = values[name];
      const opts = options.map((o) => {
        const opt = Option(o.label).setValue(o.value);
        if (selected !== undefined && String(selected) === o.value) opt.toggle("selected");
        return opt;
      });
      return markInvalid(Select(...opts).setName(name).setId(controlId(name)), name);
    },
    checkbox(name, value) {
      const tag = Input("checkbox").setName(name).setId(controlId(name));
      if (value !== undefined) tag.setValue(value);
      // checked reflects a boolean field (terms-accepted, is-active, …)
      return markInvalid(tag.toggle("checked", Boolean(values[name])), name);
    },
    radio(name, value) {
      // Each radio in the group gets a unique `${id}-${value}` id (one `id={name}` per option
      // would duplicate). checked when this value matches the bound field across the shared group.
      return markInvalid(Input("radio").setName(name).setId(`${controlId(name)}-${value}`).setValue(value).toggle("checked", String(values[name]) === value), name);
    },
    hidden(name, value) {
      // Hidden controls take no label, so no id.
      return Input("hidden").setName(name).setValue(value);
    },
    label(name, ...children) {
      return Label(...children).setFor(controlId(name));
    },
    error(name) {
      const message = errors[name];
      // Unstyled span (the styled FieldError shell lives in @jtdigital/ui), id-linked to the
      // control via `aria-describedby` so the message and its input are wired as one unit.
      return message ? El("span", message).setId(errorId(name)) : Empty();
    },
  };
}

/** Create a `<form>` element with typed attribute methods. */
export function Form(...children: View[]): FormTag;
/** Typed-binding form: the builder gets control factories constrained to `keyof T` (no prefill). */
export function Form<T>(build: (f: FormBinding<T>) => View): FormTag;
/** Typed-binding form with `state` — values/errors auto-wire into the controls. */
export function Form<T>(state: FormState<T> | undefined, build: (f: FormBinding<T>) => View): FormTag;
export function Form(...args: unknown[]): FormTag {
  // Form(build) — typed binding, no state
  if (typeof args[0] === "function") {
    const build = args[0] as (f: FormBinding<unknown>) => View;
    return new FormTag("form", build(createFormBinding()));
  }
  // Form(state, build) — typed binding with prefill
  if (args.length === 2 && typeof args[1] === "function") {
    const state = args[0] as FormState<unknown> | undefined;
    const build = args[1] as (f: FormBinding<unknown>) => View;
    return new FormTag("form", build(createFormBinding(state)));
  }
  // Form(...children) — plain element factory
  return new FormTag("form", ...(args as View[]));
}

export class SelectTag extends Tag {
  name?: string;
  size?: number;
  autocomplete?: AutocompleteHint;

  setName(name?: string): this {
    this.name = name;
    return this;
  }

  setSize(size?: number): this {
    this.size = size;
    return this;
  }

  setAutocomplete(autocomplete?: AutocompleteHint): this {
    this.autocomplete = autocomplete;
    return this;
  }
}

defineSchemaKeys(SelectTag, ['name', 'size', 'autocomplete']);

export function Select(...children: View[]): SelectTag {
  return new SelectTag("select", ...children);
}

export class OptionTag extends Tag {
  value?: string;
  label?: string;

  setValue(value?: string): this {
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

  setFor(...forIds: (string | Id)[]): this {
    this.for = forIds.length
      ? forIds.map(extractId).map(s => s.trim()).filter(Boolean).join(' ')
      : undefined;
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
