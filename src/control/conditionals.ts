import type { View, Thunk } from "../core/types.js";
import { Empty } from "../core/utils.js";

export function IfThenElse(
  condition: boolean,
  thenBranch: Thunk<View>,
  elseBranch: Thunk<View>,
): View {
  return condition
    ? thenBranch()
    : elseBranch();
}

export function IfThen(
  condition: boolean,
  then: Thunk<View>,
): View {
  return IfThenElse(
    condition,
    then,
    Empty,
  );
}

type Case = { condition: boolean, component: Thunk<View> };
export function SwitchCase(
  cases: Case[],
  defaultView: Thunk<View> = Empty
): View {
  for (const caseItem of cases) {
    if (caseItem.condition) {
      return caseItem.component();
    }
  }
  return defaultView();
}
