"use client";

import { useSyncExternalStore } from "react";

const subscribeNoop = () => () => {};

// SSR 마크업과 어긋나지 않게 포털 등을 마운트 이후에만 렌더링하기 위한 훅.
export function useMounted() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}
