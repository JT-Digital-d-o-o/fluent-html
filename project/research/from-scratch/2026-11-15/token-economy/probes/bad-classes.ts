// Seeded class mistakes for tools/check-classes.mjs. tsc accepts this file: these are the
// mistakes the type system cannot see.
import { div, tw } from "#lt";

const card = tw`p-6 bg-surface rounded-card`;

export const c01 = div(tw`flex gap-4 bg-gray-100`, "palette literal under a closed palette");
export const c02 = div(tw`text-smm font-medium`, "typo");
export const c03 = div(tw`bg-primry text-on-accent`, "theme color typo");
export const c04 = div(tw`hover:${card} mt-4`, "variant prefix on a preset");
export const c05 = div(tw`hovr:bg-surface`, "unknown variant");
export const c06 = div(tw`Hello world`, "text written as classes");
