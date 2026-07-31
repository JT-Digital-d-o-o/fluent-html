import { defineSchemaKeys } from "../core/proto.js";
import { Tag } from "../core/tag.js";
import { El, Empty } from "../core/utils.js";
import { extractId } from "../ids.js";
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
        this.accept = Array.isArray(accept)
            ? (accept.length ? accept.join(',') : undefined)
            : accept;
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
    setInputmode(inputmode) {
        this.inputmode = inputmode;
        return this;
    }
    /** Set `capture` — hints the camera/mic source for file inputs on mobile. */
    setCapture(capture) {
        this.capture = capture;
        return this;
    }
    setList(list) {
        this.listId = list === undefined ? undefined : extractId(list);
        return this;
    }
    setDirname(dirname) {
        this.dirname = dirname;
        return this;
    }
}
defineSchemaKeys(InputTag, ['type', 'name', 'placeholder', 'value', 'accept', 'min', 'max', 'step', 'pattern', 'minlength', 'maxlength', 'autocomplete', 'inputmode', 'capture', ['listId', 'list'], 'dirname']);
export function Input(type) {
    const tag = new InputTag("input");
    if (type)
        tag.type = type;
    return tag;
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
        this.wrapMode = wrap;
        return this;
    }
    setAutocomplete(autocomplete) {
        this.autocomplete = autocomplete;
        return this;
    }
    setInputmode(inputmode) {
        this.inputmode = inputmode;
        return this;
    }
    setDirname(dirname) {
        this.dirname = dirname;
        return this;
    }
}
defineSchemaKeys(TextareaTag, ['name', 'placeholder', 'rows', 'cols', 'minlength', 'maxlength', ['wrapMode', 'wrap'], 'autocomplete', 'inputmode', 'dirname']);
/** Create a `<textarea>` element with typed attribute methods. */
export function Textarea(...children) {
    return new TextareaTag("textarea", ...children);
}
/**
 * Specialized Tag for `<button>` elements with typed attribute setters.
 *
 * @example
 * Button("Submit").setType("submit").toggle("disabled", isLoading)
 */
export class ButtonTag extends Tag {
    setType(type) {
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
    setCommand(command) {
        this.command = command;
        return this;
    }
    /** Wire this invoker to its target element by `Id`, rendering `commandfor="<id>"`. */
    setCommandfor(target) {
        this.commandfor = extractId(target);
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
    setFormaction(formaction) {
        this.formaction = formaction;
        return this;
    }
    /** Override the form's method for this submit button. `"dialog"` closes an ancestor `<dialog>` with the button's value. */
    setFormmethod(formmethod) {
        this.formmethod = formmethod;
        return this;
    }
    setFormtarget(formtarget) {
        this.formtarget = formtarget;
        return this;
    }
    setFormenctype(formenctype) {
        this.formenctype = formenctype;
        return this;
    }
}
defineSchemaKeys(ButtonTag, ['type', 'name', 'value', 'formaction', 'formmethod', 'formtarget', 'formenctype', 'command', 'commandfor']);
/** Create a `<button>` element with typed attribute methods. */
export function Button(...children) {
    return new ButtonTag("button", ...children);
}
export class LabelTag extends Tag {
    setFor(forId) {
        this.for = forId === undefined ? undefined : extractId(forId);
        return this;
    }
}
defineSchemaKeys(LabelTag, ['for']);
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
    setAutocomplete(autocomplete) {
        this.autocomplete = autocomplete;
        return this;
    }
    /** Set `enctype="multipart/form-data"` (required for file uploads). */
    multipart() {
        this.enctype = 'multipart/form-data';
        return this;
    }
}
defineSchemaKeys(FormTag, ['action', 'method', 'enctype', 'target', 'autocomplete']);
function createFormBinding(state) {
    const values = (state?.values ?? {});
    const errors = (state?.errors ?? {});
    const prefix = state?.idPrefix;
    // The deterministic control id derived from the field name (+ optional form prefix). Every
    // bound control gets it, so `label`'s `for` and `error`'s `aria-describedby` line up with no
    // hand-written id — the id/name/for triple-repetition the typed binding exists to kill.
    const controlId = (name) => (prefix ? `${prefix}-${name}` : name);
    const errorId = (name) => `${controlId(name)}-error`;
    // When the field has a bound error, mark the control invalid and link it to its message span,
    // so assistive tech and the `aria-invalid:`/`invalid:` Tailwind variant both see the error state.
    const markInvalid = (tag, name) => {
        if (errors[name] !== undefined)
            tag.setAria({ invalid: true, describedby: errorId(name) });
        return tag;
    };
    return {
        input(name, type) {
            // Cast past Input's narrowed overloads — the binding accepts any InputType.
            const tag = type ? Input(type) : Input();
            tag.setName(name).setId(controlId(name));
            const v = values[name];
            if (v !== undefined && v !== null)
                tag.setValue(String(v));
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
                if (selected !== undefined && String(selected) === o.value)
                    opt.toggle("selected");
                return opt;
            });
            return markInvalid(Select(...opts).setName(name).setId(controlId(name)), name);
        },
        checkbox(name, value) {
            const tag = Input("checkbox").setName(name).setId(controlId(name));
            if (value !== undefined)
                tag.setValue(value);
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
export function Form(...args) {
    // Form(build) — typed binding, no state
    if (typeof args[0] === "function") {
        const build = args[0];
        return new FormTag("form", build(createFormBinding()));
    }
    // Form(state, build) — typed binding with prefill
    if (args.length === 2 && typeof args[1] === "function") {
        const state = args[0];
        const build = args[1];
        return new FormTag("form", build(createFormBinding(state)));
    }
    // Form(...children) — plain element factory
    return new FormTag("form", ...args);
}
export class SelectTag extends Tag {
    setName(name) {
        this.name = name;
        return this;
    }
    setSize(size) {
        this.size = size;
        return this;
    }
    setAutocomplete(autocomplete) {
        this.autocomplete = autocomplete;
        return this;
    }
}
defineSchemaKeys(SelectTag, ['name', 'size', 'autocomplete']);
export function Select(...children) {
    return new SelectTag("select", ...children);
}
export class OptionTag extends Tag {
    setValue(value) {
        this.value = value;
        return this;
    }
    setLabel(label) {
        this.label = label;
        return this;
    }
}
defineSchemaKeys(OptionTag, ['value', 'label']);
export function Option(...children) {
    return new OptionTag("option", ...children);
}
export class OptgroupTag extends Tag {
    setLabel(label) {
        this.label = label;
        return this;
    }
}
defineSchemaKeys(OptgroupTag, ['label']);
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
}
defineSchemaKeys(FieldsetTag, ['name']);
export function Fieldset(...children) {
    return new FieldsetTag("fieldset", ...children);
}
export function Legend(...children) {
    return El("legend", ...children);
}
export class OutputTag extends Tag {
    setFor(...forIds) {
        this.for = forIds.length
            ? forIds.map(extractId).map(s => s.trim()).filter(Boolean).join(' ')
            : undefined;
        return this;
    }
    setName(name) {
        this.name = name;
        return this;
    }
}
defineSchemaKeys(OutputTag, ['for', 'name']);
export function Output(...children) {
    return new OutputTag("output", ...children);
}
//# sourceMappingURL=forms.js.map