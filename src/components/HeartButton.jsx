import { useState } from "react";

// Reusable heart (favorite) toggle button
// Props:
// - size: diameter in px (default 40)
// - initialActive: start as favorited
// - onToggle: callback(newState)
// - className: extra tailwind classes
export default function HeartButton({
  size = 40,
  initialActive = false,
  onToggle,
  className = "",
}) {
  const [active, setActive] = useState(initialActive);
  const toggle = (e) => {
    e.preventDefault(); // prevent parent Link navigation when inside cards
    const next = !active;
    setActive(next);
    onToggle && onToggle(next);
  };
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={toggle}
      className={`group relative flex items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill={active ? "#e0245e" : "none"}
        className="transition-colors drop-shadow-sm"
      >
        <path
          d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z"
          stroke={active ? "#e0245e" : "white"}
          strokeWidth="2"
        />
      </svg>
      <span className="absolute inset-0 rounded-full bg-black/30 group-hover:bg-black/50 -z-10" />
    </button>
  );
}
