// Deliberately-wrong probe fixture for test/setter-errors.test.ts — the blind
// unprefixed-setter guesses an LLM makes most often. Excluded from the root
// tsconfig (it must NOT compile); the test runs the real checker over it and
// pins the diagnostic SHAPE: a missing-property error (TS2339/TS2551), never
// the pre-privatization "Type 'String' has no call signatures" cascade
// (TS2349) a public storage field used to produce.

import { Img, Input, Div, Form, Button, A, Script, Svg } from "../../../src/index.js";

Img().src("/photo.jpg");
Img().alt("A photo");
Input().value("x");
Input().placeholder("Search");
Input().autocomplete("email");
Button().type("submit");
A("home").href("/");
Script().src("/app.js");
Div().id("main");
Svg().viewBox("0 0 24 24");
Form().enctype;
Form().action;
