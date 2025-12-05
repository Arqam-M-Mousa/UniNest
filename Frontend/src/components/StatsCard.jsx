import React from "react";

// Generic stats card for property details metrics
// Props: label (string), value (string|number), className
export default function StatsCard({ label, value, className = "" }) {
  return (
    <div
      className={`themed-surface p-6 rounded-xl text-center border border-[var(--color-border)] ${className}`}
    >
      <h3 className="text-sm text-[var(--color-text-soft)] mb-2 font-medium">
        {label}
      </h3>
      <p className="text-lg text-[var(--color-text)] font-semibold m-0">
        {value}
      </p>
    </div>
  );
}
