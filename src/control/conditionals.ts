import type { View, Thunk } from "../core/types.js";
import { Empty } from "../core/utils.js";

export function IfThenElse(condition: boolean, thenBranch: Thunk<View>, elseBranch: Thunk<View>): View;
export function IfThenElse<T>(value: T | null | undefined, thenBranch: (value: T) => View, elseBranch: Thunk<View>): View;
export function IfThenElse<T>(
  conditionOrValue: boolean | T | null | undefined,
  thenBranch: Thunk<View> | ((value: T) => View),
  elseBranch: Thunk<View>,
): View {
  if (typeof conditionOrValue === 'boolean') {
    return conditionOrValue ? (thenBranch as Thunk<View>)() : elseBranch();
  }
  if (conditionOrValue != null) {
    return thenBranch(conditionOrValue);
  }
  return elseBranch();
}

export function IfThen(condition: boolean, then: Thunk<View>): View;
export function IfThen<T>(value: T | null | undefined, then: (value: T) => View): View;
export function IfThen<T>(
  conditionOrValue: boolean | T | null | undefined,
  then: Thunk<View> | ((value: T) => View),
): View {
  if (typeof conditionOrValue === 'boolean') {
    return conditionOrValue ? (then as Thunk<View>)() : Empty();
  }
  if (conditionOrValue != null) {
    return then(conditionOrValue);
  }
  return Empty();
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
