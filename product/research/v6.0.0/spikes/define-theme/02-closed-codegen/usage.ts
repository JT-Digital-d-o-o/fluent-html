import { Div } from "./fluent-mock.ts";
// No theme import — the augmentation comes from generated-theme.d.ts (tsconfig `files`).

// Same six DX cases as spikes 00 / 01.
Div().background("blue-500");     // 1 known token             — want OK
Div().background("forest");       // 2 custom token (generated)— want OK + autocomplete
Div().background("frest");        // 3 TYPO of "forest"        — want ERROR
Div().background("[#1a2b3c]");    // 4 arbitrary value         — want OK
Div().background("blue-500/50");  // 5 base + opacity modifier — want OK
Div().background("forest/50");    // 6 custom + opacity        — want OK
