const LoadingSpinner = ({
  message = "Loading...",
  fullHeight = true,
  variant = "surface", // overlay | surface
  className = "",
  minHeightClass = "min-h-[calc(100vh-200px)]",
}) => {
  const containerClasses = [
    fullHeight ? minHeightClass : "",
    "flex items-center justify-center",
    variant === "surface" ? "themed-surface" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-accent)] mx-auto mb-4"></div>
        <p className="text-[var(--color-text)]">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
