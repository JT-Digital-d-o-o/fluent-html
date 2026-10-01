import { Form, Label, Button } from "fluent-html";
import type { SignInReq } from "../auth/sign-in/sign-in.schema.js";
export const v = () => Form<SignInReq>((f) => [
  Label("Email", f.input("emial", "email")),
  Button("Sign in").setType("submit"),
]);
