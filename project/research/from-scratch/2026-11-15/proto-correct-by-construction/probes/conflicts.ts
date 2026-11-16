// What tsc cannot see and tools/check.mjs can: two classes in one list that set the same properties.
import { cls, hover, md } from "#st";

const card = cls("p-6 bg-surface rounded-card");
export const flush = cls(card, "p-0"); // p-6 and p-0
export const both = cls("flex items-center inline-flex"); // flex and inline-flex
export const hovered = cls("underline", hover("bg-surface-2 bg-primary")); // two backgrounds under hover
export const fine = cls("text-sm text-text-dim border border-line px-4 py-2 shadow-md ring-2", hover("bg-surface-2"), md("p-0")); // no conflict: md:p-0 is another variant
