"use client";

import { animate, useInView, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function Counter({
  to,
  suffix = "+",
}: {
  to: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest));
  const [value, setValue] = useState(0);

  useEffect(() => {
    const unsubscribe = rounded.on("change", latest => {
      setValue(latest);
    });

    if (inView) {
      const controls = animate(count, to, {
        duration: 1.8,
        ease: "easeOut",
      });

      return () => {
        controls.stop();
        unsubscribe();
      };
    }

    return () => unsubscribe();
  }, [inView, count, rounded, to]);

  return (
    <span ref={ref}>
      {value.toLocaleString("vi-VN")}
      {suffix}
    </span>
  );
}
