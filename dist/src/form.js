import { Input, Textarea, Select } from "./elements/forms.js";
/**
 * Creates a type-safe form field factory constrained to keys of `T`.
 *
 * Field names are checked at compile time — typos cause a type error
 * instead of silently passing through to the server.
 *
 * @example
 * type CreateUserReq = { email: string; name: string; role: "admin" | "viewer" };
 * const f = formFor<CreateUserReq>();
 *
 * Form(
 *   f.input("email", "email"),        // ✓
 *   f.input("name", "text"),          // ✓
 *   f.input("nmae", "text"),          // ✗ compile error
 *   f.select("role",
 *     Option("Admin").setValue("admin"),
 *     Option("Viewer").setValue("viewer"),
 *   ),
 * )
 */
export function formFor() {
    return {
        input(name, type) {
            const tag = type ? Input(type) : Input();
            return tag.setName(name);
        },
        textarea(name) {
            return Textarea().setName(name);
        },
        select(name, ...children) {
            return Select(...children).setName(name);
        },
        hidden(name, value) {
            return Input("hidden").setName(name).setValue(value);
        },
    };
}
//# sourceMappingURL=form.js.map