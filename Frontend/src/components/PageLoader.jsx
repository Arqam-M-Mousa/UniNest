import LoadingSpinner from "./LoadingSpinner";

const PageLoader = ({
  loading,
  message = "Loading...",
  children,
  overlay = false,
  minHeight = "min-h-[calc(100vh-200px)]",
}) => {
  if (overlay) {
    return (
      <div className={`relative ${minHeight}`}>
        {children}
        {loading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-[var(--color-bg)]/80 backdrop-blur-sm">
            <LoadingSpinner message={message} fullHeight={false} variant="overlay" />
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <LoadingSpinner message={message} fullHeight minHeightClass={minHeight} />
    );
  }

  return <>{children}</>;
};

export default PageLoader;
