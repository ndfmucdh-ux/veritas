import { useEffect, useRef } from "react";

// The screen currently on display registers its reload function here;
// the PullToRefresh indicator in the app shell calls it.
let current = null;

export const getRefreshHandler = () => current;

export function usePullToRefresh(reload) {
  const ref = useRef(reload);
  ref.current = reload;
  useEffect(() => {
    const handler = () => ref.current?.();
    current = handler;
    return () => { if (current === handler) current = null; };
  }, []);
}