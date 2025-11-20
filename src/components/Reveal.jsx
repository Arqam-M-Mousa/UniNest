import React, { useEffect, useRef, useState } from "react";

/**
 * Generic scroll-reveal wrapper.
 * Adds fade-up animation when element enters viewport.
 * Props:
 *  - as: element/component type (default 'div')
 *  - delay: ms delay before animation starts
 *  - threshold: Intersection threshold (default 0.35)
 */
export default function Reveal({
  as: Tag = "div",
  threshold = 0.2,
  className = "",
  children,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      className={`${className} ${
        visible ? "animate-fade-up" : "opacity-0 translate-y-3"
      } transform-gpu`}
    >
      {children}
    </Tag>
  );
}
