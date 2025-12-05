import React from "react";

// Generic tab button used in Marketplace tabs.
// Props: active (bool), onClick, children, icon (SVG JSX), className (extra)
export default function TabButton({
  active,
  onClick,
  icon,
  children,
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 font-medium text-sm transition-all ${
        active
          ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
          : "btn-outline"
      } ${className}`}
      type="button"
    >
      {icon && icon}
      {children}
    </button>
  );
}
