import { animate, type MotionValue, useMotionValue } from "framer-motion";
import { useEffect } from "react";

const inactiveShadow = "var(--shadow-sm)";

export function useRaisedShadow(value: MotionValue<number>) {
  const boxShadow = useMotionValue(inactiveShadow);

  useEffect(() => {
    let isActive = false;

    const unsubscribeValue = value.on("change", (latest) => {
      const wasActive = isActive;
      if (latest !== 0) {
        isActive = true;
        if (isActive !== wasActive) {
          animate(boxShadow, "var(--shadow-md)");
        }
      } else {
        isActive = false;
        if (isActive !== wasActive) {
          animate(boxShadow, inactiveShadow);
        }
      }
    });

    return () => {
      unsubscribeValue();
    };
  }, [value, boxShadow]);

  return boxShadow;
}
