import type { View } from "./core/types.js";
import type { InputType } from "./elements/html-types.js";
import { Input, Textarea, Select } from "./elements/forms.js";
import type { InputTag, TextareaTag, SelectTag } from "./elements/forms.js";

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
export function formFor<T extends Record<string, unknown>>() {
  return {
    input<K extends keyof T & string>(name: K, type?: InputType): InputTag {
      const tag = type ? (Input as (t: InputType) => InputTag)(type) : Input();
      return tag.setName(name);
    },
    textarea<K extends keyof T & string>(name: K): TextareaTag {
      return Textarea().setName(name);
    },
    select<K extends keyof T & string>(name: K, ...children: View[]): SelectTag {
      return Select(...children).setName(name);
    },
    hidden<K extends keyof T & string>(name: K, value: string): InputTag {
      return Input("hidden").setName(name).setValue(value);
    },
  };
}
