import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";

const PageLoader = ({
  loading: externalLoading,
  message = "Loading...",
  children,
  overlay = false,
  minHeight = "min-h-[calc(100vh-200px)]",
  sessionKey = null, // If provided, only show loading on first visit
  duration = 500,
}) => {
  const hasVisited = sessionKey ? sessionStorage.getItem(sessionKey) : false;
  const [internalLoading, setInternalLoading] = useState(
    sessionKey ? !hasVisited : false
  );

  useEffect(() => {
    if (sessionKey && !hasVisited) {
      const timer = setTimeout(() => {
        setInternalLoading(false);
        sessionStorage.setItem(sessionKey, "true");
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [sessionKey, hasVisited, duration]);

  // Use internal loading if sessionKey is provided, otherwise use external
  const loading = sessionKey ? internalLoading : externalLoading;

  if (overlay) {
    return (
      <div className={`relative ${minHeight}`}>
        {children}
        {loading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-[var(--color-bg)]/80 backdrop-blur-sm">
            <LoadingSpinner
              message={message}
              fullHeight={false}
              variant="overlay"
            />
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
