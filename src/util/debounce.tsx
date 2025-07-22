import { useEffect, useCallback, useRef } from "preact/hooks";

interface DebouncedCallback<T extends (...args: any) => any> {
  (...args: Parameters<T>): void;
}

export function useDebouncedCallback<T extends (...args: any) => any>(
  callback: T,
  delay: number,
): DebouncedCallback<T> {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const callbackRef = useRef<T>(callback);
  callbackRef.current = callback;

  const debouncedCallback = useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}
