import { Div } from "./fluent-mock.ts";
import "./theme.ts"; // brings the `declare module` augmentation into the program

// Same six DX cases as spike 00.
Div().background("blue-500");     // 1 known token             — want OK
Div().background("forest");       // 2 custom token (in theme) — want OK + autocomplete
Div().background("frest");        // 3 TYPO of "forest"        — want ERROR
Div().background("[#1a2b3c]");    // 4 arbitrary value         — want OK
Div().background("blue-500/50");  // 5 base + opacity modifier — want OK
Div().background("forest/50");    // 6 custom + opacity        — want OK
