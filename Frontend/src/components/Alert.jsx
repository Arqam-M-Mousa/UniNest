import { useEffect } from "react";

const Alert = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  type = "info", // info, warning, success, error
  iconOverride,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const iconConfig = {
    info: {
      bg: "bg-blue-500/20",
      color: "text-blue-500",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    warning: {
      bg: "bg-[var(--color-accent)]/20",
      color: "text-[var(--color-accent)]",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
    success: {
      bg: "bg-green-500/20",
      color: "text-green-500",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    error: {
      bg: "bg-red-500/20",
      color: "text-red-500",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  const config = iconConfig[type];
  const iconNode = iconOverride || config.icon;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="themed-surface-alt border border-[var(--color-accent)]/30 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-4">
          {/* Icon */}
          <div
            className={`w-16 h-16 rounded-full ${config.bg} flex items-center justify-center`}
          >
            <div className={config.color}>{iconNode}</div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-[var(--color-text)]">
            {title}
          </h3>

          {/* Message */}
          <p className="text-[var(--color-text-soft)] text-sm leading-relaxed">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3 w-full mt-4">
            {onConfirm && (
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 px-6 py-3 rounded-full btn-primary hover:scale-105 transition-transform font-medium"
              >
                {confirmText}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-full border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors font-medium"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
