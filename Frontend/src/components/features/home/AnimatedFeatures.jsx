import React, { useEffect, useRef, useState } from "react";
import { heroFeatureItems } from "./FeatureIcons";
import { useLanguage } from "../../../context/LanguageContext";

/**
 * AnimatedFeatures renders the core value / feature icons with:
 * - IntersectionObserver reveal (fade + upward motion)
 * - Staggered delays
 * - Hover glow + slight lift / scale
 * - Subtle floating animation for the icon background
 */
export default function AnimatedFeatures({ variant = "home" }) {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(0); // how many have been revealed

  useEffect(() => {
    const nodes = Array.from(
      containerRef.current?.querySelectorAll("[data-feature-item]") || []
    );
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index"));
            setVisibleCount((prev) => Math.max(prev, idx + 1));
            obs.unobserve(entry.target); // reveal once
          }
        });
      },
      { threshold: 0.35 }
    );
    nodes.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, []);

  const aboutDescriptions = [t("aboutDesc1"), t("aboutDesc2"), t("aboutDesc3")];

  return (
    <div
      ref={containerRef}
      className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3"
    >
      {heroFeatureItems.map(({ key, Icon }, idx) => {
        const isVisible = idx < visibleCount;
        return (
          <div
            key={key}
            data-feature-item
            data-index={idx}
            style={{ animationDelay: `${idx * 120}ms` }}
            className={`group flex flex-col items-center text-center transform-gpu transition-all duration-700 ease-[cubic-bezier(.16,.84,.44,1)] ${isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
              } `}
          >
            <div className="feature-icon-wrapper w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-[var(--color-bg-alt)] dark:bg-[var(--color-surface-alt)] animate-float-slow">
              <Icon
                className="w-10 h-10 text-[var(--color-accent)]"
                aria-hidden="true"
              />
            </div>
            <h3
              className={`font-semibold text-base text-[var(--color-text)] ${variant === "about" ? "uppercase tracking-wide text-sm" : ""
                }`}
            >
              {variant === "about" ? t(key) : t(key)}
            </h3>
            {variant === "about" && (
              <p className="mt-2 text-xs text-[var(--color-text-soft)] leading-relaxed max-w-[220px]">
                {aboutDescriptions[idx]}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
