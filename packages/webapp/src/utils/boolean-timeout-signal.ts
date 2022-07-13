import { createSignal, createEffect } from "solid-js";

export function createBooleanTimeoutSignal(timeout: number = 2000) {
  const [state, setState] = createSignal(false);
  let timeoutRef;

  createEffect(() => {
    if (state()) {
      timeoutRef = setTimeout(() => {
        setState(false);
      }, 2000);
    } else {
      clearTimeout(timeoutRef);
    }
  });

  return [state, setState] as const;
}
