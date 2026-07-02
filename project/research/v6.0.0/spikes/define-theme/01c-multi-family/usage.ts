import { Div } from "./fluent-mock.ts";
import "./theme.ts";

// Custom tokens — both families typo-checked from the single `tokens` const.
Div().background("forest");    // 4: ✓ custom color
Div().background("frest");     // 5: ✗ typo color   — want ERROR
Div().padding("gutter");       // 6: ✓ custom spacing
Div().padding("guttr");        // 7: ✗ typo spacing — want ERROR
Div().background("blue-500");  // 8: ✓ built-in color
Div().padding("4");            // 9: ✓ built-in spacing
